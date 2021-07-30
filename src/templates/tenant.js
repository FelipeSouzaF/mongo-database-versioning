module.exports = class Tenant {
  get connection() {
    return {
      connectionString: '',

      connection: {
        host: 'localhost',
        port: 27017,
        user: 'root',
        password: 'toor',
        database: '',
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          authSource: 'admin',
        },
        debug: false,
      },
    }
  }
}
