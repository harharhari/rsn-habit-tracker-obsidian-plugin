// SPDX-License-Identifier: GPL-3.0-only
// Run the official metadata rules explicitly: the recommended JS config does
// not select manifest.json or LICENSE in eslint-plugin-obsidianmd 0.4.2.
import { ESLint } from "eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import { PlainTextParser } from "eslint-plugin-obsidianmd/dist/lib/plainTextParser.js";
import { readFile } from "node:fs/promises";
const checker = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ["manifest.json"],
      plugins: { obsidianmd },
      rules: { "obsidianmd/validate-manifest": "error" },
    },
    {
      files: ["LICENSE"],
      plugins: { obsidianmd },
      languageOptions: { parser: PlainTextParser },
      rules: { "obsidianmd/validate-license": "error" },
    },
  ],
});
// The official manifest rule expects an ESTree object-expression statement.
const manifest = await readFile("manifest.json", "utf8");
JSON.parse(manifest); // Enforce strict JSON before parsing as an expression.
const results = [
  ...(await checker.lintText("(" + manifest + ")", {
    filePath: "manifest.json",
  })),
  ...(await checker.lintText(await readFile("LICENSE", "utf8"), {
    filePath: "LICENSE",
  })),
];
const formatter = await checker.loadFormatter("stylish");
const output = formatter.format(results);
if (output) console.log(output);
if (results.some((r) => r.errorCount || r.warningCount)) process.exitCode = 1;
else console.log("Official Obsidian manifest and license rules passed.");
