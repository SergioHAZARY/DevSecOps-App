import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      "out/**",
      ".next/**",
      "node_modules/**",
      "android/**",
      "data/lessons/**", // generated
      "public/**",
      "next-env.d.ts",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // `module` is a fine local name here (not a CommonJS context)
      "@next/next/no-assign-module-variable": "off",
      // informational React-Compiler hints, not failures
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // "latest value" refs kept in sync during render - an accepted pattern here
      "react-hooks/refs": "warn",
    },
  },
  {
    files: ["scripts/**", "*.mjs", "*.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];

export default config;
