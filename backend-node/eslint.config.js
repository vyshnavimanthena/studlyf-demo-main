const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
      "no-console": "warn"
    }
  },
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"]
  }
];
