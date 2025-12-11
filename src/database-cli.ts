import { BaseCLI } from "./base-cli";
import dotenv from "dotenv";

dotenv.config();

export class DatabaseCLI extends BaseCLI {
  private projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  private generatePostgress(): string {
    return `
  ${this.PROJECT_NAME}-db:
      container_name: ${this.PROJECT_NAME}-db
      image: postgres:13
      environment:
        POSTGRES_PASSWORD: ${this.DATABASE_PASSWORD}
        POSTGRES_USER: ${this.DATABASE_USR}
        POSTGRES_DB: ${this.DATABASE_NAME}
      ports:
        - "${this.DATABASE_PORT}:5432"
      volumes:
        - ${this.PROJECT_NAME}-db-data:/var/lib/postgresql/data
      networks:
        - ${this.PROJECT_NAME}-network
      restart: unless-stopped 
`;
  }

  private generateMongo(): string {
    return `
  ${this.PROJECT_NAME}db:
      container_name: ${this.PROJECT_NAME}db
      image: mongo:6.0
      ports:
        - "${this.DATABASE_PORT}:27017"
      volumes:
        - ${this.PROJECT_NAME}-db-data:/data/db
      networks:
        - ${this.PROJECT_NAME}-network
      restart: unless-stopped
      healthcheck:
        test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
        interval: 10s
        timeout: 5s
        retries: 5
`;
  }

  public auxGenerate(): string {
    switch (this.DATABASE_TYPE.toLowerCase()) {
      case "postgres":
        return this.generatePostgress();
      case "mongo":
        return this.generateMongo();
      default:
        throw new Error(`Database type "${this.DATABASE_TYPE}" not supported.`);
    }
  }
}
