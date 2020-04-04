## Tys
Tys makes it fast to run short TypeScript scripts with full type checking 
and a persistent cache for speed. 

```bash
# run a script
$ tys myScript.ts

# use TypeScript gulpfile.ts for gulp
$ gulptys --tasks
```

Many people prefer TypeScript to JavaScript to get better error checking, 
richer IDE support, etc. But TypeScript compilation takes a second or two
and typically requires some build boilerplate. 

Hopefully tys makes it easier to use TypeScript scripts for lightweight tasks
like build scripts.

### Alternatives to tys for running a TypeScript

ts-node is more general purpose, but for the specific case of running
command line scripts, tys is about 4x faster than ts-node because tys
caches compilation results externally.

sucrase-node is faster than ts-node, but provides no type checking.

### For .js/.ts config files

Tys can also compile and cache TypeScript configuration files for existing tools that 
use .js configuration files.

See [gulptys] for an example. (gulp supports .ts config files on its own, but 
the gulptys wrapper is 4x faster.)

See [config-file-ts](https://github.com/mighdoll/config-file-ts) to integrate caching TypeScript config files into tools you write.

## Install 
```bash
# yarn project
$ yarn add --dev tys

# npm project
$ npm -i --dev tys

# general use via yarn
$ yarn global add tys

# general use via npm
$ npm -i -g tys
```

### Usage
```bash
tys [tys options] cmd.ts [-- cmd arguments]
tys -c [tysConfigFile] [tys options] [-- cmd arguments]
```

#### Command line options

* ```--otherTsFiles <glob glob glob> ```
If your TypeScript script imports other TypeScript files, list them here so that tys 
knows when to recompile. No need to list packages installed in node_modules.
* ```--command <cmd> [cmd arguments] ``` 
Execute this command after TypeScript compilation instead of executing the compiled TypeScript.
This is handy to compile a config file for an existing tool.

#### Advanced command line options
* ```-c, --config [configFile] ```
Specify tys options by default exporting a [TysConfig](src/TysConfig.ts) structure from a TypeScript file. If ```-c``` is specified without an config file, tys will look for a file 
named *tysconfig.ts*.
* ```--outDir <directory> ```
Directory in which to cache transpiled JavaScript output files. 
Without this option, tys caches in *$HOME/.cache/tys*. 