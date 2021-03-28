import {Command, flags} from '@oclif/command'
import {Database} from '../config/database'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import {migration} from '../models/migration'

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

      const mongoMigrateRc = new MongoMigrateRc()
      const configFile = await mongoMigrateRc.getConfigFile()
      const {connection, connectionString} = configFile

      const db = new Database({connection, connectionString})
      await db.connect()

      const Migration = migration('migrations')

      await Migration.findOne({})

      db.mongoose?.disconnect()
      this.log('run migration command')
    } catch (error) {
      this.error(error.message)
    }
  }
}
