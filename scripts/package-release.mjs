// SPDX-License-Identifier: GPL-3.0-only
// Deterministic ZIP packaging using only Node.js standard libraries.
import { readFile, writeFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", root)));
const assets = ["main.js", "manifest.json", "styles.css", "hex-color-list.md"];
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const chunks = [],
  directory = [];
let offset = 0;
for (const name of [...assets, "LICENSE", "NOTICE"]) {
  const bytes = await readFile(
    new URL((assets.includes(name) ? "release/" : "") + name, root),
  );
  const compressed = deflateRawSync(bytes, { level: 9 });
  const filename = Buffer.from(manifest.id + "/" + name);
  const crc = crc32(bytes);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(33, 12); // 1980-01-01, deterministic build date
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(bytes.length, 22);
  local.writeUInt16LE(filename.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(33, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(bytes.length, 24);
  central.writeUInt16LE(filename.length, 28);
  central.writeUInt32LE(offset, 42);
  chunks.push(local, filename, compressed);
  directory.push(central, filename);
  offset += local.length + filename.length + compressed.length;
}
const centralBytes = Buffer.concat(directory),
  end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(directory.length / 2, 8);
end.writeUInt16LE(directory.length / 2, 10);
end.writeUInt32LE(centralBytes.length, 12);
end.writeUInt32LE(offset, 16);
const zipName = `${manifest.id}-${manifest.version}.zip`;
await writeFile(
  new URL("release/" + zipName, root),
  Buffer.concat([...chunks, centralBytes, end]),
);
const sums = [];
for (const name of [...assets, zipName]) {
  const bytes = await readFile(new URL("release/" + name, root));
  sums.push(createHash("sha256").update(bytes).digest("hex") + "  " + name);
}
await writeFile(new URL("release/SHA256SUMS", root), sums.join("\n") + "\n");
console.log(
  `Prepared six optional installation-kit files; Community releases use only community-release/, including ${zipName} and SHA256SUMS.`,
);
