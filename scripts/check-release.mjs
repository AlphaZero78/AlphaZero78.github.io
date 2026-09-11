import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadContent } from "./archive-content.mjs";

const content = await loadContent();
const serialized = JSON.stringify(content);
for (const value of ["待合并", "未合并", "JOYCE MOORE"]) {
  assert(!serialized.includes(value), `Unexpected private or stale wording: ${value}`);
}
assert(!/\b1[3-9]\d{9}\b/.test(serialized), "Do not publish personal mobile numbers");
assert(!/(?:手机号|出生日期|出生年月|籍贯|政治面貌|专业排名|课程成绩)/.test(serialized), "Unexpected private resume fields");
for (const page of ["index.html", "profile.html"]) {
  const html = await readFile(`dist/${page}`, "utf8");
  assert(html.includes("董梓涵"));
  assert(!/(?:src|href)="\/(?!\/)/.test(html), `${page} must support subdirectory hosting`);
  for (const [, url] of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)/g)) await access(`dist/${url.slice(2)}`);
}
const pwa = JSON.parse(await readFile("dist/pwa-build.json", "utf8"));
for (const path of ["profile.html", "portrait.png", "index.html"]) assert(pwa.files.includes(path), `Offline manifest missing ${path}`);
for (const record of content.records) await access(`dist/archives/ZIHAN-${record.id}.txt`);
const photoHash = createHash("sha256").update(await readFile("public/portrait.png")).digest("hex");
assert.equal(photoHash, "6da8ab48e9ea694af04f1c83e4ba068d5e860627c3e12236a803f3ecd68b2b94", "Keep the approved original portrait unchanged");
console.log(`RELEASE_CHECK_PASS: ${content.records.length} records, two entry pages, subdirectory paths, private-field scan, original portrait, offline manifest.`);
