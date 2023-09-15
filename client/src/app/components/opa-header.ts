import {AbstractComponent, Template} from "../AbstractComponent";

const template: Template<any> = ({version}) => `
<ui5-title level="H1">Voice Book</ui5-title>
<div>
    <div>v.${version}</div>
    <div>(powered by <ui5-link href="https://silero.ai" target="_blank">silero)</ui5-link></div>
</div>
<ui5-icon class="opa-header__right" name="bell-2"></ui5-icon>
`;

class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);
    }

    static get observedAttributes(): string[] {
        return ["version"];
    }
}

customElements.define("opa-header", OpaHeader);
