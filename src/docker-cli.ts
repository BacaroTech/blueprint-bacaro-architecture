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
  private readonly projectNameBase: string;
  private readonly backendPort: string;
  private databaseCLI: DatabaseCLI; 

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;

    // load values from .env file
    this.projectName = process.env.PROJECT_NAME?.toLocaleLowerCase() ?? '';
    this.projectNameBase = process.env.PROJECT_NAME ?? '';
    this.backendPort = process.env.BACKEND_PORT ?? '';
    this.databaseCLI = new DatabaseCLI(this.projectRoot); 
  }

  private generateHead(): string {
    return `services:`;
  }

  private generateBackendService(): string {
    return `
  ${this.projectName}-be:
    build:
      context: ./${this.projectNameBase}BE
    ports:
      - "${this.backendPort}:${this.backendPort}"
    volumes:
      - "./${this.projectNameBase}BE/node_modules:/app/node_modules"
      - "./${this.projectNameBase}BE:/app"
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
        //this.generateAngularService(),
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
      const dockerFilePath = path.join(this.projectRoot + '/' + this.projectNameBase + 'BE', 'Dockerfile');
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
