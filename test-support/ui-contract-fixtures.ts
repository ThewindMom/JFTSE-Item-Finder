/**
 * Shared source-loading helpers for UI contract tests.
 * Fixtures live under test-support/; project files resolve one level up.
 */

export function projectUrl(name: string): URL {
    const rel = name.startsWith("./") ? name.slice(2) : name;
    return new URL(`../${rel}`, import.meta.url);
}

export async function projectFile(name: string): Promise<string> {
    return Bun.file(projectUrl(name)).text();
}

export async function projectJson<T>(name: string): Promise<T> {
    return Bun.file(projectUrl(name)).json() as Promise<T>;
}

export async function projectExists(name: string): Promise<boolean> {
    return Bun.file(projectUrl(name)).exists();
}

export async function projectBytes(name: string): Promise<Uint8Array> {
    return new Uint8Array(await Bun.file(projectUrl(name)).arrayBuffer());
}
