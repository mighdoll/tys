/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "chai/register-should";
import "chai-as-promised";
import { defaultOutDir } from "config-file-ts";
import rimraf from "rimraf";
import { testConfigFile } from "./test-config.tys";
import { tysCommandLine } from "../src/tys";

test.skip("config file", () => {
  const outDir = defaultOutDir(testConfigFile);
  rimraf.sync(outDir);
  const result = tysCommandLine(`-c ${testConfigFile} 5`);
  result.should.eventually.equal(5);
});

test.skip("default config file", () => {
  const outDir = defaultOutDir(testConfigFile);
  rimraf.sync(outDir);
  const result = tysCommandLine(`-c -- 8`);
  result.should.eventually.equal(8);
});

test("run program", () => {
  const outDir = defaultOutDir(testConfigFile);
  rimraf.sync(outDir);
  const result = tysCommandLine(`test/program.ts 4`);
  result.should.eventually.equal(4);
});

test.skip("run program with -- args", () => {
  const outDir = defaultOutDir(testConfigFile);
  rimraf.sync(outDir);
  const result = tysCommandLine(`test/program.ts -- 7`);
  result.should.eventually.equal(7);
});