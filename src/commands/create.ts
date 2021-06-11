import {Command, flags} from '@oclif/command'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'
import simpleGit from 'simple-git'
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const camelCase = require('camelcase')
const kebabCase = require('lodash.kebabcase')
const moment = require('moment')

export default class Create extends Command {
  static description = 'describe the command here'

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

  private configFile: MongoMigrateRcInterface | undefined

  async run() {
    const {args} = this.parse(Create)

    const mongoMigrateRc = new MongoMigrateRc()
    this.configFile = await mongoMigrateRc.getConfigFile()

    const git = simpleGit()
    const fileDate = moment().format('YYYY-MM-DD-x')
    const fileName = kebabCase(args.file)
    const className = camelCase(args.file, {pascalCase: true})
    const fileDir = this.getFileDir(args.option)
    const rootPath = await git.revparse(['--show-toplevel'])

    const fileContent = await fs.readFileSync(
      path.join(__dirname, `../templates/${args.option}.js`),
      'utf-8'
    )
    .replace(/(class )(\w+)( {)/gi, `$1${className}$3`)

    await fse.outputFileSync(
      path.join(
        rootPath,
        `${fileDir}/${fileDate}-${fileName}.js`
      ),
      fileContent
    )
  }

  private getFileDir(fileOption: string): string {
    let fileDirName: string | undefined

    switch (fileOption) {
    case 'migration':
      fileDirName = this.configFile?.migrations.dir
      break
    case 'seeder':
      fileDirName = this.configFile?.seeders.dir
      break
    case 'factory':
      fileDirName = this.configFile?.factories.dir
      break
    case 'tenant':
      fileDirName = this.configFile?.tenants.dir
      break
    }

    if (!fileDirName) {
      throw new Error(`${fileOption} directory not found`)
    }

    return fileDirName
  }
}
