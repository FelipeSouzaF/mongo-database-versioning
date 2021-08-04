import cli from 'cli-ux'
import {Command, flags} from '@oclif/command'
import {Database} from '../config/database'
import {MongoMigrateRc} from '../config/mongo-migrate-rc'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'
import simpleGit from 'simple-git'
const glob = require('glob')

export default class Migrate extends Command {
  private rootPath = ''

  static description = 'command to run migrations files'

  static examples = [
    '$ mongo-migrate migrate',
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
      description: 'migration file to run',
      multiple: true,
    }),
  }

  async run() {
    try {
      cli.action.start('starting', 'loading', {stdout: true})

      cli.action.stop()

      const {flags} = this.parse(Migrate)

      this.initialSetup()

      const mongoMigrateRc = new MongoMigrateRc()
      const configFile = await mongoMigrateRc.getConfigFile()

      const hasTenant = Boolean(flags.tenant && flags.tenant.length)
      const tenantFilesDir = configFile?.tenants?.dir

      if (hasTenant) {
        const tenantsPattern = flags.tenant[0] === 'all' ? '*' : `+(${flags.tenant.join('|')})`

        const tenantFiles = await glob.sync(`${this.rootPath}/${tenantFilesDir}/${tenantsPattern}.js`)

        for await (const tenantFilePath of tenantFiles) {
          const tenantFileName = tenantFilePath
          .split('/')
          .find((f: string | string[]) => (f.includes('.js')))

          cli.action.start(`\ntenant: ${tenantFileName}`, 'migrating', {stdout: true})

          const Tenant = require(tenantFilePath)
          const tenantInstance = new Tenant()

          configFile.connection = tenantInstance.connection.connection
          configFile.connectionString = tenantInstance.connection.connectionString

          cli.action.stop()

          await this.runMigrations(configFile)
        }
      } else {
        this.runMigrations(configFile)
      }

      cli.action.start('\nstoping', 'loading', {stdout: true})

      cli.action.stop()
    } catch (error) {
      this.error(error.message)
    }
  }

  private async initialSetup() {
    const git = simpleGit()
    this.rootPath = await git.revparse(['--show-toplevel'])
  }

  private async runMigrations(configFile: MongoMigrateRcInterface) {
    const migrationFilesDir = configFile?.migrations.dir

    const db = new Database(configFile)
    await db.connect()

    const migrationCollection = db.mongoClient.db().collection('migrations')

    const migrationFiles = await glob.sync(`${this.rootPath}/${migrationFilesDir}/*.js`)

    for await (const migrationFilePath of migrationFiles) {
      const migrationFileName = migrationFilePath
      .split('/')
      .find((f: string | string[]) => (f.includes('.js')))

      if (await migrationCollection.countDocuments({fileName: migrationFileName}) === 0) {
        cli.action.start(`file: ${migrationFileName}`, 'migrating', {stdout: true})

        const Migration = require(migrationFilePath)
        const migrationInstance = new Migration()

        await migrationInstance.run(db.mongoClient.db())

        await migrationCollection.insertOne({
          fileName: migrationFileName,
          batch: 1,
        })

        cli.action.stop()
      }
    }

    await db.mongoClient?.close()
  }
}
