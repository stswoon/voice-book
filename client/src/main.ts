import "alpinejs/dist/cdn.min.js"

//https://sap.github.io/ui5-webcomponents/playground/
import "@ui5/webcomponents/dist/Button";
import "@ui5/webcomponents/dist/Title";
import "@ui5/webcomponents/dist/Toast";
import "@ui5/webcomponents/dist/ProgressIndicator";
import "@ui5/webcomponents/dist/Menu";
import "@ui5/webcomponents/dist/MenuItem";
import "@ui5/webcomponents/dist/TextArea"
import "@ui5/webcomponents/dist/BusyIndicator";

import "./app/components/opa-header"
import "./app/components/opa-tts-run-controls"
import "./app/components/opa-text-controls.ts"
import "./app/components/opa-ads.ts"

import "./style.css"

import {AppService} from "./app/AppService.ts";

(window as any).AppService = AppService;
document.addEventListener("DOMContentLoaded", () => {
    AppService.init();
});

