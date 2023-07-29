import fse from "fs-extra";
import {glob} from "glob";
import {Task, TaskPool} from "@antmind/task-pool";
import {spawn} from "child_process";
import {bookRunsPath, ProgressType} from "./globalProgress";

const POOL_LIMIT = 2;

export async function generateAudios(progress: ProgressType, textItems: string[], id: string): Promise<void> {
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
            progress[id].status = String(Math.round(Number(progress[id].status) + progressDelta));
            console.log(`finish task ${i}`);
        }, i);
        pool.addTask(task);
    }
    await pool.exec();
    console.log("pool finished");
}

async function copyPython(text: string, textItemPath: string): Promise<void> {
    await fse.mkdir(textItemPath);
    await fse.copyFile(`${__dirname}/../../python/silerotest.py`, `${textItemPath}/silerotest.py`);
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
            console.log("Logs from python");
            console.log(data.toString());
        });
        pythonProcess.stderr.on('data', (data: Buffer) => {
            console.error("Error from python");
            console.error(data.toString());
            //reject(new Error("Python failed")) //for case NNPACK
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
