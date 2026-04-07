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

    // After flattening, ignore any leftover nested app artifacts.
    "gfa/**",

    // Scratch scripts (not part of app quality bar).
    "scripts/tmp-*.js",
  ]),
  {
    rules: {
      // This codebase uses `any` in a few integration boundaries (Supabase/Stripe/route JSON).
      // Prefer gradual typing improvements over blocking deploys.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
