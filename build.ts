import { build } from "bun";
import path from "path";

const OUTPUT_DIR = "./dist";
const BOOKMARKLET_FILE = "bookmarklet.txt";

const result = await build({
  entrypoints: ["./src/index.ts"],
  minify: true,
});

for (const res of result.outputs) {
    Bun.write(path.join(OUTPUT_DIR, res.path), res);

    const wrappedCode = `(async()=>{${await res.text()}})()`
    const bookmarklet = "javascript:" + encodeURIComponent(wrappedCode);
    Bun.write(path.join(OUTPUT_DIR, BOOKMARKLET_FILE), bookmarklet);
}