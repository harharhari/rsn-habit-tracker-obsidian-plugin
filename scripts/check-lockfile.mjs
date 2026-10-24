// SPDX-License-Identifier: GPL-3.0-only
// Dependency-free pre-install check: run before npm ci on every OS.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
const read = (name) => JSON.parse(readFileSync(name, "utf8"));
const pkg = read("package.json"),
  manifest = read("manifest.json"),
  lock = read("package-lock.json");
assert.equal(
  pkg.version,
  manifest.version,
  "package and manifest versions differ",
);
assert.equal(lock.version, pkg.version, "stale lockfile version");
assert.equal(
  lock.packages[""].version,
  pkg.version,
  "stale lockfile root version",
);
assert.deepEqual(
  lock.packages[""].devDependencies,
  pkg.devDependencies,
  "lockfile dependency requirements differ",
);
const typed = lock.packages["node_modules/which-typed-array"];
assert.ok(typed, "which-typed-array entry missing; review dependency graph");
assert.notEqual(
  typed.version,
  "1.1.34",
  "Stale broken lockfile: replace it with the repaired release lockfile, then commit and run the NEW commit.",
);
assert.equal(
  typed.resolved,
  `https://registry.npmjs.org/which-typed-array/-/which-typed-array-${typed.version}.tgz`,
);
assert.ok(typed.integrity?.startsWith("sha512-"), "Missing package integrity");
console.log(
  JSON.stringify(
    {
      commit: process.env.GITHUB_SHA || "local",
      platform: process.platform,
      node: process.version,
      plugin: manifest.id,
      version: pkg.version,
      lockfileSha256: createHash("sha256")
        .update(readFileSync("package-lock.json"))
        .digest("hex"),
      whichTypedArray: typed.version,
      tarball: typed.resolved,
    },
    null,
    2,
  ),
);

for (const obsolete of ["src/core.js", "src/plugin-source.js"])
  assert.ok(
    !existsSync(obsolete),
    `Remove obsolete ${obsolete}; 1.1.6 uses typed source replacements.`,
  );
