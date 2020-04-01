import {utilFactor} from "./program-util";

const factor = parseFloat(process.argv[2]);
const result = utilFactor * factor;
console.log("program result: ", result);
process.exit(result);