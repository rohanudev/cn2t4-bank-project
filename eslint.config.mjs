import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: {
    sourceType: "module",
    files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
    files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"]
  },
  
  {
    files: ['frontend/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },

]);