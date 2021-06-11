import {Command, flags} from '@oclif/command'
import {Database} from '../config/database'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import {migration} from '../models/migration'
const glob = require('glob')
import simpleGit from 'simple-git'

export default class Migrate extends Command {
  static description = 'describe the command here'

  static examples = [
    '$ mongo-migrate migrate',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    tenant: flags.string({
      char: 't',
      description: 'tenant connection to run',
      multiple: true,
    }),
    file: flags.string({
      char: 'f',
      description: 'migration file to run',
      multiple: true,
    }),
  }

  static args = [{name: 'file'}]

  async run() {
    try {
      // const {args, flags} = this.parse(Migrate)

      const git = simpleGit()
      const rootPath = await git.revparse(['--show-toplevel'])

      const mongoMigrateRc = new MongoMigrateRc()
      const configFile = await mongoMigrateRc.getConfigFile()

      const filesDir = configFile?.migrations.dir
      // const {connection, connectionString} = configFile

      const db = new Database(configFile)
      await db.connect()

      const MigrationModel = migration('migrations')

      const migrationFiles = await glob.sync(`${rootPath}/${filesDir}/*.js`)

      for await (const migrationFile of migrationFiles) {
        const Migration = require(migrationFile)
        const migrationInstance = new Migration()

        migrationInstance.run()

        await MigrationModel.create({
          fileName: migrationFile,
          batch: 1,
        })
      }

      db.mongoose?.disconnect()

      this.log('run migration command')
    } catch (error) {
      this.error(error.message)
    }
  }
}
