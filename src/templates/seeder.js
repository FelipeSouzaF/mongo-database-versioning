module.exports = class Seeder {
  run(db) {
    console.log('run seeder')
  }

  rollback(db) {
    console.log('rollback seeder')
  }
}
