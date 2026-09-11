import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { zipSync, strToU8 } from "three/addons/libs/fflate.module.js";

const dist = resolve("dist");
const files = {};
async function collect(folder, prefix = "") {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) await collect(join(folder, entry.name), name + "/");
    else files[name] = new Uint8Array(await readFile(join(folder, entry.name)));
  }
}
await collect(dist);
if (!files["index.html"] || !files["profile.html"]) throw new Error("Run the production build before packaging.");
files["DEPLOYMENT.txt"] = strToU8("Zihan Dong / Personal Archive\nUpload the contents of this archive to a static web host. Both root and subdirectory hosting are supported. No backend or API key is required.\nSource and credits: https://github.com/AlphaZero78/homepage-rhine-lab\n");
await mkdir("release", { recursive: true });
const archive = zipSync(files, { level: 6 });
await writeFile("release/homepage-rhine-lab-dist.zip", archive);
console.log(`Packaged ${Object.keys(files).length} static files, ${(archive.length / 1024 / 1024).toFixed(1)} MiB.`);
