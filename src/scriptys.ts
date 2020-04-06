/* sriptys (or tys for short) is a launcher to run TypeScript on node.
 * It supports caching and scripts split over multiple source files.
 *
 * Tys can be also configured to launch scripts other than the one being compiled
 * which is handy to compile config files for other tools.
 */

import { compileIfNecessary, defaultOutDir, jsOutFile } from "config-file-ts";
import path from "path";
import { run } from "./execUtil";
import { scriptysParams, stripLauncherArgs } from "./scriptysArgs";
import TysConfig from "./TysConfig";

export { TysConfig, run };

/** Launch scriptys
 *
 * @param argv array containing launcher program name, and command line arguments
 * @returns the result of the executed script
 */
export async function scriptysArgv(argv: string[]): Promise<number> {
  const args = stripLauncherArgs(argv);
  return runScriptys(args);
}

/** Launch scriptys
 * @param cmdLine command line arguments to tys
 * @returns the result of the executed script
 */
export async function scriptysCommandLine(cmdLine: string): Promise<number> {
  const args = cmdLine.split(/\s+/);
  return runScriptys(args);
}

export function tysDefaultOutDir(tsFile: string): string {
  return defaultOutDir(path.resolve(tsFile), "tys");
}

/** @return the output path to a .js file compiled from a .ts file */
export function locateJsOut(tsFile: string, outDir?: string): string {
  const realOutDir = outDir || tysDefaultOutDir(tsFile);
  return jsOutFile(tsFile, realOutDir);
}

/** Launch scriptys
 *
 * @param args command line arguments
 * @returns the result of the executed script
 */
export async function runScriptys(args: string[]): Promise<number> {
  const params = scriptysParams(args);
  if (!params) {
    return Promise.reject(`invalid scriptys parameters: ${args}`);
  }
  const { sources, realOutDir, fullCommand } = params;

  const built = compileIfNecessary(sources, realOutDir);
  if (!built) {
    return Promise.resolve(-2);
  }

  return run(fullCommand);
}
