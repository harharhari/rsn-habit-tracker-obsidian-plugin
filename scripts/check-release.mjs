// SPDX-License-Identifier: GPL-3.0-only
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../", import.meta.url);
const read = (name) => readFile(new URL(name, root));
const manifest = JSON.parse(await read("manifest.json"));
const pkg = JSON.parse(await read("package.json"));
const versions = JSON.parse(await read("versions.json"));
assert.equal(manifest.version, pkg.version);
assert.equal(versions[manifest.version], manifest.minAppVersion);
assert.equal(manifest.author, "harharhari");
assert.equal(manifest.id, "habit-calendar-001b");
assert.equal(pkg.license, "GPL-3.0-only");
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.ok(
  manifest.description.length <= 250 && manifest.description.endsWith("."),
);
assert.ok(
  (await read("LICENSE")).toString().includes("GNU GENERAL PUBLIC LICENSE"),
);
const hashes = [];
for (const name of [
  "main.js",
  "manifest.json",
  "styles.css",
  "hex-color-list.md",
]) {
  const bytes = await read(name);
  assert.deepEqual(
    await read("release/" + name),
    bytes,
    `${name} differs from the release asset`,
  );
  hashes.push(createHash("sha256").update(bytes).digest("hex") + "  " + name);
}
await writeFile(new URL("release/SHA256SUMS", root), hashes.join("\n") + "\n");
console.log(
  "Release versions, license declaration, metadata and asset consistency verified.",
);

const colors = (await read("hex-color-list.md"))
  .toString()
  .split("\n")
  .filter((line) => /^\| [a-z]+ \| #[A-F0-9]{6} \|/.test(line));
assert.equal(colors.length, 147, "Expected all 147 CSS3 named colors");
assert.ok(colors.some((line) => line.startsWith("| green | #008000 |")));
assert.ok(colors.some((line) => line.startsWith("| gray | #808080 |")));
assert.ok(!colors.some((line) => line.includes("rebeccapurple")));
