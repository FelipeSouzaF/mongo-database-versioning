module.exports = class Tenant {
  run() {
    console.log('run tenant')
  }

  rollback() {
    console.log('rollback tenant')
  }
}
