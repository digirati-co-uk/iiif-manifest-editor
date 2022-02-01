"use strict";

const OFF = 0;
const ERROR = 2;

module.exports = {
  plugins: ["@typescript-eslint", "react-hooks"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "no-undef": OFF,
    "no-use-before-define": OFF,
    "accessor-pairs": OFF,
    "brace-style": [ERROR, "1tbs"],
    "consistent-return": OFF,
    "dot-location": [ERROR, "property"],
    "dot-notation": ERROR,
    "eol-last": ERROR,
    eqeqeq: [ERROR, "allow-null"],
    indent: OFF,
    "jsx-quotes": [ERROR, "prefer-double"],
    "keyword-spacing": [ERROR, { after: true, before: true }],
    "no-bitwise": OFF,
    "no-inner-declarations": [ERROR, "functions"],
    "no-multi-spaces": ERROR,
    "no-restricted-syntax": [ERROR, "WithStatement"],
    "no-shadow": ERROR,
    "no-unused-expressions": ERROR,
    "no-useless-concat": OFF,
    quotes: [
      ERROR,
      "double",
      { avoidEscape: true, allowTemplateLiterals: true }
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "space-before-blocks": ERROR,
    "space-before-function-paren": OFF
  },
};
