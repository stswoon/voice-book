import {AbstractComponent, Template} from "../AbstractComponent";
import {AppService} from "../AppService.ts";

interface TemplateParams {
    text: string
}

const template: Template<TemplateParams> = ({text}) => {
    // text = text.replaceAll('"', '\\"');
    text = (text || "").replaceAll('"', "'");
    return `
     <ui5-textarea value="${text}"></ui5-textarea>
    `;
};

class OpaTextControls extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();
        this.querySelector("ui5-textarea").addEventListener("change", e => {
            console.log("OpaTextControls::onchange, e=", e);
            AppService.setText((e as any).target.value);
        });
    }

    static get observedAttributes() {
        return ["text"];
    }
}

customElements.define("opa-text-controls", OpaTextControls);
