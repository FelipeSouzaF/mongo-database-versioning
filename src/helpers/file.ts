import simpleGit, {SimpleGit} from 'simple-git'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const camelCase = require('camelcase')
const kebabCase = require('lodash.kebabcase')
const moment = require('moment')

export default class File {
  private git: SimpleGit;

  private configFile: MongoMigrateRcInterface | undefined

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
}
