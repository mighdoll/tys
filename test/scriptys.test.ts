/* eslint-disable @typescript-eslint/explicit-function-return-type */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "chai/register-should";
import { defaultOutDir } from "config-file-ts";
import rimraf from "rimraf";
import { run } from "../src/execUtil";
import tmp from "tmp";

chai.use(chaiAsPromised);

const testProgram = "test/program.ts";
const testConfig = "test/test-config.tys.ts";

// note: need to run 'yarn dist' first

test("run tys cli", async () => {
  clearCache(testProgram);
  const result = run(`node dist/tys ${testProgram} 3`); // run 'yarn dist' first
  return result.should.eventually.equal(3);
});

test("run program with -- args", () => {
  clearCache(testProgram);
  const result = run(`node dist/tys ${testProgram} -- 7`);
  return result.should.eventually.equal(7);
});

test("config file", () => {
  clearCache(testConfig, testProgram);
  const result = run(`node dist/tys -c ${testConfig} 5`);
  return result.should.eventually.equal(5);
});

test("recursively run tys on tys launcher", () => {
  const tysLauncherSrc = "src/tys.ts";
  clearCache(tysLauncherSrc);
  const result = run(`node dist/tys ${tysLauncherSrc} --version`);
  return result.should.eventually.equal(0);
});

test.skip("gulptys --version", () => {
  const dir = tmp.dirSync();
});

function clearCache(...tsFiles: string[]): void {
  for (const tsFile of tsFiles) {
    const outDir = defaultOutDir(tsFile);
    rimraf.sync(outDir);
  }
}
