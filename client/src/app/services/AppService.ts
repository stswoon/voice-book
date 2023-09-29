import {testData0} from "../components/testData.ts";
import {strings} from "../strings.ts";
import {AppState, PollingType, VoiceProcessStatus} from "../types";
import {v4 as uuid} from "uuid";

let appState: AppState = {
    loading: false,
    selectedTabId: null,
    tabs: []
};

const init = (): void => {
    if (localStorage.getItem("appState")) {
        appState = JSON.parse(localStorage.getItem("appState"));
    } else {
        newTab();
        appState.tabs[0].text = testData0;
    }
    triggerAppStateChange2();

    getTabStatus();
};

const getTabStatus = () => {
    const selectedTab = getTabById(appState.selectedTabId);
    // if (selectedTab.processId && (selectedTab.processStatus === VoiceProcessStatus.QUEUE || selectedTab.processStatus === VoiceProcessStatus.IN_PROGRESS)) {
    if (selectedTab.processId) {
        const processId = selectedTab.processId;
        setProcessId(processId);
        toast(strings().AppServiceToasts.initGetStatusToast.replace("{processId}", processId));
        send(processId);
    } else {
        setButtonsVisibility(null, false, true, true);
    }
};

const saveState = () => localStorage.setItem("appState", JSON.stringify(appState));

const getTabById = (id: string) => appState.tabs.find(tab => tab.id === id);

// const appStateChangeCallbacks: AppStateChangeCallback[] = [];
// const onAppStateChange = (callback: AppStateChangeCallback): void => appStateChangeCallbacks.push(callback) as void;
// const triggerAppStateChange = (): void => appStateChangeCallbacks.forEach(callback => callback(appState));

const triggerAppStateChange2 = (): void => {
    saveState();
    document.querySelector("opa-text-controls").setAttribute("text", getText());
    document.querySelector("opa-tabs").setAttribute("selectedTabId", appState.selectedTabId);
}

const toast = (message: string) => {
    document.querySelector("#toastManager").innerHTML = message;
    (window as any).toastManager.show();
};

const setText = (text: string, onlyLocalStorage?: boolean): void => {
    const tab = getTabById(appState.selectedTabId);
    tab.text = text;
    saveState();
    if (!onlyLocalStorage) {
        //triggerAppStateChange2();
        document.querySelector("opa-text-controls").setAttribute("text", text);
    }
};

const getText = (): string => {
    const tab = getTabById(appState.selectedTabId);
    return tab.text;
}

const setProcessId = (processId: string): void => {
    document.querySelector("opa-tts-run-controls").setAttribute("processId", processId);
    const tab = getTabById(appState.selectedTabId);
    tab.processId = processId;
    saveState();
}
const getProcessId = (): string => {
    const tab = getTabById(appState.selectedTabId);
    return tab.processId;
}

const setButtonsVisibility = (progress: number, disableSendBtn: boolean, disableCancelBtn: boolean, disableDownloadBtn: boolean): void => {
    const opaTssRunControls = document.querySelector("opa-tts-run-controls")
    if (progress !== undefined) {
        opaTssRunControls.setAttribute("progress", String(progress));
    }
    if (disableSendBtn !== undefined) {
        opaTssRunControls.setAttribute("disableSendBtn", String(disableSendBtn));
    }
    if (disableCancelBtn !== undefined) {
        opaTssRunControls.setAttribute("disableCancelBtn", String(disableCancelBtn));
    }
    if (disableDownloadBtn !== undefined) {
        opaTssRunControls.setAttribute("disableDownloadBtn", String(disableDownloadBtn));
    }
}

const download = (): void => {
    console.log("AppService.download");
    let url = window.location.origin + ROUTES.download.replace("{processId}", getProcessId());
    window.location.href = url;
};

const getLang = (): string => {
    let lang = window.navigator.language; //TODO set lang
    if (lang.length > 2) {
        lang = lang[0] + lang[1];
    }
    if (lang === "ru") {
        return "ru";
    } else {
        return "en";
    }
}

const newTab = (text?: string): void => {
    const tabId = uuid();
    const lastTabIndex = appState.tabs.length ?
        parseInt(appState.tabs[appState.tabs.length - 1].name.split(" ")[1]) + 1 : "1";
    const tab = {id: tabId, name: strings().OpaTestTextMenu.tab + " " + lastTabIndex, text: text || ""};
    appState.tabs.push(tab);
    appState.selectedTabId = tabId;
    triggerAppStateChange2();
}

const closeCurrentTab = (): void => {
    const currentTab = getTabById(appState.selectedTabId);
    const selectedTabIndex = appState.tabs.indexOf(currentTab);
    const newSelectedTabIndex = selectedTabIndex > 0 ? selectedTabIndex - 1 : 0;

    appState.tabs = appState.tabs.filter(tab => tab.id !== appState.selectedTabId);
    if (appState.tabs.length == 0) {
        newTab();
    }

    appState.selectedTabId = appState.tabs[newSelectedTabIndex].id;
    triggerAppStateChange2();
}

