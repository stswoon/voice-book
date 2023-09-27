import {AbstractComponent, Template} from "../AbstractComponent";

const template: Template<any> = ({}) => `
  <ui5-shellbar
    primary-title="Corporate Portal"
    logo="../assets/images/sap-logo-svg.svg"
    show-notifications=""
    data-sap-ui-fastnavgroup="true"
    breakpoint-size="XL"
  ></ui5-shellbar>
  <ui5-popover placement-type="Bottom" horizontal-align="Right" style="max-width: 400px" media-range="S">
    <ui5-list header-text="Notifications" data-sap-ui-fastnavgroup="true">
      <ui5-li-notification show-close="" has-border="">
        And with a very long description and long labels of the action buttons -
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
        feugiat, turpis vel scelerisque pharetra, tellus odio vehicula dolor,
        nec elementum lectus turpis at nunc.
      </ui5-li-notification>
    </ui5-list>
  </ui5-popover>

<script type="text/javascript">
  var notificationList = document.querySelector("ui5-list");
  notificationList.addEventListener("item-close", e => {
      e.detail.item.hidden = true;
  });
</script>
<script type="text/javascript">
  var shellbar = document.querySelector("ui5-shellbar");
  var notificationsPopover = document.querySelector("ui5-popover");

  shellbar.addEventListener("notifications-click", e => {
      event.preventDefault();
      notificationsPopover.showAt(e.detail.targetRef);
  });
</script>
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
