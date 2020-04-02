import { utilFactor } from "./util/program-util";

const factor = parseFloat(process.argv[2]);
const result = utilFactor * factor;
process.exit(result);
