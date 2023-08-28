import fse from "fs-extra";
import {Task, TaskPool} from "@antmind/task-pool";
import {spawn} from "child_process";
import {bookRunsPath, VoiceProcess} from "./typesAndConsts";


const START_POOL_LIMIT = 1;

async function safeCreateBaseBookRunDirectory(): Promise<void> {
    if (!fse.pathExistsSync(`${bookRunsPath}`)) {
        await fse.mkdir(`${bookRunsPath}`);
    }
}

export async function generateAudios(voiceProcess: VoiceProcess): Promise<void> {
    console.log("generateAudios::id=" + voiceProcess.id);
    await safeCreateBaseBookRunDirectory();

    const id = voiceProcess.id;
    await fse.mkdir(`${bookRunsPath}/${id}`);
    voiceProcess.progress = 0;
    const progressDelta = 100 / voiceProcess.textItems.length;
    const pool = new TaskPool({concurrency: START_POOL_LIMIT});
    voiceProcess.taskPool = pool;

    for (let i = 0; i < voiceProcess.textItems.length; ++i) {
        const task = new Task(async (i: any) => {
            if (progress[id].cancel) {
                console.log(`cancel task`);
                return;
            }
            console.log(`run task ${i}`);
            await copyPython(textItems[i], `${bookRunsPath}/${id}/${i}`);
            await tts(textItems[i], `${bookRunsPath}/${id}/${i}`);
            if (!(await fse.exists(`${bookRunsPath}/${id}/${i}/test.wav`))) {
                console.warn(`WARN: file not created so run tss step again for ${i}`);
                await tts(textItems[i], `${bookRunsPath}/${id}/${i}`);
                if (!(await fse.exists(`${bookRunsPath}/${id}/${i}/test.wav`))) {
                    console.warn(`WARN: file not created AGAIN, so give tss step FINAL try for ${i}`);
                    await tts(textItems[i], `${bookRunsPath}/${id}/${i}`);
                    if (!(await fse.exists(`${bookRunsPath}/${id}/${i}/test.wav`))) {
                        throw Error(`CANNOT do tss for ${i}`);
                    }
                }
            }
            //progress[id].fileBuffers[i] = await fse.readFile(`${bookRunsPath}/${id}/${i}/test.wav`);
            progress[id].status = String(Math.round((Number(progress[id].status) + progressDelta) * 10) / 10);
            console.log(`finish task ${i}`);
        }, i);
        pool.addTask(task);
    }
    console.log("pool started");
    await pool.exec();
    voiceProcess.taskPool = undefined;
    console.log("pool finished");
}

async function copyPython(text: string, textItemPath: string): Promise<void> {
    await fse.mkdir(textItemPath);
    await fse.copyFile(`${bookRunsPath}/../silerotest.py`, `${textItemPath}/silerotest.py`);
}

function tts(text: string, cwd: string): Promise<void> {
    console.log("tts::cwd=" + cwd);
    return new Promise((resolve, reject) => {
        // https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
        // https://community.spiceworks.com/topic/1008185-node-js-spawn-working-directory
        // https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
        // const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python', ["silerotest.py", '"' + text + '"'], {cwd});
        pythonProcess.stdout.on('data', (data: Buffer) => {
            //console.log("Logs from python");
            //console.log(data.toString());
        });
        pythonProcess.stderr.on('data', (data: Buffer) => {
            console.error("ERROR FROM PYTHON");
            console.error(data.toString());
            //reject(new Error("Python failed")) //for case NNPACK
        });
        pythonProcess.on('close', (code: number) => {
            console.log(`Python child process exited with code ${code}`);
            if (code === 0 || code == null) { // https://superfastpython.com/exit-codes-in-python/
                resolve();
            } else {
                reject("Python child process exited with ERROR");
            }
        });
    });
}
