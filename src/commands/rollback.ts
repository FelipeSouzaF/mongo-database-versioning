import cli from 'cli-ux'
import {Command, flags} from '@oclif/command'
import {Database} from '../config/database'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'
import simpleGit from 'simple-git'
const glob = require('glob')

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
    file: flags.string({
      char: 'f',
      description: 'migration file to rollback',
      multiple: true,
    }),
  }

  async run() {
    try {
      cli.action.start('starting', 'loading', {stdout: true})

      cli.action.stop()

      const {flags} = this.parse(Rollback)

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

          await this.runMigrationsRollback(configFile)
        }
      } else {
        await this.runMigrationsRollback(configFile)
      }

      cli.action.start('stoping', 'loading', {stdout: true})

      cli.action.stop()
    } catch (error) {
      this.error(error.message)
    }
  }

  private async initialSetup() {
    const git = simpleGit()
    this.rootPath = await git.revparse(['--show-toplevel'])
  }

  private async runMigrationsRollback(configFile: MongoMigrateRcInterface) {
    const migrationFilesDir = configFile?.migrations.dir

    const db = new Database(configFile)
    await db.connect()

    const migrationCollection = db.mongoClient.db().collection('migrations')

    const migrationLastBatch = await (await migrationCollection.find().sort({batch: -1}).limit(1).toArray())[0]?.batch
    const migrationToRollback = await (await migrationCollection.find({batch: migrationLastBatch}).sort({batch: -1}).toArray())

    for await (const migrationFilePath of migrationToRollback) {
      cli.action.start(`file: ${migrationFilePath.fileName} rollbacking`, 'rollback', {stdout: true})

      const Migration = require(`${this.rootPath}/${migrationFilesDir}/${migrationFilePath.fileName}`)
      const migrationInstance = new Migration()

      await migrationInstance.rollback(db.mongoClient.db())

      await migrationCollection.deleteOne({
        fileName: migrationFilePath.fileName,
      })

      cli.action.stop()
    }

    await db.mongoClient?.close()
  }
}
