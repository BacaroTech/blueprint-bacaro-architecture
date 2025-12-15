import { BaseCLI } from "./base-cli";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import logger from 'winston';
import { DatabaseCLI } from "./database-cli";

dotenv.config();

export class DockerCLI extends BaseCLI {
  private readonly projectRoot: string;
  private readonly PROJECT_NAME_TOLOWER: string = this.PROJECT_NAME.toLocaleLowerCase() ?? '';
  private databaseCLI: DatabaseCLI; 

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;

    this.databaseCLI = new DatabaseCLI(this.projectRoot); 
  }

  private generateHead(): string {
    return `services:`;
  }

  private generateBackendService(): string {
    return `
  ${this.PROJECT_NAME_TOLOWER}-be:
    build:
      context: ./${this.PROJECT_NAME}BE
    ports:
      - "${this.BACKEND_PORT}:${this.BACKEND_PORT}"
    volumes:
      - "./${this.PROJECT_NAME}BE/node_modules:/app/node_modules"
      - "./${this.PROJECT_NAME}BE:/app"
    networks:
      - ${this.PROJECT_NAME_TOLOWER}-network
    restart: unless-stopped`;
  }

  private generateVolumes(): string {
    return `
volumes:
  ${this.PROJECT_NAME_TOLOWER}-db-data:`;
  }

  private generateNetwork(): string {
    return `
networks:
  ${this.PROJECT_NAME_TOLOWER}-network:
    driver: bridge`;
  }

  private generateDockerFileBE(){
    return `
# Build Phase (TypeScript -> JavaScript)
FROM node:18 AS builder

WORKDIR /app

# Copy package.json first to take advantage of Docker cache
COPY package*.json ./

# Install all dependencies (dev + prod)
RUN npm install

# Copy the rest of the code
COPY . .

# Compile TypeScript
RUN npm run build


# Final image step (JS code only)
FROM node:18 AS runner

WORKDIR /app

# Copy only what is needed at runtime
COPY package*.json ./

# Install only *production* dependencies
RUN npm install --omit=dev

# Copy the compiled files
COPY --from=builder /app/dist ./dist

# Copy environment file
COPY .env .env

# Exposes the backend port
EXPOSE 4000

# Final command
CMD ["node", "dist/index.js"]
`
  }

  private writeDockerCompose(){
    try {
      const dockerComposePath = path.join(this.projectRoot, 'docker-compose.yml');

      const content = [
        this.generateHead(),
        this.databaseCLI.auxGenerate(),
        this.generateBackendService(),
        this.generateVolumes(),
        this.generateNetwork()
      ].join('\n');

      fs.writeFileSync(dockerComposePath, content);
      logger.info(`Dockerfile generated at ${dockerComposePath}`);
    } catch (error: any) {
      logger.error(`Failed to generate docker-compose.yml: ${error.message || error}`);
    }
  }

  private writeDockerFile(){
    try {
      const dockerFilePath = path.join(this.projectRoot + '/' + this.PROJECT_NAME + 'BE', 'Dockerfile');
      fs.writeFileSync(dockerFilePath, this.generateDockerFileBE());
      logger.info(`docker-compose.yml generated at ${dockerFilePath}`);
    } catch (error: any) {
      logger.error(`Failed to generate docker-compose.yml: ${error.message || error}`);
    }
  }

  public generate(): void {
    this.writeDockerFile();
    this.writeDockerCompose();
  }
}
