const sveltePlugin = require("eslint-plugin-svelte")
const tsParser = require("@typescript-eslint/parser")
const svelteParser = require("svelte-eslint-parser")

const a11yOff = Object.fromEntries(
  Object.keys(sveltePlugin.rules)
    .filter((r) => r.startsWith("a11y-"))
    .map((r) => [`svelte/${r}`, "off"])
)

module.exports = [
  {
    ignores: ["node_modules", "rollup.config.js"],
  },
  ...sveltePlugin.configs["flat/recommended"],
  {
    files: ["**/*.{js,ts,svelte}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
        extraFileExtensions: [".svelte"],
      },
    },
    rules: {
      "prettier/prettier": 0,
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      "svelte/valid-compile": ["error", { ignoreWarnings: true }],
      ...a11yOff,
    },
  },
]
