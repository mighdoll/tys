// TODO put this in dist and import from "tys" in the dist version

// import { TysConfig, locateJsOut} from "tys";
import { TysConfig, locateJsOut} from "./src/scriptys";

const gulpFileJs = locateJsOut("gulpfile.ts");

const config: TysConfig = {
  tsFile: "gulpfile.ts",
  otherTsFiles: ["build/**/*.ts"],
  command: `gulp --cwd . --gulpfile ${gulpFileJs}`
};

export default config;