mongo-database-versioning
=========================

Mongo DB migration database versioning

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mongo-database-versioning.svg)](https://npmjs.org/package/@epilefapps/mongo-database-versioning)
[![CircleCI](https://circleci.com/gh/FelipeSouzaF/mongo-database-versioning/tree/master.svg?style=shield)](https://circleci.com/gh/FelipeSouzaF/mongo-database-versioning/tree/master)
[![Codecov](https://codecov.io/gh/FelipeSouzaF/mongo-database-versioning/branch/master/graph/badge.svg)](https://codecov.io/gh/FelipeSouzaF/mongo-database-versioning)
[![Downloads/week](https://img.shields.io/npm/dw/mongo-database-versioning.svg)](https://npmjs.org/package/@epilefapps/mongo-database-versioning)
[![License](https://img.shields.io/npm/l/mongo-database-versioning.svg)](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/main/package.json)

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
@epilefapps/mongo-database-versioning/1.0.0 linux-x64 node-v16.2.0
$ mongo-migrate --help [COMMAND]
USAGE
  $ mongo-migrate COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [mongo-database-versioning](#mongo-database-versioning)
- [Usage](#usage)
- [Commands](#commands)
  - [`mongo-migrate create OPTION FILE`](#mongo-migrate-create-option-file)
  - [`mongo-migrate factory`](#mongo-migrate-factory)
  - [`mongo-migrate help [COMMAND]`](#mongo-migrate-help-command)
  - [`mongo-migrate migrate`](#mongo-migrate-migrate)
  - [`mongo-migrate rollback`](#mongo-migrate-rollback)
  - [`mongo-migrate seed`](#mongo-migrate-seed)

## `mongo-migrate create OPTION FILE`

command to create tenant, migration, seed or factory files

```
USAGE
  $ mongo-migrate create OPTION FILE

ARGUMENTS
  OPTION  (migration|seeder|factory|tenant) create the given file option
  FILE    create the given file name

OPTIONS
  -h, --help  show CLI help

EXAMPLE

         $ mongo-migrate create migration MigrationName
         $ mongo-migrate create seeder SeederName
         $ mongo-migrate create factory FactoryName
         $ mongo-migrate create tenant TenantName
```

_See code: [src/commands/create.ts](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/v1.0.0/src/commands/create.ts)_

## `mongo-migrate factory`

command to run factory files

```
USAGE
  $ mongo-migrate factory

OPTIONS
  -f, --file=file      factory file to run
  -h, --help           show CLI help
  -t, --tenant=tenant  tenant file to connect

EXAMPLE
  $ mongo-migrate factory
```

_See code: [src/commands/factory.ts](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/v1.0.0/src/commands/factory.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `mongo-migrate migrate`

command to run migrations files

```
USAGE
  $ mongo-migrate migrate

OPTIONS
  -h, --help           show CLI help
  -t, --tenant=tenant  tenant file to connect

EXAMPLE
  $ mongo-migrate migrate
```

_See code: [src/commands/migrate.ts](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/v1.0.0/src/commands/migrate.ts)_

## `mongo-migrate rollback`

command to rollback migrations files

```
USAGE
  $ mongo-migrate rollback

OPTIONS
  -h, --help           show CLI help
  -t, --tenant=tenant  tenant file to connect

EXAMPLE
  $ mongo-migrate rollback
```

_See code: [src/commands/rollback.ts](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/v1.0.0/src/commands/rollback.ts)_

## `mongo-migrate seed`

command to run seed files

```
USAGE
  $ mongo-migrate seed

OPTIONS
  -f, --file=file      seed file to run
  -h, --help           show CLI help
  -t, --tenant=tenant  tenant file to connect

EXAMPLE
  $ mongo-migrate seed
```

_See code: [src/commands/seed.ts](https://github.com/FelipeSouzaF/mongo-database-versioning/blob/v1.0.0/src/commands/seed.ts)_
<!-- commandsstop -->
