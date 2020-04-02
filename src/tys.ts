import { scriptysArgv } from "./scriptys";

scriptysArgv(process.argv).then(result => process.exit(result));
