export interface DatabaseConnectionInterface {
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
}
