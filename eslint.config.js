/* eslint-disable @typescript-eslint/no-require-imports */
const tsPlugin = require("@typescript-eslint/eslint-plugin")
const prettierPlugin = require("eslint-plugin-prettier")

module.exports = [
  {
    ignores: [
      "node_modules",
      "build",
      "public",
      "out",
      "cmd",
      "webview-ui/*",
      "svelte.config.js",
      "webpack.config.js",
    ],
  },
  tsPlugin.configs["flat/base"],
  ...tsPlugin.configs["flat/recommended"],
  {
    files: ["**/*.{js,ts,tsx,mjs,cjs}"],
    plugins: {
      "prettier": prettierPlugin,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/naming-convention": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "curly": "warn",
      "eqeqeq": "warn",
      "no-throw-literal": "warn",
      "semi": [2, "never"],
      "prettier/prettier": [
        "error",
        {
          semi: false,
          endOfLine: "auto",
        },
      ],
    },
  },
]
