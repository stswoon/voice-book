import {testData0} from "./components/testData.ts";
import {strings} from "./strings.ts";

const ROUTES = {
    generate: "/api/voiceBook/generate",
    progress: "/api/voiceBook/{processId}/progress",
    download: "/api/voiceBook/{processId}/download",
    cancel: "/api/voiceBook/{processId}/cancel",
}

const toast = (message: string) => {
    document.querySelector("#toastManager").innerHTML = message;
    (window as any).toastManager.show();
};

const setText = (text: string, onlyLocalStorage?: boolean): void => {
    localStorage.setItem("text", text);
    if (!onlyLocalStorage) {
        document.querySelector("opa-text-controls").setAttribute("text", text);
    }
};
const getText = (): string => localStorage.getItem("text");

const setProcessId = (processId: string): void => {
    if (processId == null) {
        localStorage.removeItem("processId");
    } else {
        localStorage.setItem("processId", processId);
    }
    document.querySelector("opa-tts-run-controls").setAttribute("processId", processId);
}
const getProcessId = (): string => localStorage.getItem("processId");

let pollingTimerId: any;
const POLLING_PERIOD = 5000;
const polling = async (processId: string, processStatus: (status: string) => boolean, notFirst?: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        pollingTimerId = setTimeout(async () => {
            try {
                const response = await fetch(ROUTES.progress.replace("{processId}", processId)).then(res => res.json());
                const continueFlag = processStatus(response.status)
                if (continueFlag) {
                    return polling(processId, processStatus, true);
                }
                resolve(response.status);
            } catch (e) {
                reject(e);
            }
        }, notFirst ? POLLING_PERIOD : 0);
    });
}

const send = async (processId?: string): Promise<void> => {
    let time = (new Date()).getTime();
    console.log("AppService.send");
    try {
        if (!processId) {
            console.log("AppService.send::start a new one");
            setProcessId(null);
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
        await polling(processId, (status: string) => {
            console.log("AppService.send.polling::progress=", status);
            if (status === "ready") {
                setButtonsVisibility(null, false, true, false);
                return false;
            } else if (status === "notExist" || status === "error") {
                throw new Error(`Fail to polling ${processId}, because=${status}`);
                // return false;
            } else {
                setButtonsVisibility(status as any, true, false, true);
                return true;
            }
        });
        time = Math.round((new Date()).getTime() - time / 1000);
        console.log("AppService.send - finish, time (in sec) =", time);
    } catch (cause) {
        console.error("AppService.send::failed, cause=", cause);
        setButtonsVisibility(null, false, true, true);
        toast(strings().AppServiceToasts.errorSendToast.replace("{processId}", processId));
        setProcessId(null);
    }
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

const init = (): void => {
    if (getText()) {
        setText(getText());
    } else {
        setText(testData0);
    }

    const processId = getProcessId();
    if (processId) {
        setProcessId(processId)
        toast(strings().AppServiceToasts.initGetStatusToast.replace("{processId}", processId));
        send(processId);
    } else {
        setButtonsVisibility(null, false, true, true);
    }
};

const cancel = (): void => {
    console.log("AppService.cancel");
    fetch(ROUTES.cancel.replace("{processId}", getProcessId()), {method: "DELETE"}).catch(e => {
        console.error("Failed cancel process", e);
        toast(strings().AppServiceToasts.errorCancelToast);
    });
    clearTimeout(pollingTimerId);
    setProcessId(null);
    setButtonsVisibility(null, false, true, true);
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

export const AppService = {
    setText, send, init, download, cancel, getLang
};






