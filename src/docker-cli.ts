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
# Fase di build (TypeScript -> JavaScript)
FROM node:18 AS builder

WORKDIR /app

# Copia package.json prima per sfruttare cache Docker
COPY package*.json ./

# Installa tutte le dipendenze (dev + prod)
RUN npm install

# Copia il resto del codice
COPY . .

# Compila TypeScript
RUN npm run build


# Fase per l'immagine finale (solo codice JS)
FROM node:18 AS runner

WORKDIR /app

# Copia solo ciò che serve a runtime
COPY package*.json ./

# Installa solo dipendenze *di produzione*
RUN npm install --omit=dev

# Copia i file compilati
COPY --from=builder /app/dist ./dist

# Copia file ambiente se ti serve
COPY .env .env

# Espone la porta del backend
EXPOSE 4000

# Comando finale
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
