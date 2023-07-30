import {AbstractComponent} from "../AbstractComponent";

const template = () => `
<div class="opa-header">
     <ui5-title level="H1">Voice Book</ui5-title>
</div>
`;

class OpaHeader extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-header", OpaHeader);
