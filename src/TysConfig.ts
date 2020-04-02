/**
 * Configuration options for tys. 
 */
export default interface TysConfig {
  /** typescript file to compile */
  tsFile: string, 

  /** directory containing compiled js version of typescript files */
  outDir?: string,

  /** command to run. If not specified, tys will run node on the js file 
   * compiled from tsFile */
  command?: string,

  /** Additional ts files to compile. Glob syntax is supported. Must be ts files. */
  otherTsFiles?: string[]
}