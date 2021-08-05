import cli from 'cli-ux'
import {Command, flags} from '@oclif/command'
import {Database} from '../config/database'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'
import simpleGit from 'simple-git'
const glob = require('glob')

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
    try {
      cli.action.start('starting', 'loading', {stdout: true})

      cli.action.stop()

      const {flags} = this.parse(Seed)

      this.initialSetup()

      const mongoMigrateRc = new MongoMigrateRc()
      const configFile = await mongoMigrateRc.getConfigFile()

      const hasTenant = Boolean(flags.tenant && flags.tenant.length)
      const tenantFilesDir = configFile?.tenants?.dir

      if (hasTenant) {
        const tenantsPattern = flags.tenant[0] === 'all' ? '*' : `+(${flags.tenant.join('|')})`

        const tenantFiles = await glob.sync(`${this.rootPath}/${tenantFilesDir}/${tenantsPattern}.js`)

        for await (const [index, tenantFilePath] of tenantFiles.entries()) {
          const tenantFileName = tenantFilePath
          .split('/')
          .find((f: string | string[]) => (f.includes('.js')))

          const newLine = index ? '\n' : ''

          cli.action.start(`${newLine}tenant: ${tenantFileName}`, 'rollback', {stdout: true})

          const Tenant = require(tenantFilePath)
          const tenantInstance = new Tenant()

          configFile.connection = tenantInstance.connection.connection
          configFile.connectionString = tenantInstance.connection.connectionString

          cli.action.stop()

          await this.runSeeders(configFile)
        }
      } else {
        await this.runSeeders(configFile)
      }

      cli.action.start('stoping', 'loading', {stdout: true})

      cli.action.stop()
    } catch (error: any) {
      this.error(error.message)
    }
  }

  private async initialSetup() {
    const git = simpleGit()
    this.rootPath = await git.revparse(['--show-toplevel'])
  }

  private async runSeeders(configFile: MongoMigrateRcInterface) {
    const seedFilesDir = configFile?.seeders.dir

    const db = new Database(configFile)
    await db.connect()

    const seedFiles = await glob.sync(`${this.rootPath}/${seedFilesDir}/*.js`)

    for await (const seedFilePath of seedFiles) {
      const seedFileName = seedFilePath
      .split('/')
      .find((f: string | string[]) => (f.includes('.js')))

      cli.action.start(`file: ${seedFileName} seeding`, 'seeding', {stdout: true})

      const Seeder = require(seedFilePath)
      const seederInstance = new Seeder()

      await seederInstance.run(db.mongoClient.db())

      cli.action.stop()
    }

    await db.mongoClient?.close()
  }
}
