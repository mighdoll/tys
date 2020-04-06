import { TysConfig, locateJsOut} from "tys";

const gulpFileJs = locateJsOut("gulpfile.ts");

const config: TysConfig = {
  tsFile: "gulpfile.ts",
  otherTsFiles: ["build/**/*.ts"],
  command: `gulp --cwd . --gulpfile ${gulpFileJs}`
};

export default config;