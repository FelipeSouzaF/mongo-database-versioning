import {MongoClient} from 'mongodb'
import {MongoMigrateRcInterface} from '../types/mongo-migrate-rc'

export class Database {
  public mongoClient: MongoClient;

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

    this.connectionString = connectionString
    this.options = options
    this.debug = debug

    this.mongoClient = new MongoClient(this.connectionString, this.options)
  }

  public async connect(): Promise<void> {
    this.mongoClient.connect()
  }
}
