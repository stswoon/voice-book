import fse from "fs-extra";
import {utils} from "../utils";
import {translitDigits, translitToRussian} from "./textTranslits";
import {splitText} from "./splitText";
import {adjectives, animals, colors, uniqueNamesGenerator} from "unique-names-generator";
import {glueFiles} from "./ffmpegConvertor";
import {generateAudios} from "./ttsService";
import {
    bookRunsPath,
    MAX_POOL_SIZE,
    MAX_PROCESS,
    MAX_QUEUE,
    MAX_TEXT_LENGTH,
    QueueItem,
    VoiceProcess,
    VoiceProcessStatus
} from "./typesAndConsts";


export const state: State = {queue: [], voiceProcessState: []};
export type State = {
    queue: QueueItem[]
    voiceProcessState: VoiceProcess[]
};


const DELETE_OLD_VOICE_PROCESS_INTERVAL = 1 * 60 * 60 * 1000 //1 hour
const startRemoveOldVoiceProcess = () => {
    setInterval(() => {
        state.voiceProcessState = state.voiceProcessState.filter(voiceProcess => {
            if (voiceProcess.startDate + DELETE_OLD_VOICE_PROCESS_INTERVAL - 1 < utils.now()) {
                fse.removeSync(`${bookRunsPath}/${voiceProcess.id}`);
                return false;
            }
            return true;
        });
    }, DELETE_OLD_VOICE_PROCESS_INTERVAL);
}

const MAX_QUEUE_TIMEOUT = 1 * 60 * 60 * 1000 //1 hour
const startRemoveOldQueue = () => {
    setInterval(() => {
        state.queue = state.queue.filter(queueItem => queueItem.startDate + MAX_QUEUE_TIMEOUT - 1 < utils.now());
    }, MAX_QUEUE_TIMEOUT);
}

const init = () => {
    startRemoveOldVoiceProcess();
    startRemoveOldQueue();
}

const prepareText = (text: string): string[] => {
    text = translitToRussian(text);
    text = translitDigits(text);
    const textItems = splitText(text);
    return textItems;
}

const generateName = (): string => uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]}); // big_red_donkey

const queueForGeneration = (text: string): string => {
    if (text.length > MAX_TEXT_LENGTH) {
        throw Error(`Too long text, pls split it to be less then ${MAX_TEXT_LENGTH}`);
    }
    let textItems = prepareText(text);
    if (textItems.length === 0) {
        throw Error("No text to generate");
    }

    //checking queue is last step to be able to fix text for a user;
    if (state.queue.length >= MAX_QUEUE) {
        throw Error("The Queue is full please try later");
    }
    const id = generateName()
    state.queue.push({
        id,
        textItems: textItems,
        startDate: utils.now()
    });
    checkQueueState();
    return id;
}

const checkQueueState = (): void => {
    if (state.queue.length === 0) return;
    if (countInProgress() >= MAX_PROCESS) return;

    const queue = state.queue.shift();
    const voiceProcess = {
        id: queue.id,
        progress: 0,
        status: VoiceProcessStatus.IN_PROGRESS,
        startDate: utils.now(),
        textItems: queue.textItems
    };
    state.voiceProcessState.push(voiceProcess);
    generateVoice(voiceProcess, rearrangePoolConcurrency).finally(() => {
        rearrangePoolConcurrency();
    });
}

function rearrangePoolConcurrency() {
    console.log("rearrangePoolConcurrency");
    const voiceProcesses = filterInProgress();
    let poolSize = MAX_POOL_SIZE;
    while (poolSize > 0) {
        voiceProcesses.forEach(voiceProcess => {
            if (poolSize > 0) {
                const pool = voiceProcess.taskPool as any;
                pool._customConcurency = (pool._customConcurency || 0) + 1;
                pool.setConcurrency(pool._customConcurency);
                poolSize--;
            }
        });
    }
    voiceProcesses.forEach(voiceProcess => delete (voiceProcess.taskPool as any)._customConcurency);
}

const filterInProgress = (): VoiceProcess[] => {
    return state.voiceProcessState.filter(item => item.status === VoiceProcessStatus.IN_PROGRESS);
}
const countInProgress = (): number => filterInProgress().length;

const getProcessById = (id: string): VoiceProcess | undefined => state.voiceProcessState.find(voiceProcess => voiceProcess.id === id);

const generateVoice = async (voiceProcess: VoiceProcess, rearrangePoolConcurrency: any): Promise<void> => {
    await generateAudios(voiceProcess, rearrangePoolConcurrency);
    if (voiceProcess.cancel) {
        fse.removeSync(`${bookRunsPath}/${voiceProcess.id}`);
        state.voiceProcessState = state.voiceProcessState.filter(item => item.id !== voiceProcess.id);
    } else {
        await glueFiles(voiceProcess.id, voiceProcess.textItems.length);
        voiceProcess.outputFilePath = `${bookRunsPath}/${voiceProcess.id}/concatenated-audio.mp3`;
        voiceProcess.status = VoiceProcessStatus.SUCCESS;
    }
}

const getOutputFilePath = (id: string): string | undefined => {
    const voiceProcess = getProcessById(id);
    if (voiceProcess == undefined) {
        throw new Error(`Process with id = ${id} not exist`);
    }
    return voiceProcess.outputFilePath;
}

const getProgress = (id: string): number => {
    const voiceProcess = getProcessById(id);
    if (voiceProcess == undefined) {
        const queueItem = state.queue.find(queueItem => queueItem.id === id);
        if (queueItem == undefined) {
            throw new Error(`Process with id = ${id} not exist`);
        } else {
            return 0;
        }
    }
    return voiceProcess.progress;
}

const getStatus = (id: string): VoiceProcessStatus => {
    const voiceProcess = getProcessById(id);
    if (voiceProcess == undefined) {
        const queueItem = state.queue.find(queueItem => queueItem.id === id);
        if (queueItem == undefined) {
            throw new Error(`Process with id = ${id} not exist`);
        } else {
            return VoiceProcessStatus.QUEUE;
        }
    } else {
        return voiceProcess.status;
    }
}

const terminate = (id: string): void => {
    const voiceProcess = getProcessById(id);
    if (voiceProcess == undefined) {
        const queueItem = state.queue.find(queueItem => queueItem.id === id);
        if (queueItem == undefined) {
            throw new Error(`Process with id = ${id} not exist`);
        } else {
            state.queue = state.queue.filter(queueItem => queueItem.id !== id);
        }
    } else {
        voiceProcess.cancel = true;
        voiceProcess.status = VoiceProcessStatus.TERMINATING
    }
}

export const voiceBookService = {
    init,
    queueForGeneration,
    getOutputFilePath,
    getProgress,
    getStatus,
    terminate
}
