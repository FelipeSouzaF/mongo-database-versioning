import Mongoose = require('mongoose')
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'

export class Database {
  public mongoose: Mongoose.Mongoose;

  private connectionString: string;

  private options: object;

  private debug: boolean;

  public constructor({
    connectionString = '',
    connection = {
      host: 'localhost',
      port: 27017,
      user: 'admin',
      password: '',
      database: 'migrations',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        authSource: 'admin',
      },
      debug: false,
    },
  }: MongoMigrateRcInterface) {
    const {
      host,
      port,
      user,
      password,
      database,
      options,
      debug,
    } = connection

    if (!connectionString) {
      connectionString = `mongodb://${user}:${password}@${host}:${port}/${database}`
    }

    this.mongoose = Mongoose
    this.connectionString = connectionString
    this.options = options
    this.debug = debug
  }

  public async connect(): Promise<void> {
    if (this.debug) {
      Mongoose.set('debug', true)
    }
    Mongoose.set('useCreateIndex', true)
    await Mongoose.connect(this.connectionString, this.options)

    this.mongoose = Mongoose
  }
}
