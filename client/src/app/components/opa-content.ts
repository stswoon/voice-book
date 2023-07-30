import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings";
import {testData1, testData2} from "./testData";

const template = (params: any) => {
    const progress = params["progress"];
    const showDownloadBtn = params["showDownloadBtn"];
    const disableSendBtn = params["disableSendBtn"];
    const text = params["text"];
    return `
        <div class="opa-content" x-data="{ progress:${progress}, showDownloadBtn:${showDownloadBtn}, disableSendBtn:${disableSendBtn} }">
            <div class="opa-content_controls">
                <ui5-button id="longStory">Set Long Story</ui5-button>
                <ui5-button id="send" design="Emphasized" x-bind:disabled="disableSendBtn">${strings.send}</ui5-button>
                <ui5-progress-indicator x-bind:value="progress" x-show="progress != null"></ui5-progress-indicator>
                <ui5-button id="download" x-show="showDownloadBtn">${strings.download}</ui5-button>
            </div>
            <div>
                <textarea id="input" cols="100" rows="30">${text}</textarea>
            </div>
        </div>
    `;
};

class OpaContent extends AbstractComponent {
    constructor() {
        super(template, {progress: null, showDownloadBtn: false, disableSendBtn: false, text: testData1});
    }

    processId = null;

    protected render() {
        super.render();

        this.querySelector("#longStory")!.addEventListener("click", () => {
            this.state.text = testData2;
            this.render();
        });

        this.querySelector("#download")!.addEventListener("click", () => {
            let url = "/api/generateVoiceBook/" + this.processId;

            let domain = window.location.host;
            if (domain.startsWith("localhost:")) {
                console.log("use local dev domain");
                domain = "//localhost:3000";
                url = domain + url;
            } else {
                window.location.href = window.location.origin + url;
            }
            window.location.href = url;
        });

        this.querySelector("#send")!.addEventListener("click", () => {
            this.processId = null;
            console.log("sending text...");
            const text = (<any>document.getElementById("input")).value;
            this.state.text = text;
            const data = {text};

            let url = "/api/generateVoiceBook"
            url = fixUrlDomain(url);

            fetch(url, {
                method: "POST", body: JSON.stringify(data),
                headers: {"Content-Type": "application/json; charset=utf-8"}
            })
                .then(res => res.json())
                .then(res => {
                    if (res.error === "Sorry, only one queue is supported now") {
                        alert("Sorry, only one queue is supported now, please try a bit later.");
                        return;
                    }


                    this.processId = res.processId;

                    this.state.progress = 0;
                    this.state.disableSendBtn = true;
                    this.state.showDownloadBtn = false;
                    this.render();

                    poll(this.processId!, (status:string) => {
                        if (status === "ready") {
                            this.state.progress = null;
                            this.state.disableSendBtn = false;
                            this.state.showDownloadBtn = true;
                            this.render();
                            return false;
                        } else if (status === "notExist" || status === "error") {
                            alert(status);
                            this.state.progress = null;
                            this.state.disableSendBtn = false;
                            this.render();
                            return false;
                        } else {
                            this.state.progress = status;
                            this.render();
                            return true;
                        }
                    });
                })
                .catch(cause => {
                    console.error(cause);
                    alert("Error");
                });
        });
    }
}

customElements.define("opa-content", OpaContent);

function poll(processId: string, processStatus: (status:string) => boolean) {
    setTimeout(() => {
        fetch(fixUrlDomain("/api/generateVoiceBook/progress/") + processId)
            .then(res => res.json())
            .then(res => {
                if (processStatus(res.status)) {
                    poll(processId, processStatus);
                }
            })
            .catch(cause => {
                console.error(cause);
                alert("Error");
            });
    }, 5000);
}

function fixUrlDomain(url: string): string {
    let domain = window.location.host;
    if (domain.startsWith("localhost:")) {
        console.log("use local dev domain");
        domain = "//localhost:3000";
        url = domain + url;
    }
    return url;
}
