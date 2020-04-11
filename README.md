## Tys
Tys runs TypeScript scripts with full type checking 
and a persistent cache for speed. 


```bash
# run a script
tys myScript.ts

# use gulp with a TypeScript gulpfile.ts
gulptys --tasks
```

TypeScript fans prefer TypeScript to JavaScript to get better error checking, 
richer IDE support, etc. 
But TypeScript compilation takes a second or two and requires some build boilerplate. 
Hopefully tys makes it easier to use TypeScript scripts for lightweight tasks.

### Alternatives to tys for running a TypeScript

ts-node is more general purpose, but for the specific case of running
command line scripts, tys is about 4x faster than ts-node because tys
caches compilation results externally.

sucrase-node is faster than ts-node, but provides no type checking.

### Add .ts config file support to an existing tool with .js config files 
Tys can also compile and cache TypeScript configuration files for existing tools that 
use .js configuration files.

See [gulptys](https://github.com/mighdoll/tys/blob/master/src/gulptys.mustache) for an example.
A gulptys symlink is installed when you install tys.
(gulp also supports .ts config files on its own, but the gulptys wrapper is 4x faster.)

### Create a new tool with .ts config files
See [config-file-ts](https://github.com/mighdoll/config-file-ts) to integrate caching TypeScript config files into tools you write.

## Install 
```bash
# yarn project
yarn add --dev tys

# npm project
npm -i --dev tys

# general use via yarn
yarn global add tys

# general use via npm
npm -i -g tys
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
Specify tys options by default exporting a [TysConfig](src/TysConfig.ts) structure from a TypeScript file. 
If ```-c``` is specified without an config file, 
tys will look for a file named *tysconfig.ts* in the current directory and 
the tys installation directory.
* ```--outDir <directory> ```
Directory in which to cache transpiled JavaScript output files. 
Without this option, tys caches in *$HOME/.cache/tys*. 

* ```[symlink-to-tys] <cmd arguments>```
If tys is launched through a symlink, tys will look for a configuration file named after the symlink, e.g. ```symlink-to-tys.config.ts```. 
All command line arguments are passed to the configured command.
See [gulptys](https://github.com/mighdoll/tys/blob/master/src/gulptys.mustache) for an example. 
