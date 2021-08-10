import {Command, flags} from '@oclif/command'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import File from '../helpers/file'

export default class Create extends Command {
  static description = 'command to create tenant, migration, seed or factory files'

  static examples = [
    `
      $ mongo-migrate create migration MigrationName
      $ mongo-migrate create seeder SeederName
      $ mongo-migrate create factory FactoryName
      $ mongo-migrate create tenant TenantName
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'option',
      required: true,
      description: 'create the given file option',
      hidden: false,
      options: [
        'migration',
        'seeder',
        'factory',
        'tenant',
      ],
    },
    {
      name: 'file',
      required: true,
      description: 'create the given file name',
      hidden: false,
    },
  ]

  async run() {
    const {args} = this.parse(Create)

    const mongoMigrateRc = new MongoMigrateRc()

    const file = new File(
      await mongoMigrateRc.getConfigFile()
    )

    await file.make(
      args.file,
      args.option
    )
  }
}
