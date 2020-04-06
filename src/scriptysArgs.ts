import {
  defaultOutDir,
  expectFilesExist,
  jsOutFile,
  loadTsConfig
} from "config-file-ts";
import glob from "glob";
import path from "path";
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

  const config = getConfig(params);
  if (!config) {
    console.error("tys configuration not understood", args);
    return undefined;
  }
  const { tsFile, otherTsFiles, outDir, command } = config;
  const exist = expectFilesExist([tsFile]);
  if (!exist) {
    console.error(`${tsFile} not found`);
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
  if (launcher !== "tys") {
    return nonTysArguments(launcher, args);
  }

  return tysArguments(args);
}

/** Interpret arguments when launched as tys */
function tysArguments(args: string[]): ParsedArguments | undefined {
  const [tysArgs, commandArgs] = splitAtDDash(args);
  const yargArgs = tysLocalArgs(tysArgs);
  const unparsed = yargArgs._.slice();
  const config = configParameter(yargArgs.config);
  let tsFile: string | undefined;
  if (!config) {
    tsFile = unparsed.shift();
  }
  commandArgs.push(...unparsed);

  const parsedArgs: ParsedArguments = {
    config,
    tsFile,
    commandArgs
  };

  return parsedArgs;
}

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

// TODO add option for command to run
// TODO add option for src files
// TODO add option for outDir

function tysLocalArgs(args: string[]) {
  return yargs
    .option("config", {
      alias: "c",
      string: true,
      describe: "tys configuration file"
    })
    .command("$ <tsFile..>", false)
    .usage(
      "$0 tsFile \n$0 -c [tysConfigFile]\nsymLinkToTys   # uses symlinkToTys.config.ts as config"
    )
    .help()
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

const launcherArg = /^(?:tys|node|yarn|npm)$/;

function isLauncherArg(arg: string): boolean {
  return path.basename(arg).match(launcherArg) !== null;
}

function getConfig(params: ParsedArguments): TysConfig | undefined {
  const { config, tsFile } = params;
  if (config) {
    return loadTsConfig<TysConfig>(config);
  } else if (tsFile) {
    return {
      tsFile
    };
  } else {
    console.error("no tsFile no config.tys.ts");
    return undefined;
  }
}
export function stripLauncherArgs(argv: string[]): string[] {
  const firstRealArg = argv.findIndex(arg => !isLauncherArg(arg));
  if (firstRealArg === -1) {
    return [];
  } else {
    const result = argv.slice(firstRealArg);
    return result;
  }
}

export function tysDefaultOutDir(tsFile: string): string {
  return defaultOutDir(path.resolve(tsFile), "tys");
}
