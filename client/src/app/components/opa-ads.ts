import {AbstractComponent} from "../AbstractComponent";

const template = () => `
<div class="opa-ads_donate">
    <div>
        If you like app you can <a href="https://yoomoney.ru/to/41001998657825">DONATE</a> me.
        Sorry for ads but I need 7$/mo to maintain server.
    </div>
</div>
<div class="opa-ads_yandex">
<!--     Please allow add-block to show ads because I need at least 7$\mo for server maintain.-->
</div>
`;

class OpaAds extends AbstractComponent {
    constructor() {
        super(template);
    }
}

customElements.define("opa-ads", OpaAds);
