module.exports = class Migration {
  run() {
    console.log('run migration')
  }

  rollback() {
    console.log('rollback migration')
  }
}
