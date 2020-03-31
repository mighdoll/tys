// launcher for a typescript command
//   compiles the command if necessary
//

import glob from "glob";
import {
  compileIfNecessary,
  jsOutFile,
  loadTsConfig,
  expectFilesExist
} from "config-file-ts";
import { logExec } from "./execUtil";
import TysConfig from "./TysConfig";
import { once } from "events";

const defaultConfig = "tys.config.ts";

const defaultOutDir = ".build"; // for the tys users compiled output

tysArgv([]);

async function tysArgv(argv: string[]): Promise<number> {
  const config = loadTsConfig<TysConfig>(defaultConfig) || process.exit(1);
  const { tsFile, otherTsFiles, outDir, command } = config;

  const sources = [tsFile, ...otherSources(otherTsFiles)];
  const realOutDir = outDir || defaultOutDir;
  const fullCommand = commandToRun(tsFile, realOutDir, command);

  expectFilesExist([tsFile]) || process.exit(1);
  compileIfNecessary(sources, realOutDir) || process.exit(1);
  const proc = logExec(fullCommand, "");
  const [result] = await once(proc, "exit");
  return result;
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

function commandToRun(tsFile: string, realOutDir: string, command?: string) {
  const cmdArgs = process.argv.slice(2).join(" ");
  const jsPath = jsOutFile(tsFile, realOutDir);
  const realCmd = command || `node ${jsPath}`;
  return `${realCmd} ${cmdArgs}`;
}

export async function tysCommandLine(cmdLine: string): Promise<number> {
  const args = cmdLine.split(/\s+/);
  args.unshift("tys");
  return tysArgv(args);
}

export { TysConfig };
