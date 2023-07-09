import {Router} from "express";
import fse from "fs-extra";
import {spawn} from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import {uniqueNamesGenerator, adjectives, colors, animals} from "unique-names-generator";
import {Task, TaskPool} from '@antmind/task-pool';


const generateName = (): string => uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]}); // big_red_donkey

export const generateVoiceBookRoutes = Router();

const progress: any = {};  //id, {status, date}


generateVoiceBookRoutes.post("/", async (req, res) => {
    const id = generateName();
    try {
        const text = req.body.text;
        const textItems = splitText(text, 1000);
        if (textItems.length === 0) {
            throw new Error("empty text");
        }
        progress[id] = {
            status: 'queue 1/1', //todo queue progress
            startDate: (new Date()).getTime()
        };
        res.status(200).json({processId: id, status: "queue"});
        await generateAudios(textItems, id)
        await glueFiles(id, textItems.length);
        progress[id].status = "ready";
        return;
    } catch (error) {
        progress[id].status = "error";
        console.error(error);
        return res.status(500).json({error: "Sorry, something went wrong"});
    }
});

const deleteOldInterval = 60 * 60 * 1000 //1 hour
setInterval(() => {
    for (let id of progress) {
        if (progress[id].startDate + deleteOldInterval - 1 < (new Date()).getTime()) {
            fse.removeSync(`${bookRunsPath}/${id}`);
        }
    }
}, deleteOldInterval);

generateVoiceBookRoutes.get("/:id", async (req, res) => {
    const id = req.params.id;
    res.download(`${bookRunsPath}/${id}/concatenated-audio.mp3`)
});

generateVoiceBookRoutes.get("/progress/:id", async (req, res) => {
    const id = req.params.id;
    if (progress[id] == null) {
        return res.status(404).json({processId: id, status: "notExist"});
    }
    return res.status(200).json({processId: id, status: progress[id].status});
});

//export only for test
export function splitText(text: string, maxLen: number = 1000): string[] {
    text = text.trim();
    let items = text.split(/[.?!]+/); //good for tests
    items = items.filter(item => {
        return item.trim().length !== 0;
    });
    return items;
    //TODO take every paragraph but if it more then 1000 then need to split into several sentences not more 1000 symbols
}

const POOL_LIMIT = 2;

const bookRunsPath = __dirname + "/../../python/bookRuns";

async function generateAudios(textItems: string[], id: string): Promise<void> {
    console.log("generateAudios::id=" + id);
    if (!fse.pathExistsSync(`${bookRunsPath}`)) {
        await fse.mkdir(`${bookRunsPath}`);
    }
    await fse.mkdir(`${bookRunsPath}/${id}`);

    progress[id].status = 0;
    const progressDelta = 99 / textItems.length;

    const pool = new TaskPool({concurrency: POOL_LIMIT});
    for (let i = 0; i < textItems.length; ++i) {
        const task = new Task(async (i: any) => {
            console.log(`run task ${i}`);
            await generateAudio(textItems[i], `${bookRunsPath}/${id}/${i}`);
            progress[id].status = Math.round(progress[id].status + progressDelta);
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
            if (code === 0) {
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
    console.log("converting files...")
    const convertPromises = []
    for (let i = 0; i < length; ++i) {
        convertPromises.push(convertToMp3(`${bookRunsPath}/${id}/${i}/test.wav`))
    }
    await Promise.all(convertPromises);

    //https://www.reddit.com/r/node/comments/qoya5y/how_to_convert_audio_from_wav_to_mp3_in_nodejs/
    //https://5k-team.trilogy.com/hc/en-us/articles/360016761260-How-to-Concatenate-Audio-Files-in-NodeJS
    //https://www.reddit.com/r/node/comments/qoya5y/comment/hjrsepb/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

    // const { exec } = require('child_process')
    // exec(`ffmpeg -i ${wavFilePath} ${otherffmpegOpts} ${mp3FilePath}`, (err, stdout, stderr) => {
    //     // callback here for errors etc
    // })

    console.log("concatinating files...")
    const audioconcat = require('audioconcat');
    const songs = []
    for (let i = 0; i < length; ++i) {
        songs.push(`${bookRunsPath}/${id}/${i}/test.mp3`);
    }
    //https://www.npmjs.com/package/audioconcat
    audioconcat(songs)
        .concat(`${bookRunsPath}/${id}/concatenated-audio.mp3`)
        .on('error', (error: any) => console.error('Failed to concatenate files', error))
        .on('end', () => console.info('Audio prompts generated'));
}
