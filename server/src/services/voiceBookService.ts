import fse from "fs-extra";
import {utils} from "../utils";
import {translitToRussian} from "./textTranslits";
import {splitText} from "./splitText";
import {adjectives, animals, colors, uniqueNamesGenerator} from "unique-names-generator";
import {generateAudios} from "./pythonTts";
import {glueFiles} from "./ffmpegConvertor";


export const state: State = {}
export type State = {
    queue: Queue
    voiceProcessState: VoiceProcessState
};

const MAX_TEXT_LENGTH = 1000000;

const MAX_QUEUE = 5;
export type Queue = QueueItem[];
export type QueueItem = {
    id: string
    startDate: number
    textItems: string[]
}

const MAX_PROCESS = 2;
const MAX_POOL_SIZE = 2; //across MAX_PROCESS
export type VoiceProcessState = VoiceProcess[];
export type VoiceProcess = {
    id: string
    startDate: number
    textItemLength: number
    progress: number
    status: VoiceProcessStatus;
    outputFilePath?: string
}

enum VoiceProcessStatus {
    IN_PROGRESS = "IN_PROGRESS",
    FAILED = "FAILED",
    SUCCESS = "SUCCESS"
}


export const bookRunsPath = __dirname + "/../../../python/bookRuns";
const DELETE_OLD_VOICE_PROCESS_INTERVAL = 1 * 60 * 60 * 1000 //1 hour
const startRemoveOldVoiceProcess = () => {
    setInterval(() => {
        for (let id of state.voiceProcessState) {
            if (state.voiceProcessState[id].startDate + DELETE_OLD_VOICE_PROCESS_INTERVAL - 1 < utils.now()) {
                fse.removeSync(`${bookRunsPath}/${id}`);
            }
        }
    }, DELETE_OLD_VOICE_PROCESS_INTERVAL);
}

const MAX_QUEUE_TIMEOUT = 1 * 60 * 60 * 1000 //1 hour
const startRemoveOldQueue = () => {
    setInterval(() => {
        for (let id of state.queueState) {
            if (state.queueState[id].startDate + MAX_QUEUE_TIMEOUT - 1 < utils.now()) {
                //TODO
            }
        }
    }, MAX_QUEUE_TIMEOUT);
}

const init = () => {
    startRemoveOldVoiceProcess();
    startRemoveOldQueue();
}

const prepareText = (text: string): string[] => {
    text = translitToRussian(text);
    //TODO numbers
    const textItems = splitText(text);
    return textItems;
}

const generateName = (): string => uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]}); // big_red_donkey

const queueForGeneration = (text: string): void => {
    if (text.length > MAX_TEXT_LENGTH) {
        throw Error("Too long text, pls split it");
    }
    let textItems = prepareText(text);
    if (textItems.length === 0) {
        throw Error("No text to generate");
    }

    //checking queue is last step to be able to fix text for a user;
    if (state.queue.length >= MAX_QUEUE) {
        throw Error("The Queue is full please try later");
    }
    state.queue.push({
        id: generateName(),
        textItems: textItems,
        startDate: utils.now()
    });
    checkQueueState();
}

const checkQueueState = (): void => {
    if (state.queue.length === 0) return;
    if (countInProgress() >= MAX_PROCESS) return;

    const queue = state.queue.shift();
    state.voiceProcessState.push({
        id: queue.id,
        progress: 0,
        status: VoiceProcessStatus.IN_PROGRESS,
        startDate: utils.now(),
        textItemLength: queue.textItems.length
    });
    generateVoice(queue.id, queue.textItems);
}

const countInProgress = (): number => {
    const count = state.voiceProcessState.reduce((acc: number, voiceProcess: VoiceProcess) => {
        return voiceProcess.status === VoiceProcessStatus.IN_PROGRESS ? acc + 1 : acc;
    }, 0);
    return count;
}

const generateVoice = async (id: string, textItems: string[]): Promise<void> => {
    await generateAudios(progress, textItems, id);
    await glueFiles(progress, id);
}

export const voiceBookService = {
    init,
    queueForGeneration
}
