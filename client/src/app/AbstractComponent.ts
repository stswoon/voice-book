// import "./user-list-component.css";
// import template from "./user-list-component.html?raw";

// https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
// https://reactgo.com/javascript-convert-string-literal/
export const interpolateTemplateString = (s: string, params: object): string => {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${s}\`;`)(...vals);
}

export type Template<T> = (params: T) => string;

//https://learn.javascript.ru/custom-elements
export abstract class AbstractComponent extends HTMLElement {
    protected readonly template: Template<any>;
    protected state: any = {};

    protected constructor(template: Template<any>, state?: any) {
        super();
        this.template = template;
        this.state = state || {};
    }

    protected render() {
        let params: any = {};
        const observedAttributes = (this.constructor as any).observedAttributes
        //console.log("observedAttributes: ", observedAttributes);
        for (let attribute of observedAttributes) {
            params[attribute] = this.getAttribute(attribute);
        }
        params = {...params, ...this.state}
        console.debug(`Params for ${this.constructor.name} template: `, params);
        this.innerHTML = this.template(params);
    }

    static get observedAttributes(): string[] {
        return [];
    }

    protected attributeChangedCallback(): void {
        this.render();
    }

    private rendered: boolean = false;

    //@ts-ignore
    private connectedCallback(): void {
        if (this.rendered) return;
        this.rendered = true;
        this.render();
    }
}
