export interface MongoMigrateRcInterface extends Object {
  connectionString?: string;
  connection?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;

    options: object;
    debug: boolean;
  };

  migrations: { dir: string; collectionName: string };
  seeders: { dir: string };
  factories: { dir: string };
  tenants: { dir: string };
}
