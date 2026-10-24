// SPDX-License-Identifier: GPL-3.0-only
// TypeScript ESM source; Obsidian consumes the generated CommonJS bundle.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import ts from "typescript";
const root = new URL("../", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");
const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      esModuleInterop: false,
    },
  }).outputText;
const core = compile(await read("src/core.ts"));
const source = compile(
  (await read("src/plugin.ts")).replace(
    'const COLOR_REFERENCE = "";',
    "const COLOR_REFERENCE = " +
      JSON.stringify(await read("hex-color-list.md")) +
      ";",
  ),
);
const importPattern = /const C = require\(["']\.\/core["']\);/;
if (!importPattern.test(source)) throw Error("Compiled core import not found.");
const bundle =
  "// SPDX-License-Identifier: GPL-3.0-only\n// Copyright (C) 2026 harharhari\n// Generated from src/*.ts by npm run build.\n" +
  "const HabitCore = (() => { const exports = {};\n" +
  core +
  "\nreturn exports;})();\n" +
  "(() => { const exports = {};\n" +
  source.replace(importPattern, "const C = HabitCore;") +
  "\nmodule.exports = exports.default;})();\n";
await mkdir(new URL("build/", root), { recursive: true });
await mkdir(new URL("release/", root), { recursive: true });
await writeFile(new URL("build/core.cjs", root), core);
await writeFile(new URL("main.js", root), bundle);
await writeFile(new URL("release/main.js", root), bundle);
for (const name of ["manifest.json", "styles.css", "hex-color-list.md"])
  await copyFile(new URL(name, root), new URL("release/" + name, root));
console.log("Built typed portable plugin and staged installation files.");

await mkdir(new URL("community-release/", root), { recursive: true });
for (const name of ["main.js", "manifest.json", "styles.css"])
  await copyFile(
    new URL("release/" + name, root),
    new URL("community-release/" + name, root),
  );
