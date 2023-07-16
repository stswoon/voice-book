import {bookRunsPath, progress, ProgressType} from "./globalProgress";
// import ffmpeg from "fluent-ffmpeg";
import * as fluentFfmpegUtil from "fluent-ffmpeg-util";
// import {glob} from "glob";
import {Stream, Readable, Writable} from "stream";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

const audioconcat: any = require('audioconcat');
// const {createReadStream, createWriteStream} = require("fs")
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);
// const ffprobePath = require('@ffprobe-installer/ffprobe').path;
// ffmpeg.setFfprobePath(ffprobePath);

export async function glueFiles(progress: ProgressType, id: string) {
    let convertType = "FILES";
    convertType = "STREAMS";
    if (convertType === "FILES") {
        await convertToMp3AllFiles(id, progress[id]!.length!);
        await glueMp3Files(progress, id);
    } else if (convertType === "STREAMS") {
        await glueFileStreams(progress, id);
    }
}

async function convertToMp3AllFiles(id: string, length: number) {
    const convertPromises = []
    for (let i = 0; i < length; ++i) {
        let filepath = `${bookRunsPath}/${id}/${i}/test.wav`
        console.log("File path: " + filepath);
        // const path = require("path");
        // filepath = path.normalize!(filepath)!;
        // console.log("Simple file path: " + filepath);
        convertPromises.push(convertToMp3_File(filepath))
    }
    await Promise.all(convertPromises);
}

async function convertToMp3_File(wavFilename: string) {
    //https://devtails.medium.com/how-to-convert-audio-from-wav-to-mp3-in-node-js-using-ffmpeg-e5cb4af2da6
    return new Promise((resolve, reject) => {
        const outputFile = wavFilename.replace(".wav", ".mp3");
        ffmpeg({source: wavFilename})
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputFile))
            .save(outputFile);
    });
}

async function glueMp3Files(progress: ProgressType, id: string) {
    //https://www.reddit.com/r/node/comments/qoya5y/how_to_convert_audio_from_wav_to_mp3_in_nodejs/
    //https://5k-team.trilogy.com/hc/en-us/articles/360016761260-How-to-Concatenate-Audio-Files-in-NodeJS
    //https://www.reddit.com/r/node/comments/qoya5y/comment/hjrsepb/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

    // const { exec } = require('child_process')
    // exec(`ffmpeg -i ${wavFilePath} ${otherffmpegOpts} ${mp3FilePath}`, (err, stdout, stderr) => {
    //     // callback here for errors etc
    // })

    console.log("concatinating files...")
    const songs = []
    for (let i = 0; i < progress[id]!.length!; ++i) {
        songs.push(`${bookRunsPath}/${id}/${i}/test.mp3`);
    }
    //https://www.npmjs.com/package/audioconcat
    audioconcat(songs)
        .concat(`${bookRunsPath}/${id}/concatenated-audio.mp3`)
        .on('error', (error: any) => console.error('Failed to concatenate files', error))
        .on('end', () => console.info('Audio prompts generated'));
    progress[id].outputFilePath = `${bookRunsPath}/${id}/concatenated-audio.mp3`;
}

// ======================= STREAMS implementation

//https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/536 - no chance to fix it
async function glueFileStreams(progress: ProgressType, id: string) {
    console.log("converting files...");
    // const files = await glob(`${bookRunsPath}/${id}` + '/**/test.wav', {ignore: 'node_modules/**'})
    // console.log("(progress[id].fileBuffers = ", progress[id].fileBuffers);

    const ffmpegProcess = ffmpeg();
    for (let i = 0; i < progress[id]!.length!; ++i) {
        // const inputPath = fluentFfmpegUtil.handleInputStream(Readable.from(progress[id].fileBuffers[i])).path;
        var fs = require('fs');
        const inputPath = fluentFfmpegUtil.handleInputStream(fs.createReadStream(`${bookRunsPath}/${id}/${i}/test.wav`)).path;
        console.log("inputPath=" + inputPath);
        ffmpegProcess.addInput(inputPath);
    }
    const outputStream = new Writable();
    progress[id].outputStream = outputStream;
    console.log("start process");
    await new Promise(((resolve, reject) => {
        ffmpegProcess.inputFormat("concat")
        ffmpegProcess
            .on("error", (err) => reject(err))
            .on("end", () => resolve("ok"))
            // .mergeToFile(outputStream)
            .concatenate(outputStream);
    }));
}
