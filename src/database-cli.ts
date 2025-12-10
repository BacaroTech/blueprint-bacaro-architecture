import { BaseCLI } from "./base-cli";
import dotenv from "dotenv";

dotenv.config();

export class DatabaseCLI extends BaseCLI {
  private projectRoot: string;

  private projectName: string;
  private dbType: string;
  private dbPort: string;
  private dbUser?: string;
  private dbPassword?: string;
  private dbName?: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;

    // load values from .env file
    this.projectName = process.env.PROJECT_NAME?.toLocaleLowerCase() ?? "project";
    this.dbType = process.env.DATABASE_TYPE ?? "";
    this.dbPort = process.env.DATABASE_PORT ?? "";
    this.dbUser = process.env.DATABASE_USR;
    this.dbPassword = process.env.DATABASE_PASSWORD;
    this.dbName = process.env.DATABASE_NAME;
  }

  private generatePostgress(): string {
    return `
  ${this.projectName}-db:
      container_name: ${this.projectName}-db
      image: postgres:13
      environment:
        POSTGRES_PASSWORD: ${this.dbPassword}
        POSTGRES_USER: ${this.dbUser}
        POSTGRES_DB: ${this.dbName}
      ports:
        - "${this.dbPort}:5432"
      volumes:
        - ${this.projectName}-db-data:/var/lib/postgresql/data
      networks:
        - ${this.projectName}-network
      restart: unless-stopped 
`;
  }

  private generateMongo(): string {
    return `
  ${this.projectName}db:
      container_name: ${this.projectName}db
      image: mongo:6.0
      ports:
        - "${this.dbPort}:27017"
      volumes:
        - ${this.projectName}-db-data:/data/db
      networks:
        - ${this.projectName}-network
      restart: unless-stopped
      healthcheck:
        test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
        interval: 10s
        timeout: 5s
        retries: 5
`;
  }

  public auxGenerate(): string {
    switch (this.dbType.toLowerCase()) {
      case "postgres":
        return this.generatePostgress();
      case "mongo":
        return this.generateMongo();
      default:
        throw new Error(`Database type "${this.dbType}" not supported.`);
    }
  }
}
