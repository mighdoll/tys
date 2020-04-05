/* sriptys (or tys for short) is a launcher to run TypeScript on node.
 * It supports caching and scripts split over multiple source files.
 * 
 * Tys can be also configured to launch scripts other than the one being compiled
 * which is handy to compile config files for other tools.
 */

import {
  compileIfNecessary,
  defaultOutDir,
  expectFilesExist,
  jsOutFile,
  loadTsConfig,
} from "config-file-ts";
import glob from "glob";
import path from "path";
import yargs from "yargs";
import { run } from "./execUtil";
import TysConfig from "./TysConfig";

const defaultConfigFile = "tysconfig.ts";

export { TysConfig, run };

/** Launch scriptys
 *
 * @param argv array containing launcher program name, and command line arguments
 * @returns the result of the executed script
 */
export async function scriptysArgv(argv: string[]): Promise<number> {
  const args = stripLauncherArgs(argv);
  return scriptysArgs(args);
}

/** Launch scriptys
 * @param cmdLine command line arguments to tys
 * @returns the result of the executed script
 */
export async function scriptysCommandLine(cmdLine: string): Promise<number> {
  const args = cmdLine.split(/\s+/);
  return scriptysArgs(args);
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
async function scriptysArgs(args: string[]): Promise<number> {
  const params = parseScriptysArgs(args);
  const config = getConfig(params);
  if (!config) {
    return Promise.reject("config not found");
  };
  const { tsFile, otherTsFiles, outDir, command } = config;

  const sources = [tsFile, ...otherSources(otherTsFiles)];
  const realOutDir = outDir || tysDefaultOutDir(tsFile);
  const fullCommand = commandToRun(
    tsFile,
    realOutDir,
    params.commandArgs,
    command
  );

  const exist = expectFilesExist([tsFile]);
  if (!exist) {
    return Promise.resolve(-1);
  }
  const built = compileIfNecessary(sources, realOutDir);
  if (!built) {
    return Promise.resolve(-2);
  }

  return run(fullCommand);
}

interface Arguments {
  config?: string;
  tsFile?: string;
  commandArgs: string[];
  launcher: string;
}

function getConfig(params: Arguments): TysConfig | undefined {
  const { config, tsFile } = params;
  if (config) {
    return loadTsConfig<TysConfig>(config);
  } else if (tsFile) {
    return {
      tsFile,
    };
  } else {
    return loadTsConfig<TysConfig>(defaultConfigFile);
  }
}

export function parseScriptysArgs(args: string[]): Arguments {
  const yargArgs = tysLocalArgs(args);
  console.log("yargArgs", yargArgs);
  const launcher = yargArgs.$0;
  const config = configFileParameter(yargArgs.config);

  const unparsed = yargArgs._.slice();
  let tsFile: string | undefined;
  if (!config && unparsed.length !== 0) {
    tsFile = unparsed.shift();
  }
  const commandArgs = [...unparsed];

  const tysArgs: Arguments = {
    launcher,
    config,
    tsFile,
    commandArgs,
  };
  console.log("scriptys args", tysArgs);

  return tysArgs;
}

// TODO add option for command to run
// TODO add option for src files
// TODO add option for outDir

function tysLocalArgs(args: string[]) {
  return yargs
    .option("config", {
      alias: "c",
      string: true,
      describe: "tys configuration file",
    })
    .command("$ <tsFile..>", false)
    .usage("$0 tsFile \n$0 -c [tysConfigFile]")
    .help()
    .parse(args);
}

function configFileParameter(config: string | undefined): string | undefined {
  if (config === undefined) {
    return undefined; // no --config specified
  } else if (typeof config === "string" && config.length > 0) {
    return config; // --config specified
  } else {
    return defaultConfigFile; // --config  specified but no file included
  }
}

function otherSources(otherTsGlobs: string[] | undefined): string[] {
  const sources: string[] = [];
  if (otherTsGlobs) {
    for (const tsGlob of otherTsGlobs) {
      sources.push(...glob.sync(tsGlob));
    }
  }
  return sources;
}

function commandToRun(
  tsFile: string,
  realOutDir: string,
  cmdArgs: string[],
  command?: string
) {
  const jsPath = jsOutFile(tsFile, realOutDir);
  const realCmd = command || `node ${jsPath}`;
  return `${realCmd} ${cmdArgs}`;
}

export function stripLauncherArgs(argv: string[]): string[] {
  const firstRealArg = argv.findIndex((arg) => !isLauncherArg(arg));
  if (firstRealArg === -1) {
    return [];
  } else {
    const result = argv.slice(firstRealArg);
    return result;
  }
}

const launcherArg = /^(?:tys|node|yarn|npm)$/;
function isLauncherArg(arg: string): boolean {
  return path.basename(arg).match(launcherArg) !== null;
}
