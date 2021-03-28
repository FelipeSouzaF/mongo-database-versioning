export interface DatabaseConnectionInterface {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;

  options: object;
  debug: boolean;
}
