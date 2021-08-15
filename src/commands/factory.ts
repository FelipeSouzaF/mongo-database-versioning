import cli from 'cli-ux'
import {Command, flags} from '@oclif/command'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import File from '../helpers/file'

export default class Factory extends Command {
  private rootPath = ''

  static description = 'command to run factory files'

  static examples = [
    '$ mongo-migrate factory',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    tenant: flags.string({
      char: 't',
      description: 'tenant file to connect',
      multiple: true,
    }),
    file: flags.string({
      char: 'f',
      description: 'factory file to run',
      multiple: true,
    }),
  }

  async run() {
    try {
      cli.action.start('starting', 'loading', {stdout: true})

      cli.action.stop()

      const {flags} = this.parse(Factory)

      const mongoMigrateRc = new MongoMigrateRc()

      const file = new File(
        await mongoMigrateRc.getConfigFile()
      )

      const fileExec = flags.file ? flags.file[0] : ''

      await file.execute('factory', flags.tenant, fileExec)

      cli.action.start('stoping', 'loading', {stdout: true})

      cli.action.stop()
    } catch (error: any) {
      this.error(error.message)
    }
  }
}
