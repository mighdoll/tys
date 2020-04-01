// launcher for a typescript command
//   compiles the command if necessary
//

import glob from "glob";
import {
  compileIfNecessary,
  jsOutFile,
  loadTsConfig,
  expectFilesExist,
  defaultOutDir
} from "config-file-ts";
import { logExec } from "./execUtil";
import TysConfig from "./TysConfig";
import { once } from "events";
import yargs from "yargs";
import path from "path";

const defaultConfigFile = "tys.config.ts";

export { TysConfig };

export async function tysArgv(argv: string[]): Promise<number> {
  const args = stripLauncherArgs(argv);
  return tysArgs(args);
}

export async function tysCommandLine(cmdLine: string): Promise<number> {
  const args = cmdLine.split(/\s+/);
  return tysArgs(args);
}

async function tysArgs(args: string[]): Promise<number> {
  const params = parseArgs(args);
  const config = getConfig(params);
  const { tsFile, otherTsFiles, outDir, command } = config;

  const sources = [tsFile, ...otherSources(otherTsFiles)];
  const realOutDir = outDir || defaultOutDir(path.resolve(tsFile), "tys");
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

  const proc = logExec(fullCommand, "");
  const results = await once(proc, "exit");
  const [result] = results;
  return result;
}

interface Arguments {
  config?: string;
  tsFile?: string;
  commandArgs: string[];
}

function getConfig(params: Arguments): TysConfig {
  const { config, tsFile } = params;
  if (config) {
    return loadTsConfig<TysConfig>(config) || process.exit(1);
  } else if (tsFile) {
    return {
      tsFile
    };
  } else {
    return loadTsConfig<TysConfig>(defaultConfigFile) || process.exit(1);
  }
}

// TODO add option for command to run
// TODO add option for src files
// TODO add option for outDir
// TODO add option for -- to pass to cmd

function parseArgs(args: string[]): Arguments {
  const commandArgs = [];
  const localArgs = tysLocalArgs(args);

  const config = configFileParameter(localArgs.config);
  const unparsed = localArgs._.slice();
  let tsFile: string | undefined;
  if (!config && unparsed.length > 0) {
    tsFile = unparsed.shift();
  }
  if (commandArgs.length === 0) {
    commandArgs.push(...unparsed);
  }

  const tysArgs: Arguments = {
    config,
    tsFile,
    commandArgs
  };
  console.log("tys args", tysArgs);

  return tysArgs;
}

function tysLocalArgs(args: string[]) {
  return yargs
    .option("config", {
      alias: "c",
      string: true,
      describe: "tys configuration file"
    })
    .usage("$0 tsFile \n$0 -c [tysConfigFile]")
    .help()
    .parse(args);
}

function configFileParameter(config: unknown): string | undefined {
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

function stripLauncherArgs(argv: string[]): string[] {
  const programArg = /(?:tys|node|yarn|npm)(?:.[a-zA-Z]+)|[]$/;
  const found = argv.findIndex(arg => !arg.match(programArg));
  const firstRealArg = Math.max(found, 0);
  return argv.slice(firstRealArg);
}
