import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores for compiled/generated files:
    ".firebase/**",
    "functions/lib/**",
  ]),
  // Custom rules for this project
  {
    rules: {
      // Allow any for third-party library refs and dynamic types
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow setState in effects for SSR patterns
      "react-hooks/set-state-in-effect": "off",
      // Allow Date.now() in hooks (common pattern)
      "react-hooks/purity": "off",
      // Allow empty interfaces for type extension
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow unescaped quotes in JSX
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
