import {AbstractComponent} from "../AbstractComponent";
import {strings} from "../strings.ts";

const template = () => `
<div class="opa-ads_donate">
    <div>
        ${strings().OpaAds.donate.replace("{DONATE}", '<a href="https://yoomoney.ru/to/41001998657825">DONATE</a>')}
    </div>
</div>
<!-- Yandex.RTB R-A-2572196-1 -->
<div class="opa-ads_yandex" id="yandex_rtb_R-A-2572196-1">${strings().OpaAds.adblockDisable}</div>
</script>
`;

class OpaAds extends AbstractComponent {
    constructor() {
        super(template);
    }

    protected render() {
        super.render();
        setTimeout(() => {
            const W = (window as any);
            W.yaContextCb.push(() => {
                W.Ya.Context.AdvManager.render({
                    "blockId": "R-A-2572196-1",
                    "renderTo": "yandex_rtb_R-A-2572196-1"
                })
            });
        })
    }
}

customElements.define("opa-ads", OpaAds);
