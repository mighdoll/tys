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


testCmd("tys foo.ts", parsed => {
  parsed.tsFile!.should.equal("foo.ts");
});

testCmd("tys -- --tasks", parsed => {
  const { tsFile, config, commandArgs } = parsed;
  expect(tsFile).toBeUndefined();
  commandArgs!.should.deep.equal(["--tasks"]);
  config!.should.equal("tys.config.ts");
});

testCmd("gulptys", parsed => {
  parsed.config!.should.equal("gulptys.config.ts");
});

testCmd("/foo/bar/gulptys", parsed => {
  parsed.config!.should.equal("gulptys.config.ts");
});

testCmd("gulptys --tasks", parsed => {
  const { tsFile, config, commandArgs } = parsed;
  expect(tsFile).toBeUndefined();
  config!.should.equal("gulptys.config.ts");
  commandArgs!.should.deep.equal(["--tasks"]);
}, "zz");

function testCmd<T>(cmdLine:string, fn:(parsed:ParsedArguments)=>T, prefix=""):void {
  test(prefix+cmdLine, () => {
    return fn(parseCmdLine(cmdLine));
  });
}

// const tysNakedTasksCmd = "tys --tasks";
// test(tysNakedTasksCmd, () => {
//   const result = parseCmdLine(tysNakedTasksCmd);
//   const { tsFile, config, commandArgs } = result;
//   expect(tsFile).toBeUndefined();
//   config!.should.equal("tys.config.ts");
//   commandArgs.should.deep.equal(["--tasks"]);
// });

// test("parse tys tsFile --tasks", () => {
//   const result = parseCmdLine("foo.ts --tasks", "/foo/bar/tys");
//   result.tsFile!.should.equal("foo.ts");
//   result.commandArgs!.should.deep.equal(["--tasks"]);
// });

// test("parse tys -c coofig.ts --tasks", () => {
//   const result = parseCmdLine("foo.ts -c coofig.ts --tasks", "/foo/bar/tys");
//   const { tsFile, config, commandArgs } = result;
//   tsFile!.should.equal("foo.ts");
//   commandArgs!.should.deep.equal(["--tasks"]);
// });


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

function parseCmdLine(cmdLine: string): ParsedArguments {
  const args = cmdLine.split(/\s+/);
  return parseScriptysArgs(args.slice(1), args[0])!;
}
