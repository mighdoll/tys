/* eslint-disable @typescript-eslint/explicit-function-return-type */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "chai/register-should";
import { defaultOutDir, symLinkForce } from "config-file-ts";
import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import tmp from "tmp";
import { bufferedRun, run } from "../src/execUtil";

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

test.skip("gulptys --help", async () => {
  const { dir, gulptys } = createGulptysLink();
  createNodeModules(dir);
  const result = bufferedRun(`cd test; ${gulptys} --help`);
  const done = result.then((execResult) => {
    execResult.result.should.equal(0);
    execResult.stdout.should.contain("Usage: gulp");
    return execResult;
  })
  .finally(() => rimraf.sync(dir));
  return done;
});

interface GulptysLink {
  dir: string;
  gulptys: string;
}

function createNodeModules(dir: string) {
  const node_modules = path.join(dir, "node_modules", "tys");
  fs.mkdirSync(node_modules, { recursive: true });
  const target = path.join(node_modules, "tys.d.ts");
  fs.copyFileSync("/home/lee/tys/dist/tys.d.ts", target);
}

function createGulptysLink(): GulptysLink {
  const dir = tmp.dirSync().name;
  const gulptys = path.join(dir, "gulptys");
  const tysPath = path.resolve("dist/tys.js");
  symLinkForce(tysPath, gulptys);

  fs.chmodSync(gulptys, 0o775);
  return { dir, gulptys };
}

function clearCache(...tsFiles: string[]): void {
  for (const tsFile of tsFiles) {
    const outDir = defaultOutDir(tsFile);
    rimraf.sync(outDir);
  }
}
