import fs from "node:fs/promises";
import { loadContent, archiveText } from "./archive-content.mjs";

// Validate the entire input before writing any downloads.
const { records } = await loadContent();
const output = new URL("../public/archives/", import.meta.url);
await fs.mkdir(output, { recursive: true });
const expected = new Set(records.map(record => `ZIHAN-${record.id}.txt`));
for (const name of await fs.readdir(output)) {
  if (/^ZIHAN-X-\d{3}\.txt$/.test(name) && !expected.has(name)) await fs.unlink(new URL(name, output));
}
for (const record of records) {
  await fs.writeFile(
    new URL(`ZIHAN-${record.id}.txt`, output),
    archiveText(record),
    "utf8",
  );
}
console.log(`Prepared ${records.length} downloadable archive records.`);
