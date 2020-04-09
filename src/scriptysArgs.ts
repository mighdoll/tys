import {
  defaultOutDir,
  expectFilesExist,
  jsOutFile,
  loadTsConfig
} from "config-file-ts";
import glob from "glob";
import path from "path";
import fs from "fs";
import yargs from "yargs";
import TysConfig from "./TysConfig";

export interface ScriptysParams {
  tsFile: string;
  sources: string[];
  realOutDir: string;
  fullCommand: string;
}

/** Parse and validate command line and config parameters */
export function scriptysParams(args: string[]): ScriptysParams | undefined {
  const params = parseScriptysArgs(args);
  if (!params) {
    return undefined;
  }

  const config = getConfiguration(params);
  if (!config) {
    console.error("tys configuration not understood", args);
    return undefined;
  }
  const { tsFile, otherTsFiles, outDir, command } = config;
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
    sources,
    realOutDir,
    fullCommand
  };
}

export interface ParsedArguments {
  config?: string;
  tsFile?: string;
  otherTsFiles?: string[];
  command?: string;
  outDir?: string;
  commandArgs: string[];
}

/**
 * Parse command line arguments for scriptys
 * @param args command line argument array
 * @param _launcher  (for tests) override launch command name (normally argv[0])
 */
export function parseScriptysArgs(
  args: string[],
  _launcher?: string
): ParsedArguments | undefined {
  const rawLauncher = _launcher || yargs.parse("").$0;
  const launcher = path.basename(rawLauncher);
  if (launcher === "tys" || launcher === "tys.js") {
    return tysArguments(args);
  }
  return nonTysArguments(launcher, args);
}

/** Interpret arguments when launched as tys */
function tysArguments(args: string[]): ParsedArguments | undefined {
  const [tysArgs, commandArgs] = splitAtDDash(args);
  const yargArgs = tysLocalArgs(tysArgs);
  const unparsed = yargArgs._.slice();
  const config = configParameter(yargArgs.config);
  let tsFile: string | undefined;
  const { command, outDir, otherTsFiles} = yargArgs;
  if (!config) {
    tsFile = unparsed.shift();
  }
  commandArgs.push(...unparsed);

  const parsedArgs: ParsedArguments = {
    config,
    tsFile,
    otherTsFiles,
    outDir,
    command,
    commandArgs
  };

  return parsedArgs;
}

/** When not launched as tys (e.g. as gulptys) arguments go directly to command
 * and config file is based on name, e.g. gulptys.config.ts.
 */
function nonTysArguments(launcher: string, args: string[]): ParsedArguments {
  const config = launcher + ".config.ts";
  return {
    config,
    commandArgs: args
  };
}

/** split a set of arguments before and after a "--"  */
function splitAtDDash(args: string[]): [string[], string[]] {
  const found = args.findIndex(s => s === "--");
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
      describe: "tys configuration file"
    })
    .option("otherTsFiles", {
      string: true,
      array: true,
      describe: "additional typescript files (glob syntax)"
    })
    .option("command", {
      string: true,
      describe: "command to run after compiling"
    })
    .option("outDir", {
      string: true,
      describe: "directory for compiled js files"
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

function getConfiguration(params: ParsedArguments): TysConfig | undefined {
  const { config, tsFile, otherTsFiles , command, outDir } = params;
  if (config) {
    let configPath = config;
    if (!fs.existsSync(config) && !path.isAbsolute(config)) {
      configPath = path.join(__dirname, config);
      if (!fs.existsSync(configPath)) {
        console.log("config not found:", config, configPath);
        return undefined;
      }
    }
    return loadTsConfig<TysConfig>(configPath);
  } else if (tsFile) {
    return {
      tsFile,
      outDir,
      command,
      otherTsFiles
    };
  } else {
    console.error("no tsFile no config.tys.ts");
    return undefined;
  }
}

export function stripLauncherArgs(argv: string[]): string[] {
  if (isLauncherArg(argv[0])) {
    return argv.slice(2);
  } else {
    return argv.slice(1);
  }
}

export function tysDefaultOutDir(tsFile: string): string {
  return defaultOutDir(path.resolve(tsFile), "tys");
}
