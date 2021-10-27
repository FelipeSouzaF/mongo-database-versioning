import {Command, flags} from '@oclif/command'
const fs = require('fs-extra')
const path = require('path')
import simpleGit from 'simple-git'

export default class Create extends Command {
  static description = 'command to init mongo-migrate into a repository'

  static examples = [
    `
      $ mongo-migrate install
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = []

  async run() {
    const git = simpleGit()

    const gitRepoTopLevel = await git.revparse(['--show-toplevel'])

    await fs.copySync(
      path.resolve(__dirname, '../templates/init.js'),
      gitRepoTopLevel + '/mongomigraterc.js'
    )
  }
}
