// SPDX-License-Identifier: GPL-3.0-only
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const [defaultPath, releasePath, tag] = process.argv.slice(2);
assert.ok(defaultPath && releasePath && tag, 'Usage: node scripts/check-manifest-alignment.mjs DEFAULT_MANIFEST RELEASE_MANIFEST TAG');
assert.match(tag, /^\d+\.\d+\.\d+$/, 'Use an exact x.y.z tag');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const local = read('manifest.json');
const current = read(defaultPath);
const released = read(releasePath);
for (const [label, value] of [['tag checkout',local],['default branch',current],['release attachment',released]]) {
  assert.equal(value.version, tag, `${label} version must match ${tag}`);
  assert.deepEqual(value, local, `${label} manifest differs from the tagged repository manifest`);
}
console.log(`Manifest alignment verified: default branch, tag ${tag}, and release attachment.`);
