import {TaskPool} from "@antmind/task-pool";

export const MAX_TEXT_LENGTH = 1000000;

export const SILERO_MAX_LEN = 800; //sometimes fails if near 1000 end even more then 800

export const MAX_QUEUE = 5;
export type QueueItem = {
    id: string
    startDate: number
    textItems: string[]
}

export const MAX_PROCESS = 2;
export const MAX_POOL_SIZE = 2; //across MAX_PROCESS, should be more then MAX_PROCESS
export type VoiceProcess = {
    id: string
    startDate: number
    textItems: string[]
    progress: number
    status: VoiceProcessStatus
    taskPool?: TaskPool
    outputFilePath?: string
    cancel?: boolean
}

export enum VoiceProcessStatus {
    IN_PROGRESS = "IN_PROGRESS",
    FAILED = "FAILED",
    SUCCESS = "SUCCESS"
}


export const bookRunsPath = __dirname + "/../../../python/bookRuns";
export const sileroEngineFileName = "silero.py";
