import {AbstractComponent} from "../AbstractComponent";

const template = () => `
<ui5-title level="H1">Voice Book</ui5-title>
<span>v0.12.0</span>
`;

class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-header", OpaHeader);
