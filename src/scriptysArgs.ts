import {
  defaultOutDir,
  expectFilesExist,
  jsOutFile,
  loadTsConfig,
} from "config-file-ts";
import glob from "glob";
import path from "path";
import fs from "fs";
import yargs from "yargs";
import TysConfig from "./TysConfig";

export interface ScriptysParams {
  tsFile: string;
  strict?: boolean;
  sources: string[];
  realOutDir: string;
  fullCommand: string;
}

/** Parse and validate command line and config parameters */
export function scriptysParams(args: string[]): ScriptysParams | undefined {
  const params = parseArguments(args);
  if (!params) {
    return undefined;
  }

  const config = getConfiguration(params, args);
  if (!config) {
    console.error("tys configuration not understood", args);
    return undefined;
  }

  const { tsFile, strict, otherTsFiles, outDir, command } = config;
  if (!tsFile) {
    console.error("no tsFile specified on command line or in config file");
    return undefined;
  }
  const exist = expectFilesExist([tsFile]);
  if (!exist) {
    console.error(`scriptysParams: ${tsFile} not found`);
    return undefined;
  }

  const sources = [tsFile, ...otherSources(otherTsFiles)];
  const realOutDir = outDir || tysDefaultOutDir(tsFile);
  const fullCommand = commandToRun(
    tsFile,
    realOutDir,
    params.commandArgs,
    command
  );

  return {
    tsFile,
    strict,
    sources,
    realOutDir,
    fullCommand,
  };
}

export interface ParsedArguments extends TysConfig {
  launcher: string;
  explicitConfigFile?: string;
  commandArgs: string[];
}

/** Parse command line arguments.
 * @param args command line argument array
 * args[0] is assumed to be the launch program (e.g. tys or tys.js or a link to it)
 */
export function parseArguments(args: string[]): ParsedArguments | undefined {
  const launcher = path.basename(args[0]);
  if (launcher === "tys" || launcher === "tys.js") {
    return tysArguments(args);
  } else { 
    // symlinked launcher, pass all arguments to target
    return {
      launcher,
      commandArgs: args.slice(1)
    };
  }
}


export function tysArguments(args: string[]): ParsedArguments {
  const launcher = path.basename(args[0]);
  const [tysArgs, commandArgs] = splitAtDDash(args.slice(1));
  const yargArgs = tysLocalArgs(tysArgs);
  const unparsed = yargArgs._.slice();
  const explicitConfigFile = configParameter(yargArgs.config);
  let tsFile: string | undefined;
  const { strict, command, outDir, otherTsFiles } = yargArgs;
  if (!explicitConfigFile) {
    tsFile = unparsed.shift();
  }
  commandArgs.push(...unparsed);

  const parsedArgs: ParsedArguments = {
    launcher,
    explicitConfigFile,
    tsFile,
    otherTsFiles,
    outDir,
    command,
    strict,
    commandArgs,
  };

  return parsedArgs;
}

/** split a set of arguments before and after a "--"  */
function splitAtDDash(args: string[]): [string[], string[]] {
  const found = args.findIndex((s) => s === "--");
  if (found !== -1) {
    const before = args.slice(0, found);
    const after = args.slice(found + 1);
    return [before, after];
  }
  return [args, []];
}

function tysLocalArgs(args: string[]) {
  return yargs
    .option("config", {
      alias: "c",
      string: true,
      describe: "tys configuration file",
    })
    .option("otherTsFiles", {
      string: true,
      array: true,
      describe: "additional typescript files (glob syntax)",
    })
    .option("command", {
      string: true,
      describe: "command to run after compiling",
    })
    .option("strict", {
      boolean: true,
      default: true,
      describe: "strict typescript compilation",
    })
    .option("outDir", {
      string: true,
      describe: "directory for compiled js files",
    })
    .help()
    .usage(
      "$0 tsFile \n$0 -c [tysConfigFile]\nsymLinkToTys   # uses symlinkToTys.config.ts as config"
    )
    .parse(args);
}

function configParameter(config: string | undefined): string | undefined {
  if (typeof config === "string" && config.length > 0) {
    return config;
  } else {
    return undefined;
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

export function commandToRun(
  tsFile: string,
  realOutDir: string,
  cmdArgs: string[],
  command?: string
) {
  const jsPath = jsOutFile(tsFile, realOutDir);
  const realCmd = command || `node ${jsPath}`;
  return `${realCmd} ${cmdArgs}`;
}

const launcherArg = /^(?:node|yarn|npm)$/;

function isLauncherArg(arg: string): boolean {
  return path.basename(arg).match(launcherArg) !== null;
}

/** return configuration, either from config file or from command line arguments */
function getConfiguration(
  cmdLineConfig: ParsedArguments,
  args: string[]
): TysConfig {
  const configFromFile = configFromConfigFile(cmdLineConfig, args);
  return { ...cmdLineConfig, ...configFromFile };
}

function configFromConfigFile(
  cmdLineConfig: ParsedArguments,
  args: string[]
): TysConfig {
  const { launcher, explicitConfigFile } = cmdLineConfig;
  if (explicitConfigFile) {
    return loadIfExists(explicitConfigFile, true) || {};
  }
  const defaultConfigFile = launcher + ".config.ts";
  const curDirPath = path.join(__dirname, defaultConfigFile);
  const scriptDirPath = path.join(path.dirname(args[0]), defaultConfigFile);
  return loadIfExists(curDirPath) || loadIfExists(scriptDirPath) || {};
}

export function stripLauncherArgs(argv: string[]): string[] {
  if (isLauncherArg(argv[0])) {
    return argv.slice(1);
  } else {
    return argv;
  }
}

export function tysDefaultOutDir(tsFile: string): string {
  return defaultOutDir(path.resolve(tsFile), "tys");
}

function loadIfExists(configPath: string, warn = false): TysConfig | undefined {
  if (fs.existsSync(configPath)) {
    return loadTsConfig<TysConfig>(configPath);
  }
  if (warn) {
    console.log("config not found:", path.basename(configPath));
  }
}
