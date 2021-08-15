import cli from 'cli-ux'
import {Command, flags} from '@oclif/command'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import File from '../helpers/file'

export default class Rollback extends Command {
  private rootPath = ''

  static description = 'command to rollback migrations files'

  static examples = [
    '$ mongo-migrate rollback',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    tenant: flags.string({
      char: 't',
      description: 'tenant file to connect',
      multiple: true,
    }),
  }

  async run() {
    try {
      cli.action.start('starting', 'loading', {stdout: true})

      cli.action.stop()

      const {flags} = this.parse(Rollback)

      const mongoMigrateRc = new MongoMigrateRc()

      const file = new File(
        await mongoMigrateRc.getConfigFile()
      )

      await file.execute('rollback', flags.tenant)

      cli.action.start('stoping', 'loading', {stdout: true})

      cli.action.stop()
    } catch (error: any) {
      this.error(error.message)
    }
  }
}
