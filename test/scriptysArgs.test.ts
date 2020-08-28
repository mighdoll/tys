/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "chai/register-should";
import {
  ParsedArguments,
  parseArguments
} from "../src/scriptysArgs";

testArguments("tys foo.ts", parsed => {
  parsed.tsFile!.should.equal("foo.ts");
});

testArguments("tys --config fooConfig.ts", parsed => {
  parsed.explicitConfigFile!.should.equal("fooConfig.ts");
});

testArguments("tys --config fooConfig.ts -- --tasks", parsed => {
  const { tsFile, explicitConfigFile, commandArgs } = parsed;
  expect(tsFile).toBeUndefined();
  explicitConfigFile!.should.equal("fooConfig.ts");
  commandArgs!.should.deep.equal(["--tasks"]);
});

testArguments("gulptys --tasks", parsed => {
  const { tsFile, commandArgs } = parsed;
  expect(tsFile).toBeUndefined();
  commandArgs!.should.deep.equal(["--tasks"]);
});

function testArguments<T>(cmdLine:string, fn:(parsed:ParsedArguments)=>T):void {
  test(cmdLine, () => {
  const args = cmdLine.split(/\s+/);
    return fn(parseArguments(args)!);
  });
}
