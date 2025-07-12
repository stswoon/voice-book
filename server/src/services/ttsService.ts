import fse from "fs-extra";
import {Task, TaskPool} from "@antmind/task-pool";
import {spawn} from "child_process";
import {bookRunsPath, sileroEngineFileName, VoiceProcess} from "./typesAndConsts";
import {START_POOL_LIMIT, utils} from "../utils";
import {state} from "./BookRepository";

async function safeCreateBaseBookRunDirectory(): Promise<void> {
    if (!fse.pathExistsSync(`${bookRunsPath}`)) {
        await fse.mkdir(`${bookRunsPath}`);
    }
}

export async function generateAudios(voiceProcess: VoiceProcess): Promise<void> {
    console.log("generateAudios::id=" + voiceProcess.id);
    const startTime = utils.now();

    await safeCreateBaseBookRunDirectory();

    const id = voiceProcess.id;
    await fse.mkdir(`${bookRunsPath}/${id}`);
    voiceProcess.progress = 0;
    const progressDelta = 100 / voiceProcess.textItems.length;

    console.log(`START_POOL_LIMIT=${START_POOL_LIMIT}`);
    const pool = new TaskPool({concurrency: START_POOL_LIMIT});
    voiceProcess.taskPool = pool;
    state.taskPool = pool;

    for (let i = 0; i < voiceProcess.textItems.length; ++i) {
        const task = new Task(async (i: any) => {
            if (voiceProcess.cancel) { //TODO: find pool with cancel
                console.log("Cancel Task");
                return;
            }
            console.log(`run task ${i}`);
            await copyPython(`${bookRunsPath}/${id}/${i}`);
            await tts(id, voiceProcess.textItems[i], `${bookRunsPath}/${id}/${i}`);
            await safeRetry(id, i, voiceProcess.textItems[i]);
            await safeRetry(id, i, voiceProcess.textItems[i]);
            if (!(await fse.exists(`${bookRunsPath}/${id}/${i}/test.wav`))) {
                throw Error(`CANNOT do tss for ${i}`);
            }
            voiceProcess.progress += progressDelta;
            console.log(`finish task ${i}`);
        }, i);
        pool.addTask(task);
    }

    console.log("pool started");
    await pool.exec().catch();
    voiceProcess.taskPool = undefined;
    state.taskPool = undefined;
    console.log(`pool finished, ${utils.timeSpend(startTime)}`);
}

async function safeRetry(id: string, i: string, text: string) {
    if (!(await fse.exists(`${bookRunsPath}/${id}/${i}/test.wav`))) {
        console.warn(`WARN: file not created so run tss step again for task ${i} for process ${id}`);
        await tts(id, text, `${bookRunsPath}/${id}/${i}`);
    }
}

async function copyPython(textItemPath: string): Promise<void> {
    await fse.mkdir(textItemPath);
    await fse.copyFile(`${bookRunsPath}/../${sileroEngineFileName}`, `${textItemPath}/${sileroEngineFileName}`);
}

function tts(id: string, text: string, cwd: string): Promise<void> {
    console.log(`tts[processId=${id}]::cwd=${cwd}`);
    return new Promise((resolve, reject) => {
        const logs: any[] = [];

        // https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
        // https://community.spiceworks.com/topic/1008185-node-js-spawn-working-directory
        // https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
        // const spawn = require("child_process").spawn;
        const pythonProcess = spawn("python", [sileroEngineFileName, "\"" + text + "\""], {cwd});
        pythonProcess.stdout.on("data", (data: Buffer) => {
            //console.log("Logs from python");
            //console.log(data.toString());
            logs.push({level: "debug", message: data.toString()})
        });
        pythonProcess.stderr.on("data", (data: Buffer) => {
            console.error("ERROR FROM PYTHON");
            console.error(data.toString());
            //reject(new Error("Python failed")) //for case NNPACK
            logs.push({level: "error", message: data.toString()})
        });
        pythonProcess.on("close", (code: number) => {
            console.log(`Python child process exited with code ${code}`);
            if (code === 0 || code == null) { // https://superfastpython.com/exit-codes-in-python/
                resolve();
            } else {
                console.error(`Failed to do TTS processId=${id}, logs:`)
                logs.forEach(log => {
                    if (log.level === "error") {
                        console.error(log.message);
                    } else {
                        console.log(log.message);
                    }
                })
                reject("Python child process exited with ERROR");
            }
        });
    });
}
