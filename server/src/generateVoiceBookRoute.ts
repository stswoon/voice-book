import {Router} from "express";
import fse from "fs-extra";
// import {spawn} from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import {uniqueNamesGenerator, adjectives, colors, animals} from "unique-names-generator";
import {Task, TaskPool} from '@antmind/task-pool';
import {glob} from "glob";
import {translitToRussian} from "./textTranslits";
import {Stream, Readable, Writable} from "stream";

const generateName = (): string => uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]}); // big_red_donkey
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const generateVoiceBookRoutes = Router();

type ProgressType = {
    [key: string]: {
        status: string
        startDate: number
        fileBuffers: {
            [key: string]: Buffer
        }
        outputStream?: Stream;
    }
}
const progress: ProgressType = {};  //id, {status, date}

generateVoiceBookRoutes.post("/", async (req, res) => {
    const id = generateName();
    try {
        const text = req.body.text;
        progress[id] = {status: 'queue 1/1', startDate: (new Date()).getTime(), fileBuffers: {}}; //todo queue progress
        runVoiceBook(id, text);
        return res.status(200).json({processId: id, status: "queue"});
    } catch (error) {
        progress[id].status = "error";
        console.error(error);
        return res.status(500).json({error: "Sorry, something went wrong"});
    }
});

generateVoiceBookRoutes.get("/:id", async (req, res) => {
    const id = req.params.id;
    res.attachment('audio.mp3');
    if (progress[id].outputStream) {
        progress[id].outputStream!.pipe(res);
    } else {
        res.status(404);
    }
    // pdfstream.pipe(res);
    // return res.download(progress[id].outputStream)
    // return res.download(`${bookRunsPath}/${id}/concatenated-audio.mp3`)
});

generateVoiceBookRoutes.get("/progress/:id", async (req, res) => {
    const id = req.params.id;
    if (progress[id] == null) {
        return res.status(404).json({processId: id, status: "notExist"});
    } else {
        return res.status(200).json({processId: id, status: progress[id].status});
    }
});


// const deleteOldInterval = 24 * 60 * 60 * 1000 //24 hour
// setInterval(() => {
//     for (let id of progress) {
//         if (progress[id].startDate + deleteOldInterval - 1 < (new Date()).getTime()) {
//             fse.removeSync(`${bookRunsPath}/${id}`);
//         }
//     }
// }, deleteOldInterval);

const SILERO_MAX_LEN = 900; //sometimes fails if near 1000

async function runVoiceBook(id: string, text: string): Promise<void> {
    text = translitToRussian(text);
    // const textItems = splitText(text, SILERO_MAX_LEN);
    const textItems = splitTextSimple(text);
    if (textItems.length === 0) {
        progress[id].status = "error";
        console.error("empty text");
        throw new Error("empty text");
    }
    await generateAudios(textItems, id);
    await glueFiles(id, textItems.length);
    progress[id].status = "ready";
}

//TODO: maybe split by sentence is better to sounds
function splitTextSimple(text: string): string[] {
    text = text.trim();
    let items = text.split(/[.?!]+/);
    items = items.filter(item => {
        return item.trim().length !== 0;
    });
    return items;
}

//export only for test
export function splitText(text: string, maxLen: number = 1000): string[] {
    text = text.trim();
    // const replacer = (match: string, p1: string, offset: number, string: string): string => {
    const replacer = (match: string, p1: string): string => {
        return p1 + "${splitter}";
    };
    text = text.replace(/([.?!]+)/g, replacer);
    let items = text.split("${splitter}");
    items = items
        .map(item => item.trim())
        .filter(item => item.length !== 0);

    const optimizedItems = [];
    let i = 0;
    let optimizedItem = items[i];
    while (i < items.length) {
        if (optimizedItem.length > maxLen) {
            console.warn("Sentence too big, try to split in the middle");
            const part1 = optimizedItem.substring(0, maxLen);
            const part2 = optimizedItem.substring(maxLen, optimizedItem.length);
            if (part1.trim().length) {
                optimizedItems.push(part1.trim());
            }
            if (part2.trim().length) {
                optimizedItems.push(part2.trim());
            }
            optimizedItem = "";
            if (part2.length > maxLen) {
                throw new Error("sentence too big even after splitting onto two parts")
            }
        } else {
            if (i + 1 < items.length) { //next element exists
                if (optimizedItem.length + items[i + 1].length + 1 < maxLen) { //+1 for space
                    optimizedItem += " " + items[i + 1];
                } else {
                    optimizedItems.push(optimizedItem);
                    optimizedItem = items[i + 1];
                }
            } else { //no more next elements
                optimizedItems.push(optimizedItem);
                optimizedItem = "";
            }
        }
        ++i;
    }
    return optimizedItems;
}

const POOL_LIMIT = 2;

const bookRunsPath = __dirname + "/../../python/bookRuns";

