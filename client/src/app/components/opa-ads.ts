import {AbstractComponent} from "../AbstractComponent";

const template = () => `
<div>
     Donate me
</div>
<div>
     Please allow add-block to show ads because I need at least 7$\mo for server maintain.
</div>
`;

class OpaAds extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-ads", OpaAds);
