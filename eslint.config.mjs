import obsidianmd from "eslint-plugin-obsidianmd";
export default [
  {
    ignores: [
      "main.js",
      "release/**",
      "node_modules/**",
      "tests/**",
      "scripts/**",
      "docs/**",
    ],
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: { module: "readonly", require: "readonly" },
      parserOptions: { projectService: true },
    },
    rules: {
      ...obsidianmd.ruleConfigs.recommendedTypeChecked,
      // Runtime source deliberately uses CommonJS, the module format loaded by Obsidian.
      // All Obsidian-specific recommended rules remain enabled at their default severities.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
