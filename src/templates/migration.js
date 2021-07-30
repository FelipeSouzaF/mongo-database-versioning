module.exports = class Migration {
  run(db) {
    console.log('run migration')
  }

  rollback(db) {
    console.log('rollback migration')
  }
}
