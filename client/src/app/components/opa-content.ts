import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings";

const testData = `
Привет Мир!
[{(Привет Мир два!)}]
'"Привет Мир три!"'
Привет Мир четыре.
Hello World 6

0123456789

Во все большем количестве российских изданий − как печатных, так и онлайновых − появляются объемные материалы особого типа, за которыми в журналистской среде закрепилось название «длинные тексты» (англ. – long forms) или лонгриды (от англ. − long read – материал, предназначенный для длительного прочтения, в отличие от маленькой заметки). Сразу же следует оговориться, что объем материала – хотя и наиболее заметная, но не ключевая характеристика лонгрида. Объемными могут быть и материалы других жанров, поэтому сам по себе большой объем текста вовсе не означает, что перед нами лонгрид. Как будет показано в исследовании, лонгриды отличает также особый подход к выбору темы, требования к качеству собранной информации и способ подачи материала. В исследовании предпринята попытка описать типологические характеристики лонгридов, разобрать особенности их подготовки, а также выявить распространенность лонгридов в современной российской прессе. Еще одной целью исследования является оценка перспектив этого жанра, о котором можно говорить если не как о сложившемся (в принятых на сегодняшний день в научной среде жанровых классификациях лонгрид отсутствует), то как о складывающемся и проникающем во все большее количество изданий.
`

const template = (params: any) => {
    const progress = params["progress"];
    const showDownloadBtn = params["showDownloadBtn"];
    const disableSendBtn = params["disableSendBtn"];
    return `
        <div class="opa-content" x-data="{ progress:${progress}, showDownloadBtn:${showDownloadBtn}, disableSendBtn:${disableSendBtn} }">
            <div class="opa-content_controls">
                <ui5-button id="send" design="Emphasized" x-bind:disabled="disableSendBtn">${strings.send}</ui5-button>
                <ui5-progress-indicator x-bind:value="progress" x-show="progress != null"></ui5-progress-indicator>
                <ui5-button id="download" x-show="showDownloadBtn">${strings.download}</ui5-button>
            </div>
            <div>
                <textarea id="input" cols="100" rows="30">${testData}</textarea>
            </div>
        </div>
    `;
};

class OpaContent extends AbstractComponent {
    constructor() {
        super(template, {progress: null, showDownloadBtn: false, disableSendBtn: false});
    }

    processId = null;


    protected connectedCallback() {
        super.connectedCallback();

        //let component = this;

        this.querySelector("#download")!.addEventListener("click", () => {
            window.location.href = window.location.origin + "/api/generateVoiceBook/" + this.processId;
        });

        this.querySelector("#send")!.addEventListener("click", () => {
            this.processId = null;
            console.log("sending text...");
            const text = (<any>document.getElementById("input")).value;
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
                        alert(res.error);
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

    protected render() {
        super.render();
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
