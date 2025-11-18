import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import pluginVitest from "eslint-plugin-vitest";

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
    files: ["**/__tests__/**/*.{js,ts,jsx,tsx}", "**/*.test.{js,ts,jsx,tsx}"],
    plugins: { vitest: pluginVitest },
    rules: {
      ...pluginVitest.configs.recommended.rules,
    },
  },
];

export default eslintConfig;
