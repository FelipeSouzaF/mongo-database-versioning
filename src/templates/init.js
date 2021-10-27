module.exports = {
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

  migrations: {
    dir: '',
    collectionName: '',
  },

  seeders: {
    dir: '',
  },

  factories: {
    dir: '',
  },

  tenants: {
    dir: '',
  },
}
