/* eslint-disable @typescript-eslint/explicit-function-return-type */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "chai/register-should";
import { defaultOutDir } from "config-file-ts";
import rimraf from "rimraf";
import { run } from "../src/execUtil";
import { tysCommandLine } from "../src/scriptys";
import { testConfigFile } from "./test-config.tys";

chai.use(chaiAsPromised);

const testProgram = "test/program.ts";

test("run program", async () => {
  clearCache(testProgram);
  const result = tysCommandLine(`${testProgram} 4`);
  return result.should.eventually.equal(4);
});

test("run program with -- args", () => {
  clearCache(testProgram);
  const result = tysCommandLine(`${testProgram} -- 7`);
  return result.should.eventually.equal(7);
});

test("run tys cli", async () => {
  // note need to run 'yarn dist' first
  clearCache(testProgram);
  const result = run(`node dist/tys ${testProgram} 3`);
  return result.should.eventually.equal(3);
});

test.skip("config file", () => {
  clearCache(testConfigFile);
  const result = tysCommandLine(`-c ${testConfigFile} 5`);
  result.should.eventually.equal(5);
});

test.skip("default config file", () => {
  clearCache(testConfigFile);
  const result = tysCommandLine(`-c -- 8`);
  result.should.eventually.equal(8);
});

function clearCache(tsFile: string): void {
  const outDir = defaultOutDir(tsFile);
  rimraf.sync(outDir);
}
