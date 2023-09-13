import {utils} from "../utils";
import fse from "fs-extra";
import {bookRunsPath, DELETE_OLD_VOICE_PROCESS_INTERVAL, MAX_QUEUE_TIMEOUT, State} from "./typesAndConsts";


export const state: State = {queue: [], voiceProcessState: []};


export const startRemoveOldVoiceProcess = () => {
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

export const startRemoveOldQueue = () => {
    setInterval(() => {
        state.queue = state.queue.filter(queueItem => queueItem.startDate + MAX_QUEUE_TIMEOUT - 1 < utils.now());
    }, MAX_QUEUE_TIMEOUT);
}
