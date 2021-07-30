module.exports = class Factory {
  run(db) {
    console.log('run factory')
  }

  rollback(db) {
    console.log('rollback factory')
  }
}
