/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "chai/register-should";
import { defaultOutDir } from "config-file-ts";
import rimraf from "rimraf";
import { testConfigFile } from "./test-config.tys";

test("test config", () => {
  const outDir = defaultOutDir(testConfigFile);
  console.log("test config. outDir:", outDir);
  rimraf.sync(outDir);
  
});
