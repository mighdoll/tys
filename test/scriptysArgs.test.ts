/* eslint-disable @typescript-eslint/explicit-function-return-type */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "chai/register-should";
import { defaultOutDir } from "config-file-ts";
import {
  stripLauncherArgs,
  parseScriptysArgs,
  ParsedArguments
} from "../src/scriptysArgs";

chai.use(chaiAsPromised);

test("parse tys tsFile", () => {
  parseCmdLine("foo.ts", "/foo/bar/tys").tsFile!.should.equal("foo.ts");
});

test("parse gulptys <no arguments>", () => {
  parseCmdLine("", "/foo/bar/gulptys").config.should.equal("gulptys.config.ts");
});

test("parse tys --tasks", () => {
  const result = parseCmdLine("--tasks", "/foo/bar/tys");
  const { tsFile, config, commandArgs } = result;
  tsFile.should.be.undefined;
  config.should.equal("tys.config.ts");
  commandArgs.should.deep.equal(["--tasks"]);
});

test("parse tys tsFile --tasks", () => {
  const result = parseCmdLine("foo.ts --tasks", "/foo/bar/tys");
  result.tsFile!.should.equal("foo.ts");
  result.commandArgs!.should.deep.equal(["--tasks"]);
});

test("stripLauncherArgs", () => {
  const good = [
    "/home/lee/nodeish/foo.ts",
    "this/node/that",
    "tysish",
    "config.tys.ts"
  ];
  const bad = ["/foo/bar/node"];
  for (const arg of good) {
    stripLauncherArgs([arg]).should.deep.equal([arg]);
  }
  for (const arg of bad) {
    stripLauncherArgs([arg]).should.deep.equal([]);
  }
});

function parseCmdLine(cmdLine: string, launcher?: string): ParsedArguments {
  const args = cmdLine.split(/\s+/);
  return parseScriptysArgs(args, launcher);
}