const getState = (): AppState => {
    return appState; //do copy?
}

const selectTab = (tabId: string): void => {
    appState.selectedTabId = tabId;
    triggerAppStateChange2();

    getTabStatus();
}

const splitByChapters = (): void => {
    const splitter = (document.getElementById("chapterSplitText") as any).value;
    let text = getText();

    const r = new RegExp("^" + splitter + " ", "gm");
    const replacer = (match: string): string => "${splitter}" + match;
    text = text.replace(r, replacer);
    let newTabTexts = text.split("${splitter}");

    newTabTexts.forEach(tabText => newTab(tabText));
}

const ROUTES = {
    generate: "/api/voiceBook/generate",
    progress: "/api/voiceBook/{processId}/progress",
    download: "/api/voiceBook/{processId}/download",
    cancel: "/api/voiceBook/{processId}/cancel",
}

let pollingTimerId: any;
const POLLING_PERIOD = 5000;
export const polling = async (processId: string, processStatus: (pollingData: PollingType) => boolean, notFirst?: boolean): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        pollingTimerId = setTimeout(async () => {
            try {
                let response = await fetch(ROUTES.progress.replace("{processId}", processId));
                if (response.status >= 400) {
                    throw new Error(response.toString());
                }
                const pollingData = await response.json() as PollingType;
                const continueFlag = processStatus(pollingData)
                if (continueFlag) {
                    resolve(polling(processId, processStatus, true));
                    return;
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        }, notFirst ? POLLING_PERIOD : 0);
    });
}

export const newProject = (): void => {
    cancel();
    appState = {
        loading: false,
        selectedTabId: null,
        tabs: []
    };
    newTab();
    appState.tabs[0].text = testData0;
    triggerAppStateChange2();
}

let sendAllRightTimeoutId: any;
export const sendAllRight = (): void => {
    let currentTab = getTabById(appState.selectedTabId)
    let tabIndex = appState.tabs.indexOf(currentTab);
    sendAllRightTimeoutId = setTimeout(async () => {
        for (let i = tabIndex; i < appState.tabs.length; i++) {
            console.log("AppService.sendAllRight iteration");
            await send();
            if (i + 1 < appState.tabs.length) {
                appState.selectedTabId = appState.tabs[i + 1].id;
                triggerAppStateChange2();
            }
        }
    });
}

export const send = async (processId?: string): Promise<void> => {
    let time = (new Date()).getTime();
    console.log("AppService.send");
    try {
        if (!processId) {
            console.log("AppService.send::start a new one");
            // setProcessId(null);
            const response = await fetch(ROUTES.generate, {
                method: "POST", body: JSON.stringify({text: getText()}),
                headers: {"Content-Type": "application/json; charset=utf-8"}
            }).then(res => res.json());

            //todo
            if (response.error === "Sorry, only one queue is supported now") {
                alert("Sorry, only one queue is supported now, please try a bit later.");
                return;
            }
            processId = response.processId;
            console.log("AppService.send::processId=", processId);
        }
        console.log("AppService.send::processId=", processId);
        setProcessId(processId);
        setButtonsVisibility(0, true, false, true);

        const pollingStatusCallback = (pollingData: PollingType) => {
            const status = pollingData.status;
            console.log("AppService.send.polling::progress=", status);
            if (status === VoiceProcessStatus.SUCCESS) {
                setButtonsVisibility(null, false, true, false);
                return false;
            } else if (status === VoiceProcessStatus.FAILED || status === VoiceProcessStatus.TERMINATING) {
                throw new Error(`Fail to polling ${processId}, because=${status}`);
                // return false;
            } else {
                setButtonsVisibility(pollingData.progress, true, false, true);
                return true;
            }
        }

        await polling(processId, pollingStatusCallback);
        time = Math.round((new Date()).getTime() - time / 1000);
        console.log("AppService.send - finish, time (in sec) =", time);
    } catch (cause) {
        console.error("AppService.send::failed, cause=", cause);
        setButtonsVisibility(null, false, true, true);
        toast(strings().AppServiceToasts.errorSendToast.replace("{processId}", processId));
        setProcessId(null);
    }
}

const cancel = (): void => {
    console.log("AppService.cancel");
    const processId = getProcessId();
    if (processId) {
        fetch(ROUTES.cancel.replace("{processId}", getProcessId()), {method: "DELETE"}).catch(e => {
            console.error("Failed cancel process", e);
            toast(strings().AppServiceToasts.errorCancelToast);
        });
    }
    clearTimeout(sendAllRightTimeoutId);
    clearTimeout(pollingTimerId);
    setProcessId(null);
    setButtonsVisibility(null, false, true, true);
};


export const AppService = {
    setText,
    newProject,
    send,
    sendAllRight,
    init,
    download,
    cancel,
    getLang,
    newTab,
    closeCurrentTab,
    getState,
    selectTab,
    splitByChapters
};
