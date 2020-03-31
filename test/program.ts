import {utilFactor} from "./program-util";

const factor = parseFloat(process.argv[2]);
process.exit(utilFactor * factor);