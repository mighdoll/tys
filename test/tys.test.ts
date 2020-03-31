/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "chai/register-should";
import "chai-as-promised";
import { defaultOutDir } from "config-file-ts";
import rimraf from "rimraf";
import { testConfigFile } from "./test-config.tys";
import { tysCommandLine } from "../src/tys";

test("test config", () => {
  const outDir = defaultOutDir(testConfigFile);
  console.log("test config. outDir:", outDir);
  rimraf.sync(outDir);
  const result = tysCommandLine(`-c ${testConfigFile} 7`);
  result.should.eventually.equal(7);
});
