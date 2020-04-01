import typescript2 from "rollup-plugin-typescript2";

export default [
  {
    input: ["src/tys.ts"],
    output: [
      {
        dir: "dist",
        format: "cjs",
        sourcemap: true
      }
    ],
    plugins: [typescript2()],
    external: [
      "fs",
      "path",
      "events",
      "child_process",
      "config-file-ts",
      "glob",
      "yargs"
    ]
  },
  {
    input: ["src/cli.ts"],
    output: [
      {
        dir: "dist",
        banner: "#!/usr/bin/env node",
        format: "cjs",
        sourcemap: true
      }
    ],
    plugins: [typescript2()],
    external: [
      "fs",
      "path",
      "events",
      "child_process",
      "config-file-ts",
      "glob",
      "yargs",
      "tys"
    ]
  }
];
