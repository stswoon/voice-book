import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import {bookRunsPath} from "./typesAndConsts";
// import ffprobeInstaller from "@ffprobe-installer/ffprobe";

const audioconcat: any = require("audioconcat");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ffmpeg.setFfprobePath(ffprobeInstaller.path);

export async function glueFiles(id: string, count: number) {
    await convertToMp3AllFiles(id, count);
    await glueMp3Files(id, count);
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
            .on("error", (err) => {
                console.error("convert fail " + err);
                console.error(err);
                reject(err)
            })
            .on("end", () => resolve(outputFile))
            .save(outputFile);
    })
        .catch(cause => {
            console.error("convert fail " + cause);
            console.error(cause);
            throw cause;
        });
}

async function glueMp3Files(id: string, length: number): Promise<void> {
    //https://www.reddit.com/r/node/comments/qoya5y/how_to_convert_audio_from_wav_to_mp3_in_nodejs/
    //https://5k-team.trilogy.com/hc/en-us/articles/360016761260-How-to-Concatenate-Audio-Files-in-NodeJS
    //https://www.reddit.com/r/node/comments/qoya5y/comment/hjrsepb/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

    // const { exec } = require('child_process')
    // exec(`ffmpeg -i ${wavFilePath} ${otherffmpegOpts} ${mp3FilePath}`, (err, stdout, stderr) => {
    //     // callback here for errors etc
    // })

    console.log("concatinating files...")
    const songs: string[] = []
    for (let i = 0; i < length; ++i) {
        songs.push(`${bookRunsPath}/${id}/${i}/test.mp3`);
    }
    return new Promise((resolve, reject) => {
        //https://www.npmjs.com/package/audioconcat
        audioconcat(songs)
            .concat(`${bookRunsPath}/${id}/concatenated-audio.mp3`)
            .on("error", (error: any) => {
                console.error("Failed to concatenate files", error);
                reject(error);
            })
            .on("end", () => {
                console.info("Audio prompts generated");
                resolve();
            });
    });
}
