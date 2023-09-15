import {AbstractComponent, Template} from "../AbstractComponent";

const template: Template<any> = ({version}) => `
 <ui5-tabcontainer
    fixed=""
    collapsed=""
    data-sap-ui-fastnavgroup="true"
    media-range="XL"
  >
    <ui5-tab text="Home" slot="default-1"></ui5-tab>
    <ui5-tab text="What's new" selected="" slot="default-2"></ui5-tab>
    <ui5-tab text="Who are we" slot="default-3"></ui5-tab>
    <ui5-tab text="About" slot="default-4"></ui5-tab>
    <ui5-tab text="Contacts" slot="default-5"></ui5-tab>
  </ui5-tabcontainer>
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
