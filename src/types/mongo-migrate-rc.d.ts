import {DatabaseConnectionInterface} from './database-connection'

export interface MongoMigrateRcInterface {
  connectionString?: string;
  connection?: DatabaseConnectionInterface;
}
