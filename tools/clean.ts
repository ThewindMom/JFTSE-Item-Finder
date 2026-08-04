import { rm } from "node:fs/promises";

const generated = new Bun.Glob("*.js");
const paths: string[] = [];

for await (const path of generated.scan({ cwd: ".", onlyFiles: true })) {
    paths.push(path);
}

await Promise.all(paths.map(path => rm(path)));
