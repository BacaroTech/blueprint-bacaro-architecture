import { BaseCLI } from "./base-cli";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import logger from 'winston';

dotenv.config();

export class DockerCLI extends BaseCLI {
  private projectRoot: string;
  private projectName: string;
  private frontendPort: string;
  private backendPort: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;

    // load values from .env file
    this.projectName = process.env.PROJECT_NAME || 'myProject';
    this.frontendPort = process.env.FRONTEND_PORT || '4200';
    this.backendPort = process.env.BACKEND_PORT || '3000';
  }

  private generateHead(): string {
    return `version: '3.8'

services:`;
  }

  private generateAngularService(): string {
    return `
  ${this.projectName}FE:
    build:
      context: ./${this.projectName}FE
    ports:
      - "${this.frontendPort}:${this.frontendPort}"
    volumes:
      - "./${this.projectName}FE/app/node_modules"
      - "./${this.projectName}FE:/app"
    networks:
      - ${this.projectName}-network
    restart: unless-stopped`;
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
        this.generateAngularService(),
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
