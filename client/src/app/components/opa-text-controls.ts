import {AbstractComponent, Template} from "../AbstractComponent";
import {AppService} from "../services/AppService.ts";

interface TemplateParams {
    text: string
}

const template: Template<TemplateParams> = ({text}) => {
    text = (text || "").replaceAll('"', "'");
    return `<ui5-textarea value="${text}"></ui5-textarea>`;
};

class OpaTextControls extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();
        this.querySelector("ui5-textarea").addEventListener("change", e => {
            //console.log("OpaTextControls::change, e=", e);
            AppService.setText((e as any).target.value);
        });
        this.querySelector("ui5-textarea").addEventListener("input", e => {
            //console.log("OpaTextControls::input, e=", e);
            AppService.setText((e as any).target.value, true);
        });
    }

    static get observedAttributes() {
        return ["text"];
    }
}

customElements.define("opa-text-controls", OpaTextControls);


//TODO split on charapters
//TODO count of syumbols

//TODO registration for > 1000 symbols
//TODO notification you use app 10, 50, 100, 500, 1000 - leave feedback on social network. YOu convert 100k,200k,300k (a book) so saved about 300r please donate me a bit
