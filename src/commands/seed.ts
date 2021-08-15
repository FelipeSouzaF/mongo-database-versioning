import cli from 'cli-ux'
import {Command, flags} from '@oclif/command'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import File from '../helpers/file'

export default class Seed extends Command {
  private rootPath = ''

  static description = 'command to run seed files'

  static examples = [
    '$ mongo-migrate seed',
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
      description: 'seed file to run',
      multiple: true,
    }),
  }

  async run() {
    cli.action.start('starting', 'loading', {stdout: true})

    cli.action.stop()

    const {flags} = this.parse(Seed)

    const mongoMigrateRc = new MongoMigrateRc()

    const file = new File(
      await mongoMigrateRc.getConfigFile()
    )

    const fileExec = flags.file ? flags.file[0] : ''

    await file.execute('seeder', flags.tenant, fileExec)

    cli.action.start('stoping', 'loading', {stdout: true})

    cli.action.stop()
  }
}
