// SPDX-License-Identifier: GPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const tag = process.env.RELEASE_TAG;
assert.match(tag || "", /^\d+\.\d+\.\d+$/, "Use an exact x.y.z tag without v");
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
assert.equal(tag, manifest.version, "Tag must match the checked-out manifest");
console.log(`Preparing draft release ${tag}`);
