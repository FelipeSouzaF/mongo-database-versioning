import {validate} from 'indicative/validator'
import simpleGit, {SimpleGit} from 'simple-git'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'
const requireUncached = require('require-uncached')

export class MongoMigrateRc {
  public constructor() {
    this.configFile = this.readRcConfigFile()
  }

  private configFileName = 'mongomigraterc.js'

  private configFile: Promise<MongoMigrateRcInterface>

  private git: SimpleGit = simpleGit()

  public getConfigFile(): Promise<MongoMigrateRcInterface> {
    return this.configFile
  }

  private async readRcConfigFile(): Promise<MongoMigrateRcInterface> {
    await this.checkIfIsInsideGitRepository()

    try {
      const gitRepoTopLevel = await this.git.revparse(['--show-toplevel'])

      let mongoMigrateRcFile: object = {}
      try {
        mongoMigrateRcFile = requireUncached(`${gitRepoTopLevel}/${this.configFileName}`)
      } catch {
        throw new Error(`Must exists a ${this.configFileName} file on the root directory of your git repository`)
      }

      try {
        await this.validateFileProps(mongoMigrateRcFile)
      } catch (error) {
        throw error
      }

      return mongoMigrateRcFile
    } catch (error) {
      throw error
    }
  }

  private async checkIfIsInsideGitRepository(): Promise<void> {
    const isInsideGitRepo: boolean = await this.git.checkIsRepo()

    if (!isInsideGitRepo) {
      throw new Error('Mongo migrate commands must be executed inside a git repository')
    }
  }

  private async validateFileProps(fileProps: object): Promise<void> {
    const migrationRules = {
      migrations: 'required|object',
      'migrations.dir': 'required|string',
      'migrations.collectionName': 'required|string',
    }

    const seedersRules = {
      seeders: 'required|object',
      'seeders.dir': 'required|string',
    }

    const factoriesRules = {
      'factories.dir': 'required|string',
    }

    const tenantRules = {
      'tenants.dir': 'required|string',
    }

    const connectionRules = {
      connectionString: 'required_without_any:connection|string',
      connection: 'required_without_any:connectionString|object',
      'connection.host': 'required|string',
      'connection.port': 'required|number',
      'connection.user': 'required|string',
      'connection.password': 'string',
      'connection.options': 'object',
      'connection.debug': 'boolean',
    }

    const rules = {
      ...migrationRules,
      ...seedersRules,
      ...factoriesRules,
      ...tenantRules,
      ...connectionRules,
    }

    await validate(fileProps, rules)
    .catch(() => {
      throw new Error(`The ${this.configFileName} contain invalid properties`)
    })
  }
}
