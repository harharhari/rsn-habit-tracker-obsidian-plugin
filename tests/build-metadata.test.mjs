// SPDX-License-Identifier: GPL-3.0-only
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
function fixture(change) {
  const dir = mkdtempSync(path.join(tmpdir(), "habit-lock-test-"));
  try {
    for (const n of ["package.json", "manifest.json", "package-lock.json"])
      copyFileSync(path.join(root, n), path.join(dir, n));
    if (change) {
      const file = path.join(dir, "package-lock.json");
      const lock = JSON.parse(readFileSync(file));
      change(lock);
      writeFileSync(file, JSON.stringify(lock));
    }
    return spawnSync(
      process.execPath,
      [path.join(root, "scripts/check-lockfile.mjs")],
      { cwd: dir, encoding: "utf8" },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test("preflight accepts the delivered lockfile and reports dependency identity", () => {
  const r = fixture();
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).whichTypedArray, "1.1.24");
});
test("preflight rejects the unavailable legacy dependency before installation", () => {
  const r = fixture(
    (l) => (l.packages["node_modules/which-typed-array"].version = "1.1.34"),
  );
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Stale broken lockfile/);
});
test("preflight rejects a lockfile copied from another release", () => {
  const r = fixture((l) => (l.packages[""].version = "1.1.3"));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /stale lockfile root version/);
});
