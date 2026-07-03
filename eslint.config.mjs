import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import pluginVitest from "@vitest/eslint-plugin";

// Unicorn 67 enables several style rules that this codebase has not adopted yet.
const unicornRulesForExistingConventions = {
  "unicorn/consistent-boolean-name": "off",
  "unicorn/consistent-class-member-order": "off",
  "unicorn/consistent-function-scoping": "off",
  "unicorn/filename-case": "off",
  "unicorn/no-this-outside-of-class": "off",
  "unicorn/no-unnecessary-global-this": "off",
  "unicorn/no-unreadable-for-of-expression": "off",
  "unicorn/no-useless-template-literals": "off",
  "unicorn/operator-assignment": "off",
  "unicorn/prefer-early-return": "off",
  "unicorn/prefer-else-if": "off",
  "unicorn/prefer-minimal-ternary": "off",
  "unicorn/prefer-split-limit": "off",
  "unicorn/prefer-ternary": "off",
};

/**
 * ESLint configuration
 * Extends recommended configurations and adds custom rules
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "public/**",
      "next.config.js",
      "postcss.config.js",
      "node_modules/**",
      "coverage/**",
      ".turbo/**",
      "out/**",
      "next-env.d.ts",
    ],
  },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  eslintPluginUnicorn.configs.recommended,
  {
    rules: unicornRulesForExistingConventions,
  },
  {
    files: [
      "src/setup-vitest.ts",
      "**/__tests__/**/*.{js,ts,jsx,tsx}",
      "**/*.test.{js,ts,jsx,tsx}",
    ],
    plugins: { vitest: pluginVitest },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      "unicorn/no-error-property-assignment": "off",
      "unicorn/no-global-object-property-assignment": "off",
    },
  },
];

export default eslintConfig;
