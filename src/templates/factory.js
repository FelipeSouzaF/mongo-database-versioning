module.exports = class Factory {
  run() {
    console.log('run factory')
  }

  rollback() {
    console.log('rollback factory')
  }
}
