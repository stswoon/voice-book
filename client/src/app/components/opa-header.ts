import {AbstractComponent, Template} from "../AbstractComponent";

const template: Template<any> = ({version}) => `<ui5-title level="H1">Voice Book</ui5-title><span>${version}</span>`;

class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);
    }

    static get observedAttributes(): string[] {
        return ["version"];
    }
}

customElements.define("opa-header", OpaHeader);
