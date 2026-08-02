/**
 * Minimal DOM/window harness for unit tests that exercise table builders
 * (e.g. getResultsTable) without a browser. Installs HTMLElement-like
 * constructors, document, and window on globalThis; returns a restore fn.
 */

export type DomNode = {
    tagName: string;
    children: Array<DomNode | string>;
    attrs: Record<string, string>;
    className: string;
    hidden: boolean;
    style: Record<string, string>;
    classList: {
        add(): void;
        remove(): void;
        contains(): boolean;
        toggle(): void;
    };
    setAttribute(key: string, value: string): void;
    getAttribute(key: string): string | null;
    append(...nodes: Array<DomNode | string | null | undefined>): void;
    appendChild(node: DomNode): DomNode;
    addEventListener(): void;
    removeEventListener(): void;
    textContent: string;
    getElementsByClassName(cls: string): DomNode[];
    getElementsByTagName(tag: string): DomNode[];
    querySelector(): null;
    querySelectorAll(): DomNode[];
    readonly tBodies: DomNode[];
    readonly rows: DomNode[];
};

class ElementNode implements DomNode {
    tagName: string;
    children: Array<DomNode | string> = [];
    attrs: Record<string, string> = {};
    className = "";
    hidden = false;
    style: Record<string, string> = {};
    classList = {
        add() {},
        remove() {},
        contains() {
            return false;
        },
        toggle() {},
    };

    constructor(tag: string) {
        this.tagName = String(tag).toUpperCase();
    }

    setAttribute(key: string, value: string): void {
        this.attrs[key] = String(value);
        if (key === "class") {
            this.className = String(value);
        }
    }

    getAttribute(key: string): string | null {
        return this.attrs[key] ?? null;
    }

    append(...nodes: Array<DomNode | string | null | undefined>): void {
        for (const node of nodes) {
            if (node == null) {
                continue;
            }
            this.children.push(node as DomNode | string);
        }
    }

    appendChild(node: DomNode): DomNode {
        this.append(node);
        return node;
    }

    addEventListener(): void {}
    removeEventListener(): void {}

    get textContent(): string {
        let text = "";
        for (const child of this.children) {
            text += typeof child === "string" ? child : child.textContent;
        }
        return text;
    }

    set textContent(value: string) {
        this.children = [String(value)];
    }

    getElementsByClassName(cls: string): DomNode[] {
        const out: DomNode[] = [];
        const walk = (node: DomNode | string): void => {
            if (typeof node === "string") {
                return;
            }
            if ((node.className || "").split(/\s+/).includes(cls)) {
                out.push(node);
            }
            for (const child of node.children) {
                walk(child);
            }
        };
        walk(this);
        return out;
    }

    getElementsByTagName(tag: string): DomNode[] {
        const out: DomNode[] = [];
        const wanted = tag.toUpperCase();
        const walk = (node: DomNode | string): void => {
            if (typeof node === "string") {
                return;
            }
            if (node.tagName === wanted) {
                out.push(node);
            }
            for (const child of node.children) {
                walk(child);
            }
        };
        walk(this);
        return out;
    }

    querySelector(): null {
        return null;
    }

    querySelectorAll(): DomNode[] {
        return [];
    }

    get tBodies(): DomNode[] {
        return this.children.filter(
            (child): child is DomNode =>
                typeof child !== "string" && child.tagName === "TBODY",
        );
    }

    get rows(): DomNode[] {
        return this.getElementsByTagName("tr");
    }
}

/** In-memory localStorage stand-in for tests that touch Variable_storage. */
export class MemoryLocalStorage {
    private readonly values = new Map<string, string>();

    get length(): number {
        return this.values.size;
    }

    clear(): void {
        this.values.clear();
    }

    getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    key(index: number): string | null {
        return Array.from(this.values.keys())[index] ?? null;
    }

    removeItem(key: string): void {
        this.values.delete(key);
    }

    setItem(key: string, value: string): void {
        this.values.set(key, String(value));
    }
}

export function installMemoryLocalStorage(
    target: typeof globalThis = globalThis,
): MemoryLocalStorage {
    const memory = new MemoryLocalStorage();
    Object.defineProperty(target, "localStorage", {
        configurable: true,
        value: memory,
    });
    return memory;
}

/**
 * Install a fetch stub that records calls and returns a fixed Response-like
 * payload. Useful when production modules call fetch during import or setup.
 */
export function installFetchStub(
    handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> | Response = () =>
        new Response("{}", { headers: { "Content-Type": "application/json" } }),
    target: typeof globalThis = globalThis,
): () => void {
    const previous = target.fetch;
    const stub = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
        handler(input, init);
    (target as { fetch: typeof fetch }).fetch = stub as typeof fetch;
    return () => {
        if (previous) {
            (target as { fetch: typeof fetch }).fetch = previous;
        } else {
            Reflect.deleteProperty(target, "fetch");
        }
    };
}

export function installDomWindowHarness(
    target: typeof globalThis = globalThis,
): () => void {
    const previous = {
        HTMLElement: target.HTMLElement,
        HTMLTableElement: (target as { HTMLTableElement?: unknown }).HTMLTableElement,
        HTMLDialogElement: (target as { HTMLDialogElement?: unknown }).HTMLDialogElement,
        document: target.document,
        window: target.window,
    };

    (target as { HTMLElement: unknown }).HTMLElement = ElementNode;
    (target as { HTMLTableElement: unknown }).HTMLTableElement = ElementNode;
    (target as { HTMLDialogElement: unknown }).HTMLDialogElement = ElementNode;
    const body = new ElementNode("body");
    (target as { document: unknown }).document = {
        body,
        createElement(tag: string) {
            return new ElementNode(tag);
        },
        createElementNS(_namespace: string, tag: string) {
            return new ElementNode(tag);
        },
        getElementById() {
            return null;
        },
        createTextNode(text: string) {
            return String(text);
        },
    };
    (target as { window: unknown }).window = target;

    return () => {
        if (previous.HTMLElement) {
            (target as { HTMLElement: unknown }).HTMLElement = previous.HTMLElement;
        } else {
            Reflect.deleteProperty(target, "HTMLElement");
        }
        if (previous.HTMLTableElement) {
            (target as { HTMLTableElement: unknown }).HTMLTableElement = previous.HTMLTableElement;
        } else {
            Reflect.deleteProperty(target, "HTMLTableElement");
        }
        if (previous.HTMLDialogElement) {
            (target as { HTMLDialogElement: unknown }).HTMLDialogElement = previous.HTMLDialogElement;
        } else {
            Reflect.deleteProperty(target, "HTMLDialogElement");
        }
        if (previous.document) {
            (target as { document: unknown }).document = previous.document;
        } else {
            Reflect.deleteProperty(target, "document");
        }
        if (previous.window) {
            (target as { window: unknown }).window = previous.window;
        } else {
            Reflect.deleteProperty(target, "window");
        }
    };
}

/** @deprecated Prefer installDomWindowHarness — kept as a clear alias. */
export const installDomMock = installDomWindowHarness;
