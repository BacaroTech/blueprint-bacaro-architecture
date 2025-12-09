import { BaseCLI } from "./base-cli";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import logger from 'winston';
import { DatabaseCLI } from "./database-cli";

dotenv.config();

export class DockerCLI extends BaseCLI {
  private readonly projectRoot: string;
  private readonly projectName: string;
  private readonly backendPort: string;
  private databaseCLI: DatabaseCLI; 

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;

    // load values from .env file
    this.projectName = process.env.PROJECT_NAME ?? '';
    this.backendPort = process.env.BACKEND_PORT ?? '';
    this.databaseCLI = new DatabaseCLI(this.projectRoot); 
  }

  private generateHead(): string {
    return `services:`;
  }

  private generateBackendService(): string {
    return `
  ${this.projectName}BE:
    build:
      context: ./${this.projectName}BE
    ports:
      - "${this.backendPort}:${this.backendPort}"
    volumes:
      - "./${this.projectName}BE/node_modules"
      - "./${this.projectName}BE:/app"
    networks:
      - ${this.projectName}-network
    restart: unless-stopped`;
  }

  private generateVolumes(): string {
    return `
volumes:
  ${this.projectName}-db-data:`;
  }

  private generateNetwork(): string {
    return `
networks:
  ${this.projectName}-network:
    driver: bridge`;
  }

  public generate(): void {
    try {
      const dockerComposePath = path.join(this.projectRoot, 'docker-compose.yml');

      const content = [
        this.generateHead(),
        //this.generateAngularService(),
        this.databaseCLI.auxGenerate(),
        this.generateBackendService(),
        this.generateVolumes(),
        this.generateNetwork()
      ].join('\n');

      fs.writeFileSync(dockerComposePath, content);
      logger.info(`docker-compose.yml generated at ${dockerComposePath}`);
    } catch (error: any) {
      logger.error(`Failed to generate docker-compose.yml: ${error.message || error}`);
    }
  }
}
