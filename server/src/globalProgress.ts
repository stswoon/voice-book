import {Stream} from "stream";
import fse from "fs-extra";

export const bookRunsPath = __dirname + "/../../python/bookRuns";

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
    }
}
export const progress: ProgressType = {};  //id, {status, date}

export function startRemoveInterval() {
    const deleteOldInterval = 24 * 60 * 60 * 1000 //24 hour
    setInterval(() => {
        for (let id of progress as any) {
            if (progress[id].startDate + deleteOldInterval - 1 < (new Date()).getTime()) {
                fse.removeSync(`${bookRunsPath}/${id}`);
            }
        }
    }, deleteOldInterval);
}
