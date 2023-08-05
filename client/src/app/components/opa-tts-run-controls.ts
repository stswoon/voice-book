import {AbstractComponent, Template} from "../AbstractComponent";
import {strings} from "../strings";
import {testData0, testData1, testData2} from "./testData";
import {AppService} from "../AppService.ts";

interface OpaTtsRunControlsState {
    disableSendBtn: boolean;
    disableCancelBtn: boolean;
    disableDownloadBtn: boolean;
    // processId: string;
    // queueStatus: string;
    progress: number;
}

const template: Template<any> = (params) => {
    const state: OpaTtsRunControlsState = {
        disableSendBtn: params.disablesendbtn === "true", //TODO to lovercase in abstractcomponent
        disableCancelBtn: params.disablecancelbtn === "true",
        disableDownloadBtn: params.disabledownloadbtn === "true",
        progress: params.progress == "null" ? null : Number(params.progress)
    }
    //TODO move menu
    return `
        <div class="opa-tts-run-controls" x-data='{ state:${JSON.stringify(state)} }'>
            <div>
                <ui5-button id="btnOpenTestTextsMenu">${strings().OpaTestTextMenu.menuTitle}</ui5-button>
                <ui5-menu>
                    <ui5-menu-item text="${strings().OpaTestTextMenu.itemGreetings}" id="testTextsMenu_Greetings"></ui5-menu-item>
                    <ui5-menu-item text="${strings().OpaTestTextMenu.itemHelloWorld}" id="testTextsMenu_HelloWorld"></ui5-menu-item>
                    <ui5-menu-item text="${strings().OpaTestTextMenu.itemThreePigs}" id="testTextsMenu_ThreePigs"></ui5-menu-item>
                </ui5-menu>
            </div>
            <ui5-button design="Emphasized" x-bind:disabled="state.disableSendBtn" @click="AppService.send()">${strings().OpaTtsRunControls.send}</ui5-button>
            <ui5-busy-indicator x-show="state.progress != null" size="Small" delay="0" active></ui5-busy-indicator>
            <ui5-button x-bind:disabled="state.disableCancelBtn" @click="AppService.cancel()">${strings().OpaTtsRunControls.cancel}</ui5-button>
            <ui5-progress-indicator x-show="state.progress != null" x-bind:value="state.progress"></ui5-progress-indicator>
            <ui5-button x-bind:disabled="state.disableDownloadBtn" @click="AppService.download()">${strings().OpaTtsRunControls.download}</ui5-button>
        </div>
    `;
    //<ui5-label x-show="state.processId">Id: ${state.processId}</ui5-label>
    //<ui5-label x-show="state.queueStatus != null">Queue: ${state.queueStatus}</ui5-label>
};

class OpaTtsRunControls extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();

        this.querySelector("#btnOpenTestTextsMenu").addEventListener("click", () => {
            (this.querySelector("ui5-menu") as any).showAt(this.querySelector("#btnOpenTestTextsMenu"));
        });
        this.querySelector("ui5-menu").addEventListener("item-click", e => {
            console.log("OpaTtsRunControls::Click on menuItem::e=", e)
            const id = (e as any).detail.item.id;
            let testData = "";
            if (id === "testTextsMenu_Greetings") {
                testData = testData0;
            } else if (id === "testTextsMenu_HelloWorld") {
                testData = testData1;
            } else if (id === "testTextsMenu_ThreePigs") {
                testData = testData2;
            }
            AppService.setText(testData);
        });
    }

    static get observedAttributes(): string[] {
        return ["disablesendbtn", "disablecancelbtn", "disabledownloadbtn", "progress"];
    }
}

customElements.define("opa-tts-run-controls", OpaTtsRunControls);
