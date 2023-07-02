import {Router} from "express";
import {v4 as uuid} from "uuid";
import fse from "fs-extra";
import {spawn} from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const generateVoiceBookRoutes = Router();

generateVoiceBookRoutes.post("/", async (req, res) => {
    try {
        const text = req.body.text;
        const textItems = splitText(text);
        const id = uuid();
        await generateAudios(textItems, id)
        await glueFiles(id, textItems.length);
        return res.status(200).json({status: "ok"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Sorry, something went wrong"});
    }
});

function splitText(text: string) {
    text = text.trim();
    let items = text.split("."); //good for tests
    items = items.filter(item => {
        return item.trim().length !== 0;
    });
    return items;
    //TODO take every paragraph but if it more then 1000 then need to split into several sentences not more 1000 symbols
}

const bookRunsPath = __dirname + "/../../python/bookRuns"
async function generateAudios(textItems: string[], id: string) {
    console.log("generateAudios::id=" + id);
    await fse.mkdir(`${bookRunsPath}/${id}`);

    let i = 0;
    while (i < textItems.length) {
        const ttsPromises = [];
        ttsPromises.push(generateAudio(textItems[i], `${bookRunsPath}/${id}/${i}`));
        if (i + 1 < textItems.length) ttsPromises.push(generateAudio(textItems[i + 1], `${bookRunsPath}/${id}/${i + 1}`));
        if (i + 2 < textItems.length) ttsPromises.push(generateAudio(textItems[i + 2], `${bookRunsPath}/${id}/${i + 2}`));
        if (i + 3 < textItems.length) ttsPromises.push(generateAudio(textItems[i + 3], `${bookRunsPath}/${id}/${i + 3}`));
        await Promise.all(ttsPromises);
        i += 4; //TODO dynamic
    }
}

async function generateAudio(text: string, textItemPath: string) {
    await fse.mkdir(textItemPath);
    await fse.copyFile(`${__dirname}/../../python/silerotest.py`, `${textItemPath}/silerotest.py`);
    await tts(text, textItemPath);
}

function tts(text: string, cwd: string): Promise<void> {
    console.log("tts::cwd=" + cwd);
    return new Promise((resolve, reject) => {
        // https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
        // https://community.spiceworks.com/topic/1008185-node-js-spawn-working-directory
        // https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python', ["silerotest.py", '"' + text + '"'], {cwd});
        pythonProcess.stdout.on('data', (data) => {
            console.log("Logs from python");
            console.log(data.toString());
        });
        pythonProcess.stderr.on('data', (data) => {
            console.error("Error from python");
            console.error(data.toString());
            reject(new Error("Python failed"))
        });
        pythonProcess.on('close', (code) => {
            console.log(`Python child process exited with code ${code}`);
            resolve();
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
        .on('error', error => console.error('Failed to concatenate files', error))
        .on('end', () => console.info('Audio prompts generated'));
}