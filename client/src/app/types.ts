export enum VoiceProcessStatus {
    IN_PROGRESS = "IN_PROGRESS",
    FAILED = "FAILED",
    SUCCESS = "SUCCESS",
    QUEUE = "QUEUE",
    TERMINATING = "TERMINATING"
}

export interface AppState {
    loading: boolean
    selectedTabId: string;
    tabs: BookTab[];
}

export interface BookTab {
    id: string;
    name: string;
    text: string;
    processId?: string;
    processStatus?: VoiceProcessStatus;
}

export type AppStateChangeCallback = (AppState) => void;

export interface PollingType {
    progress: number;
    status: VoiceProcessStatus;

}
