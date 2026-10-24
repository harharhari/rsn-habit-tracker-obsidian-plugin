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
    files: ["src/**/*.ts"],
    languageOptions: {
      sourceType: "module",
      parserOptions: { projectService: true },
    },
    rules: {
      ...obsidianmd.ruleConfigs.recommendedTypeChecked,
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
