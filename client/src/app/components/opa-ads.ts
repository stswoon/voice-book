import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings.ts";

const template = () => `
<div class="opa-ads_donate">
    <div>
        ${strings().OpaAds.donate.replace("{DONATE}", '<a href="https://yoomoney.ru/to/41001998657825">DONATE</a>')}
    </div>
</div>
<!--<div class="opa-ads_yandex">${strings().OpaAds.adblockDisable}</div>-->
`;

class OpaAds extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-ads", OpaAds);
