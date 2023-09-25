import {AbstractComponent, Template} from "../AbstractComponent";
import {AppService} from "../services/AppService";

const template: Template<any> = ({selectedtabid, tabs}) => {
    tabs = tabs || [];
    const ui5Tabs: string = tabs.map(tab => {
        //return `<ui5-tab text="${tab.name}" ${tab.id === selectedtabid ? "selected" : ""} id="${tab.id}" disabled></ui5-tab>`
        return `<ui5-tab text="${tab.name}" ${tab.id === selectedtabid ? "selected" : ""} id="${tab.id}"></ui5-tab>`
    })
    return `<ui5-tabcontainer fixed collapsed>${ui5Tabs}</ui5-tabcontainer>`;
};

class OpaTabs extends AbstractComponent {
    constructor() {
        super(template, {tabs: []});
    }

    static get observedAttributes(): string[] {
        return ["selectedtabid"];
    }

    protected render() {
        this.state.tabs = AppService.getState().tabs || [];
        super.render();
        this.querySelector("ui5-tabcontainer").addEventListener("ui5-tab-select", (event:  any) => {
            AppService.selectTab(event.detail.tab.id);
        });
    }
}

customElements.define("opa-tabs", OpaTabs);
