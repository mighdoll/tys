/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "chai/register-should";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { defaultOutDir } from "config-file-ts";
import rimraf from "rimraf";
import { testConfigFile } from "./test-config.tys";
import { tysCommandLine } from "../src/scriptys";
import { logExec, run } from "../src/execUtil";
import { once } from "events";

chai.use(chaiAsPromised);

test("run program", async () => {
  const outDir = defaultOutDir(testConfigFile);
  rimraf.sync(outDir);
  const result = tysCommandLine(`test/program.ts 4`);
  return result.should.eventually.equal(4);
});

test("run program with -- args", () => {
  const outDir = defaultOutDir(testConfigFile);
  rimraf.sync(outDir);
  const result = tysCommandLine(`test/program.ts -- 7`);
  return result.should.eventually.equal(7);
});

test("run tys cli", async () => {  // note need to run 'yarn dist' first
  const result = run("node dist/tys test/program.ts 3");
  return result.should.eventually.equal(3);
});

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
