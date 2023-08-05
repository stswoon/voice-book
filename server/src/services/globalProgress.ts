import {Stream} from "stream";
import fse from "fs-extra";

export const bookRunsPath = __dirname + "/../../../python/bookRuns";

export type ProgressType = {
    [key: string]: {
        length?: number;
        status: string
        startDate: number
        fileBuffers: {
            [key: string]: Buffer
        }
        outputStream?: Stream;
        outputFilePath?: string;
        cancel?: boolean
    }
}
export const progress: ProgressType = {};  //id, {status, date}

export function startRemoveInterval() {
    const deleteOldInterval = 1 * 60 * 60 * 1000 //1 hour
    setInterval(() => {
        for (let id of progress as any) {
            if (progress[id].startDate + deleteOldInterval - 1 < (new Date()).getTime()) {
                fse.removeSync(`${bookRunsPath}/${id}`);
            }
        }
    }, deleteOldInterval);
}