async function generateAudios(textItems: string[], id: string): Promise<void> {
    console.log("generateAudios::id=" + id);
    if (!fse.pathExistsSync(`${bookRunsPath}`)) {
        await fse.mkdir(`${bookRunsPath}`);
    }
    await fse.mkdir(`${bookRunsPath}/${id}`);

    progress[id].status = String(0);
    const progressDelta = 95 / textItems.length;

    const pool = new TaskPool({concurrency: POOL_LIMIT});
    for (let i = 0; i < textItems.length; ++i) {
        const task = new Task(async (i: any) => {
            console.log(`run task ${i}`);
            await generateAudio(textItems[i], `${bookRunsPath}/${id}/${i}`);
            progress[id].fileBuffers[i] = await fse.readFile(`${bookRunsPath}/${id}/${i}/test.wav`);
            progress[id].status = String(Math.round(Number(progress[id].status + progressDelta)));
            console.log(`finish task ${i}`);
        }, i);
        pool.addTask(task);
    }
    await pool.exec();
    console.log("pool finished");
}

async function generateAudio(text: string, textItemPath: string): Promise<void> {
    await fse.mkdir(textItemPath);
    await fse.copyFile(`${__dirname}/../../python/silerotest.py`, `${textItemPath}/silerotest.py`);
    return await tts(text, textItemPath);
}

function tts(text: string, cwd: string): Promise<void> {
    console.log("tts::cwd=" + cwd);
    return new Promise((resolve, reject) => {
        // https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
        // https://community.spiceworks.com/topic/1008185-node-js-spawn-working-directory
        // https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python', ["silerotest.py", '"' + text + '"'], {cwd});
        pythonProcess.stdout.on('data', (data: Buffer) => {
            console.log("Logs from python");
            console.log(data.toString());
        });
        pythonProcess.stderr.on('data', (data: Buffer) => {
            console.error("Error from python");
            console.error(data.toString());
            reject(new Error("Python failed"))
        });
        pythonProcess.on('close', (code: number) => {
            console.log(`Python child process exited with code ${code}`);
            if (code === 0 || code == null) { // https://superfastpython.com/exit-codes-in-python/
                resolve();
            } else {
                reject("Python child process exited with error");
            }
        });
    });
}

async function convertToMp3(wavFilename: string) {
    //https://devtails.medium.com/how-to-convert-audio-from-wav-to-mp3-in-node-js-using-ffmpeg-e5cb4af2da6
    return new Promise((resolve, reject) => {
        const outputFile = wavFilename.replace(".wav", ".mp3");
        ffmpeg({source: wavFilename})
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputFile))
            .save(outputFile);
    });
}


async function glueFiles(id: string, length: number) {
    // console.log("wait 10 sec");
    // await new Promise(resolve => setTimeout(() => resolve(), 10 * 1000));
    console.log("converting files...");

    // const files = await glob(`${bookRunsPath}/${id}` + '/**/test.wav', {ignore: 'node_modules/**'})
    console.log("(progress[id].fileBuffers = ", progress[id].fileBuffers);

    const ffmpegProcess = ffmpeg();
    const { StreamInput, StreamOutput } = require('fluent-ffmpeg-multistream')
    for (let i = 0; i < length; ++i) {
        ffmpegProcess.addInput(StreamInput(Readable.from(progress[id].fileBuffers[i])).url);
    }
    const outputStream = new Writable();
    await new Promise(((resolve, reject) => {
        ffmpegProcess.output(outputStream)
            .on("error", (err) => reject(err))
            .on("end", () => resolve("ok"))
            .run();
    }));
    progress[id].outputStream = outputStream;

    //
    // const convertPromises = []
    // for (let i = 0; i < length; ++i) {
    //     //let filepath = `${bookRunsPath}/${id}/${i}/test.wav`
    //     //console.log("File path: " + filepath);
    //     //const path = require("path");
    //     //filepath = path.normalize!(filepath)!;
    //     //console.log("Simple file path: " + filepath);
    //     convertPromises.push(convertToMp3(id, i))
    // }
    // await Promise.all(convertPromises);
    //
    // //https://www.reddit.com/r/node/comments/qoya5y/how_to_convert_audio_from_wav_to_mp3_in_nodejs/
    // //https://5k-team.trilogy.com/hc/en-us/articles/360016761260-How-to-Concatenate-Audio-Files-in-NodeJS
    // //https://www.reddit.com/r/node/comments/qoya5y/comment/hjrsepb/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
    //
    // // const { exec } = require('child_process')
    // // exec(`ffmpeg -i ${wavFilePath} ${otherffmpegOpts} ${mp3FilePath}`, (err, stdout, stderr) => {
    // //     // callback here for errors etc
    // // })
    //
    // console.log("concatinating files...")
    // const audioconcat = require('audioconcat');
    // const songs = []
    // for (let i = 0; i < length; ++i) {
    //     songs.push(`${bookRunsPath}/${id}/${i}/test.mp3`);
    // }
    // //https://www.npmjs.com/package/audioconcat
    // audioconcat(songs)
    //     .concat(`${bookRunsPath}/${id}/concatenated-audio.mp3`)
    //     .on('error', (error: any) => console.error('Failed to concatenate files', error))
    //     .on('end', () => console.info('Audio prompts generated'));
}


