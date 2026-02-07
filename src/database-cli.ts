import { BaseCLI } from "./base-cli";
import dotenv from "dotenv";
import { DictionaryCLI } from "./dictionary-cli";

dotenv.config();

export class DatabaseCLI extends BaseCLI {
  private readonly projectRoot: string;
  private readonly PROJECT_NAME_TOLOWER: string = DictionaryCLI.get("PROJECT_NAME").toLocaleLowerCase() ?? '';

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  private generatePostgress(): string {
    return `
  ${DictionaryCLI.get("PROJECT_NAME")}-db:
    container_name: ${DictionaryCLI.get("PROJECT_NAME")}-db
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: ${DictionaryCLI.get("DATABASE_PASSWORD")}
      POSTGRES_USER: ${DictionaryCLI.get("DATABASE_USR")}
      POSTGRES_DB: ${DictionaryCLI.get("DATABASE_NAME")}
    ports:
      - "${DictionaryCLI.get("DATABASE_PORT")}:5432"
    volumes:
      - ${DictionaryCLI.get("PROJECT_NAME")}-db-data:/var/lib/postgresql/data
    networks:
      - ${DictionaryCLI.get("PROJECT_NAME")}-network
    restart: unless-stopped 
`;
  }

  private generateMongo(): string {
    return `
  ${DictionaryCLI.get("PROJECT_NAME")}-db:
      container_name: ${DictionaryCLI.get("PROJECT_NAME")}db
      image: mongo:6.0
      ports:
        - "${DictionaryCLI.get("DATABASE_PORT")}:27017"
      volumes:
        - ${DictionaryCLI.get("PROJECT_NAME")}-db-data:/data/db
      networks:
        - ${DictionaryCLI.get("PROJECT_NAME")}-network
      restart: unless-stopped
      healthcheck:
        test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
        interval: 10s
        timeout: 5s
        retries: 5
`;
  }

  public auxGenerate(): string {
    switch (DictionaryCLI.get("DATABASE_TYPE").toLowerCase()) {
      case "postgres":
        return this.generatePostgress();
      case "mongo":
        return this.generateMongo();
      default:
        throw new Error(`Database type "${DictionaryCLI.get("DATABASE_TYPE")}" not supported.`);
    }
  }
}
