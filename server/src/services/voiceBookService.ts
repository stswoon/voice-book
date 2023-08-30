import fse from "fs-extra";
import {utils} from "../utils";
import {translitDigits, translitToRussian} from "./textTranslits";
import {splitText} from "./splitText";
import {adjectives, animals, colors, uniqueNamesGenerator} from "unique-names-generator";
import {glueFiles} from "./ffmpegConvertor";
import {generateAudios} from "./ttsService";
import {
    MAX_POOL_SIZE,
    MAX_PROCESS,
    MAX_QUEUE,
    MAX_TEXT_LENGTH,
    QueueItem,
    VoiceProcess,
    VoiceProcessStatus
} from "./typesAndConsts";
import {bookRunsPath} from "./globalState";


export const state: State = {}
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
    const voiceProcess = {
        id: queue.id,
        progress: 0,
        status: VoiceProcessStatus.IN_PROGRESS,
        startDate: utils.now(),
        textItems: String[]
    };
    state.voiceProcessState.push(voiceProcess);
    generateVoice(voiceProcess).finally(() => {
        rearrangePoolConcurrency();
    });
    rearrangePoolConcurrency();
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
        })
    }
}

const filterInProgress = (): VoiceProcess[] => {
    return state.voiceProcessState.filter(item => item.status === VoiceProcessStatus.IN_PROGRESS);
}

const countInProgress = (): number => {
    // const count = state.voiceProcessState.reduce((acc: number, voiceProcess: VoiceProcess) => {
    //     return voiceProcess.status === VoiceProcessStatus.IN_PROGRESS ? acc + 1 : acc;
    // }, 0);
    const count = filterInProgress().length;
    return count;
}

const generateVoice = async (voiceProcess: VoiceProcess): Promise<void> => {
    await generateAudios(voiceProcess);
    await glueFiles(voiceProcess.id, voiceProcess.textItems.length);
    voiceProcess.outputFilePath = `${bookRunsPath}/${voiceProcess.id}/concatenated-audio.mp3`;
}

export const voiceBookService = {
    init,
    queueForGeneration
}
