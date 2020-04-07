import { exec, spawn, ChildProcess } from "child_process";
import { once } from "events";
import glob from "glob";
import fs from "fs";
import path from "path";
import util from "util";
const execPm = util.promisify(exec);

/** Execute a command in subprocess
 *
 * stdout and stderr from the subprocess are copied to this process's stdout
 * with a prefix indicating the command.
 *
 * @returns the process
 */
export function logExecArray(
  cmd: string,
  args?: string[],
  prefix?: string
): ChildProcess {
  const spawned = spawn(cmd, args);
  const linePrefix = logPrefix();

  spawned.stdout.on("data", logger(linePrefix));
  spawned.stderr.on("data", logger(`${linePrefix}[2]`));

  return spawned;

  function logPrefix(): string {
    if (prefix !== undefined) {
      return prefix;
    } else {
      return cmd;
    }
  }
}

function logger(possiblePrefix: string) {
  const prefix = possiblePrefix.length ? possiblePrefix + ": " : "";
  return (data: Buffer): void => {
    const lines = data.toString();
    const lineArray = lines.split("\n").filter((line) => line.length > 0);
    for (const line of lineArray) {
      console.log(`${prefix}${line}`);
    }
  };
}

/** Execute a command in subprocess
 *
 * stdout and stderr from the subprocess are echoed to our stdout (with a prefix
 * indicating the command).
 *
 * @returns the process
 */
export function logExec(cmdLine: string, prefix?: string): ChildProcess {
  const { cmd, args } = splitCmdLine(cmdLine);
  return logExecArray(cmd, args, prefix);
}

/** Execute a command in a subprocess.
 *
 * stdio is inherited from our process.
 *
 * @return a promise containing the return code of the command.
 */
export async function run(cmdLine: string): Promise<number> {
  const { cmd, args } = splitCmdLine(cmdLine);
  const childProc = spawn(cmd, args, { stdio: "inherit" });
  const promisedResult: Promise<number> = once(childProc, "exit").then(
    ([result]) => result
  );
  return promisedResult;
}

export interface ExecResult {
  result: number;
  stdout: string[];
  stderr: string[];
}

/** Execute a command in a subprocess.
 *
 * @return a promise containing the return code of the command and the buffered
 * results from stdio.
 */
export async function bufferedRun(cmdLine: string): Promise<ExecResult> {
  let result = 0;
  const { stdout, stderr } = await execPm(cmdLine).catch((e) => (result = e));

  return {
    result,
    stdout,
    stderr,
  };
}

interface CommandParts {
  cmd: string;
  args: string[];
}

function splitCmdLine(cmdLine: string): CommandParts {
  const all = mkArgs(cmdLine);
  const cmd = all[0];
  const args = all.slice(1);
  return {
    cmd,
    args,
  };
}

/** split up a string containing command line arguments
 * @returns an array suitable for spawn or exec
 */
function mkArgs(line: string): string[] {
  const words = /(?:[^\s"]+|"[^"]*")+/g;
  const matched = line.match(words)!;
  return [...matched];
}

export async function serialExec(...cmds: string[]): Promise<number> {
  for (const cmd of cmds) {
    const proc = logExec(cmd);
    const [result] = await once(proc, "exit");
    if (result) return result;
  }
  return 0;
}

/** return true if any files need compiling */
export function needsCompile(srcGlobs: string[], outDir: string): boolean {
  const files = srcGlobs.flatMap((src) => glob.sync(src));
  const srcDestPairs = compilationPairs(files, outDir);
  return anyOutDated(srcDestPairs);
}

function compilationPairs(
  srcFiles: string[],
  outDir: string
): [string, string][] {
  return srcFiles.map((file) => {
    const outFile = changeSuffix(file, ".js");
    const outPath = path.join(outDir, outFile);
    return [file, outPath];
  });
}

function anyOutDated(filePairs: [string, string][]): boolean {
  const found = filePairs.find(([srcPath, outPath]) => {
    if (!fs.existsSync(outPath)) {
      return true;
    }
    const srcTime = fs.statSync(srcPath).mtime;
    const outTime = fs.statSync(outPath).mtime;
    return srcTime > outTime;
  });

  return found !== undefined;
}

function changeSuffix(filePath: string, suffix: string): string {
  const dir = path.dirname(filePath);
  const curSuffix = path.extname(filePath);
  const base = path.basename(filePath, curSuffix);
  return path.join(dir, base + suffix);
}

export function time<T>(fn: () => T, label?: string): T {
  const start = process.hrtime();
  const result = fn();
  const elapsed = process.hrtime(start);
  const msg = label ? label + " " : "";
  console.log(`${msg}${elapsed}`);
  return result;
}
