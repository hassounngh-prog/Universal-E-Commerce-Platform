import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

const architectureBoundaries = {
  name: "architecture/boundaries",
  plugins: { import: importPlugin },
  rules: {
    "import/no-restricted-paths": [
      "error",
      {
        basePath: process.cwd(),
        zones: [
          {
            target: "./src/core",
            from: ["./src/infrastructure", "./src/features", "./src/app", "./src/plugins", "./src/config"],
            message: "src/core is business-agnostic; it must only depend on shared types and its own interfaces.",
          },
          {
            target: "./src/infrastructure",
            from: ["./src/features", "./src/app", "./src/plugins", "./src/config"],
            message: "src/infrastructure may only depend on src/core interfaces and src/shared.",
          },
          {
            target: "./src/features",
            from: ["./src/infrastructure", "./src/app", "./src/plugins"],
            message: "src/features may only depend on src/core, src/shared, and src/config.",
          },
          {
            target: "./src/features/auth",
            from: "./src/features",
            except: ["./auth"],
            message: "Feature modules must not import sibling features.",
          },
          {
            target: "./src/plugins",
            from: ["./src/infrastructure", "./src/features", "./src/app", "./src/config"],
            message: "src/plugins may only depend on src/core interfaces and src/shared.",
          },
          {
            target: "./src/app",
            from: ["./src/infrastructure", "./src/plugins", "./src/core", "./src/config"],
            message: "src/app must route through src/features and src/shared only.",
          },
          {
            target: "./src/config",
            from: ["./src/core", "./src/infrastructure", "./src/features", "./src/app", "./src/plugins"],
            message: "src/config may only depend on src/shared.",
          },
          {
            target: "./src/shared",
            from: ["./src/core", "./src/infrastructure", "./src/features", "./src/app", "./src/plugins", "./src/config"],
            message: "src/shared is the base layer; it must not import any other src directory.",
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  architectureBoundaries,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
