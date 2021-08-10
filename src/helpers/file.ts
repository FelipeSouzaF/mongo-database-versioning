import simpleGit, {SimpleGit} from 'simple-git'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'
import {Database} from '../config/database'
import cli from 'cli-ux'

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const camelCase = require('camelcase')
const kebabCase = require('lodash.kebabcase')
const moment = require('moment')
const glob = require('glob')

export default class File {
  private git: SimpleGit;

  private configFile: MongoMigrateRcInterface

  constructor(
    config: MongoMigrateRcInterface
  ) {
    this.git = simpleGit()

    this.configFile = config
  }

  private rootPath(): Promise<string> {
    return this.git.revparse(['--show-toplevel'])
  }

  public async make(
    file: string,
    option: string,
  ) {
    const fileDate = moment().format('YYYY-MM-DD-x')
    const fileName = kebabCase(file)
    const className = camelCase(fileName, {pascalCase: true})

    const fileDir = this.getFileDir(option)
    const fileContent = await this.readTemplateFileContent(option, className)

    await fse.outputFileSync(
      path.join(
        await this.rootPath(),
        this.getCompleteFilePath(
          fileDir,
          fileDate,
          fileName,
          option
        )
      ),
      fileContent
    )
  }

  private getFileDir(fileOption: string): string {
    let fileDirName: string | undefined

    switch (fileOption) {
    case 'rollback':
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

  private async readTemplateFileContent(
    option: string,
    className: string,
  ) {
    return fs.readFileSync(
      path.join(__dirname, `../templates/${option}.js`),
      'utf-8'
    )
    .replace(/(class )(\w+)( {)/gi, `$1${className}$3`)
  }

  private getCompleteFilePath(
    fileDir: string,
    fileDate: string,
    fileName: string,
    fileOption: string
  ): string {
    if (this.useDateInFileName(fileOption)) {
      return `${fileDir}/${fileDate}-${fileName}.js`
    }

    return `${fileDir}/${fileName}.js`
  }

  private useDateInFileName(fileOption: string): boolean {
    return !(fileOption === 'tenant')
  }

  public async execute(
    type: string,
    tenant: string[]
  ) {
    const filesDir = this.getFileDir(type)

    const hasTenant = Boolean(tenant && tenant.length)
    const tenantFilesDir = this.configFile?.tenants?.dir

    if (hasTenant) {
      const tenantsPattern = tenant[0] === 'all' ? '*' : `+(${tenant.join('|')})`
      const tenantFiles = await glob.sync(`${await this.rootPath()}/${tenantFilesDir}/${tenantsPattern}.js`)

      for await (const [index, tenantFilePath] of tenantFiles.entries()) {
        const tenantFileName = await this.filterJsFileName(tenantFilePath)

        const newLine = index ? '\n' : ''

        cli.action.start(`${newLine}tenant: ${tenantFileName}`, 'migrating', {stdout: true})

        const Tenant = require(tenantFilePath)
        const tenantInstance = new Tenant()

        this.configFile.connection = tenantInstance.connection.connection
        this.configFile.connectionString = tenantInstance.connection.connectionString

        cli.action.stop()

        await this.executeConnection(type, filesDir, this.configFile)
      }
    } else {
      await this.executeConnection(type, filesDir, this.configFile)
    }
  }

  private async executeConnection(
    type: string,
    filesDir: string,
    configFile: MongoMigrateRcInterface
  ) {
    const db = new Database(configFile)
    await db.connect()

    switch (type) {
    case 'migration':
      await this.migrate(db, filesDir)
      break
    case 'rollback':
      await this.rollback(db, filesDir)
      break
    case 'seeder':
    case 'factory':
      await this.seedOrFactory(db, filesDir)
    }

    await db.mongoClient?.close()
  }

  private async migrate(db, filesDir: string) {
    const migrationCollection = db.mongoClient.db().collection('migrations')
    const migrationFiles = await glob.sync(`${await this.rootPath()}/${filesDir}/*.js`)

    for await (const migrationFilePath of migrationFiles) {
      const migrationFileName = await this.filterJsFileName(migrationFilePath)

      const migrationLastBatch = await (await migrationCollection.find().sort({batch: -1}).limit(1).toArray())[0]?.batch | 1

      if (await migrationCollection.countDocuments({fileName: migrationFileName}) === 0) {
        cli.action.start(`file: ${migrationFileName} migrating`, 'migrating', {stdout: true})

        const Migration = require(migrationFilePath)
        const migrationInstance = new Migration()

        await migrationInstance.run(db.mongoClient.db())

        await migrationCollection.insertOne({
          fileName: migrationFileName,
          batch: migrationLastBatch,
        })

        cli.action.stop()
      }
    }
  }

  private async rollback(db, filesDir: string) {
    const migrationCollection = db.mongoClient.db().collection('migrations')

    const migrationLastBatch = await (await migrationCollection.find().sort({batch: -1}).limit(1).toArray())[0]?.batch
    const migrationToRollback = await (await migrationCollection.find({batch: migrationLastBatch}).sort({batch: -1}).toArray())

    for await (const migrationFilePath of migrationToRollback) {
      cli.action.start(`file: ${migrationFilePath.fileName} rollbacking`, 'rollback', {stdout: true})

      const Migration = require(`${await this.rootPath()}/${filesDir}/${migrationFilePath.fileName}`)
      const migrationInstance = new Migration()

      await migrationInstance.rollback(db.mongoClient.db())

      await migrationCollection.deleteOne({
        fileName: migrationFilePath.fileName,
      })

      cli.action.stop()
    }
  }

  private async seedOrFactory(db, filesDir: string) {
    const seedFiles = await glob.sync(`${await this.rootPath()}/${filesDir}/*.js`)

    for await (const seedFilePath of seedFiles) {
      const seedFileName = await this.filterJsFileName(seedFilePath)

      cli.action.start(`file: ${seedFileName} seeding`, 'seeding', {stdout: true})

      const Seeder = require(seedFilePath)
      const seederInstance = new Seeder()

      await seederInstance.run(db.mongoClient.db())

      cli.action.stop()
    }
  }

  private async filterJsFileName(filePath: string): Promise<string | undefined> {
    return filePath.split('/').find((f: string | string[]) => (f.includes('.js')))
  }
}
