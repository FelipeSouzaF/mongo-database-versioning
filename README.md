mongo-database-versioning
=========================

Mongo DB migration database versioning

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mongo-database-versioning.svg)](https://npmjs.org/package/mongo-database-versioning)
[![CircleCI](https://circleci.com/gh/FelipeSouzaF/mongo-database-versioning/tree/master.svg?style=shield)](https://circleci.com/gh/FelipeSouzaF/mongo-database-versioning/tree/master)
[![Codecov](https://codecov.io/gh/FelipeSouzaF/mongo-database-versioning/branch/master/graph/badge.svg)](https://codecov.io/gh/FelipeSouzaF/mongo-database-versioning)
[![Downloads/week](https://img.shields.io/npm/dw/mongo-database-versioning.svg)](https://npmjs.org/package/mongo-database-versioning)
[![License](https://img.shields.io/npm/l/mongo-database-versioning.svg)](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @epilefapps/mongo-database-versioning
$ mongo-migrate COMMAND
running command...
$ mongo-migrate (-v|--version|version)
@epilefapps/mongo-database-versioning/0.1.0 linux-x64 node-v12.16.3
$ mongo-migrate --help [COMMAND]
USAGE
  $ mongo-migrate COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mongo-migrate hello [FILE]`](#mongo-migrate-hello-file)
* [`mongo-migrate help [COMMAND]`](#mongo-migrate-help-command)

## `mongo-migrate hello [FILE]`

describe the command here

```
USAGE
  $ mongo-migrate hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ mongo-migrate hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/v0.1.0/src/commands/hello.ts)_

## `mongo-migrate help [COMMAND]`

display help for mongo-migrate

```
USAGE
  $ mongo-migrate help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->
