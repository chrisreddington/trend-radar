import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import pluginJest from "eslint-plugin-jest";

// Get current directory for configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize ESLint compatibility layer for handling traditional config format
 * This allows us to use both modern flat config and traditional extends
 */
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * ESLint configuration for OctoSnap
 * Extends recommended configurations and adds custom rules
 */
const eslintConfig = [
  { ignores: [".next/**", "public/**", "next.config.js", "postcss.config.js"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  eslintPluginUnicorn.configs.recommended,
  pluginJest.configs["flat/recommended"],
  ...compat.extends(
    "next",
    "next/core-web-vitals", // Base Next.js rules for performance
    "next/typescript", // TypeScript-specific rules
    "plugin:prettier/recommended", // Prettier integration
    "plugin:jsx-a11y/strict",
  ),
];

export default eslintConfig;
