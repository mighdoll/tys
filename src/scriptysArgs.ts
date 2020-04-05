import { expectFilesExist, jsOutFile, loadTsConfig } from "config-file-ts";
import glob from "glob";
import path from "path";
import yargs from "yargs";
import { TysConfig, tysDefaultOutDir } from "./scriptys";

export interface ScriptysParams {
  tsFile: string;
  sources: string[];
  realOutDir: string;
  fullCommand: string;
}

export function scriptysParams(args: string[]): ScriptysParams | undefined {
  const params = parseScriptysArgs(args);
  const config = getConfig(params);
  if (!config) {
    console.error("config not found");
    return undefined;
  }
  const { tsFile, otherTsFiles, outDir, command } = config;
  const exist = expectFilesExist([tsFile]);
  if (!exist) {
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
  launcher: string;
}

export function parseScriptysArgs(
  args: string[],
  _launcher?: string
): ParsedArguments {
  const yargArgs = tysLocalArgs(args);
  console.log("yargArgs", yargArgs);
  const launcher = _launcher || yargArgs.$0;
  const config = configArgument(yargArgs.config, launcher);

  const unparsed = yargArgs._.slice();
  let tsFile: string | undefined;
  if (!config && unparsed.length !== 0) {
    tsFile = unparsed.shift();
  }
  const commandArgs = [...unparsed];

  const tysArgs: ParsedArguments = {
    launcher,
    config,
    tsFile,
    commandArgs
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
      describe: "tys configuration file"
    })
    .command("$ <tsFile..>", false)
    .usage("$0 tsFile \n$0 -c [tysConfigFile]")
    .help()
    .parse(args);
}

function configArgument(
  config: string | undefined,
  launcher: string
): string | undefined {
  if (config === undefined) {
    return undefined; // no --config specified
  } else if (typeof config === "string" && config.length > 0) {
    return config; // --config specified
  } else {
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
