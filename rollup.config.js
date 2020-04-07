import typescript2 from "rollup-plugin-typescript2";

export default [
  { // main library
    input: ["src/scriptys.ts"], 
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
      "util",
      "yargs"
    ]
  },
  { // tys bin script
    input: ["src/tys.ts"],
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
      "./scriptys"
    ]
  }
];
