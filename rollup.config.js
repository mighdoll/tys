import typescript2 from "rollup-plugin-typescript2";
// import { terser as rollupTerser } from "rollup-plugin-terser";

export default {
  input: "tys.ts",
  output: {
    dir: "dist",
    format: "cjs",
    sourcemap: true,
    banner: "#!/usr/bin/env node"
  },
  plugins: [
    typescript2({
      outDir: "dist"
    }),
    // rollupTerser() // minify step. Comment this out to review bundle contents
  ],
  external: ["fs", "path", "events", "child_process", "config-ts", "glob"],
};
