/* eslint-disable @typescript-eslint/explicit-function-return-type */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "chai/register-should";
import { defaultOutDir } from "config-file-ts";
import rimraf from "rimraf";
import { run } from "../src/execUtil";
import { tysCommandLine } from "../src/scriptys";

chai.use(chaiAsPromised);

const testProgram = "test/program.ts";
const testConfig = "test/test-config.tys.ts";

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

test("config file", () => {
  clearCache(testConfig, testProgram);
  const result = tysCommandLine(`-c ${testConfig} 5`);
  result.should.eventually.equal(5);
});

test.skip("default config file", () => {
  clearCache(testConfig, testProgram);
  const result = tysCommandLine(`-c -- 8`);
  result.should.eventually.equal(8);
});

function clearCache(...tsFiles: string[]): void {
  for (const tsFile of tsFiles) {
    const outDir = defaultOutDir(tsFile);
    rimraf.sync(outDir);
  }
}
