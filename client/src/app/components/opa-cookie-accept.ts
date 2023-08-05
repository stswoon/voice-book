import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings.ts";

const template = () => `
<div>
    <span>${strings().OpaCookieAccept.text}<span>
    <ui5-button id="btnOpenTestTextsMenu">${strings().OpaCookieAccept.button}</ui5-button>
</div>
`;

class OpaCookieAccept extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();
        if (localStorage.getItem("cookie-accept")) {
            this.querySelector("div").style.display = "none";
        }
        this.querySelector("ui5-button").addEventListener("click", () => {
            window.localStorage.setItem("cookie-accept", "true");
            this.querySelector("div").style.display = "none";
        });
    }
}

customElements.define("opa-cookie-accept", OpaCookieAccept);
