module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  ignorePatterns: ["dist", ".eslintrc.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react-refresh",
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true }
    ],
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { 
      argsIgnorePattern: "^_", 
      varsIgnorePattern: "^_" 
    }],
    "quotes": ["error", "single", { "avoidEscape": true }],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "indent": ["error", 2],
    "jsx-quotes": ["error", "prefer-double"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "arrow-parens": ["error", "always"],
    "camelcase": ["error", { "properties": "never" }],
    "max-len": ["warn", { "code": 100, "ignoreStrings": true, "ignoreTemplateLiterals": true }],
    "no-console": ["warn", { allow: ["error", "warn"] }],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
}