import cli from 'cli-ux'
import {Command, flags} from '@oclif/command'
import {Database} from '../config/database'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'
import simpleGit from 'simple-git'
const glob = require('glob')

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

          await this.runFactories(configFile)
        }
      } else {
        await this.runFactories(configFile)
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

  private async runFactories(configFile: MongoMigrateRcInterface) {
    const factoryFilesDir = configFile?.factories.dir

    const db = new Database(configFile)
    await db.connect()

    const factoryFiles = await glob.sync(`${this.rootPath}/${factoryFilesDir}/*.js`)

    for await (const factoryFilePath of factoryFiles) {
      const factoryFileName = factoryFilePath
      .split('/')
      .find((f: string | string[]) => (f.includes('.js')))

      cli.action.start(`file: ${factoryFileName} factoring`, 'factoring', {stdout: true})

      const Factory = require(factoryFilePath)
      const factoryInstance = new Factory()

      await factoryInstance.run(db.mongoClient.db())

      cli.action.stop()
    }

    await db.mongoClient?.close()
  }
}
