## Tys
*A faster way to run Typescript scripts.*
####

### Run a typescript script fast.
```bash
# run a script
$ tys myScript.ts

# use Typescript gulpfile.ts for gulp but faster
$ gulptys clean test
```

Tys makes it fast to run short Typescript scripts, with full type checking.

Many people prefer Typescript to Javascript to get better error checking, 
richer IDE support, etc. But Typescript compilation takes a second or two
of time and typically requires some build boilerplate. For shorter scripts 
that lack build environments and are run repeatedly, Typescript 
is accordingly less popular. 

Hopefully tys makes it easier to use Typescript scripts for build tooling, etc.

### Alternatives to tys for running a short script

ts-node is more general purpose, but for the specific case of running
command line scripts, tys is about 4x faster than ts-node, because tys
caches compilation results externally.

sucrase-node is faster than ts-node, but provides no type checking.

## Install in your project.
```bash
$ yarn add --dev tys
```
or 
```bash
$ yarn add --dev tys
```

### or install tys for general use:
```bash
$ yarn global add tys
```
or
```bash
$ npm -i -g tys
```

### Usage
```bash
tys tsFile [Options] [arguments]
tys -c [tysConfigFile] [Options] [Arguments]
```

#### --command
Specify an alternate command to execute after compilation. If not specified,
tys will run your typescript file. 

#### --config
Specify 

#### --otherTsFiles
If your main typescript script imports other typescript files, list them here. 
Glob syntax is fine. This is important for robustness, so that tys knows when to 
recompile.


### Advanced options
#### --outDir
By default transpailed javascript files are cached in $HOME/.cache. You can set an
alternate cache directory if you prefer.
