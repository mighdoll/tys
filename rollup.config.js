import typescript2 from "rollup-plugin-typescript2";

export default {
  input: "src/tys.ts",
  output: {
    dir: "dist",
    format: "cjs",
    sourcemap: true,
    banner: "#!/usr/bin/env node"
  },
  plugins: [typescript2()],
  external: ["fs", "path", "events", "child_process", "config-file-ts", "glob", "yargs"]
};
