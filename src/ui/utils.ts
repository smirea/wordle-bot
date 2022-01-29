export const $ = (selector: string, root: HTMLElement | Document | ShadowRoot = global.document): HTMLDivElement | null =>
    root.querySelector(selector);

export const $$ = (selector: string, root: HTMLElement | Document | ShadowRoot = global.document): HTMLDivElement[] =>
    Array.from(root.querySelectorAll(selector));

// in Tampermonkey context, "unsafeWindow" is the global window
export const global = window.unsafeWindow || window;

export const INSTANCE_VAR = 'WordleBot';
