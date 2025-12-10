import { BackendCLI } from "./backend-cli";
import { DatabaseCLI } from "./database-cli";
import { DockerCLI } from "./docker-cli";
import { FrontendCLI } from "./frontend-cli";
import { ReadMeCLI } from "./readme-cli";

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { program } from 'commander';
import logger from 'winston';

dotenv.config();

class BacaroCLI {
  private PROJECT_NAME: string;

  constructor(){
    // load values from .env file
    this.PROJECT_NAME = process.env.PROJECT_NAME ?? "";
  }

  // Ottieni il path Desktop in base al sistema operativo
  private getDesktopPath(): string {
    if (process.platform === 'win32') {
      return path.join(process.env.USERPROFILE || '', 'Desktop');
    } else {
      return path.join(process.env.HOME || '', 'Desktop');
    }
  }

  public main() {
    program
      .version('1.0.0')
      .option('-n, --name <projectName>', 'Project name (overrides .env)')
      .action((opts) => {
        // Usa il nome progetto passato da CLI oppure da .env
        const projectName = opts.name || this.PROJECT_NAME;
        if (!projectName) {
          logger.error('Project name is required! Set it in the .env file or pass it via CLI with -n.');
          process.exit(1);
        }

        const projectNameFE = `${projectName}FE`;
        const projectNameBE = `${projectName}BE`;

        const projectRoot = path.join(this.getDesktopPath(), projectName);

        try {
          // Se la cartella esiste, cancellala
          if (fs.existsSync(projectRoot)) {
            logger.info(`Found existing project folder at ${projectRoot}. Deleting it...`);
            fs.rmSync(projectRoot, { recursive: true, force: true });
            logger.info('Existing project folder deleted.');
          }

          // Creazione cartelle progetto
          fs.mkdirSync(projectRoot, { recursive: true });
          const frontendPath = path.join(projectRoot, projectNameFE);
          const backendPath = path.join(projectRoot, projectNameBE);
          fs.mkdirSync(frontendPath, { recursive: true });
          fs.mkdirSync(backendPath, { recursive: true });

          logger.info("*********** SET PROJECT PATH *************");
          logger.info(`Creating project: ${projectName}`);
          logger.info(`Project Root: ${projectRoot}`);
          logger.info(`Frontend Path: ${frontendPath}`);
          logger.info(`Backend Path: ${backendPath}`);

          // Generazione frontend
          const frontendCLI = new FrontendCLI(projectNameFE, projectRoot, frontendPath);
          frontendCLI.generate();

          // Generazione backend
          const backendCLI = new BackendCLI(projectNameBE, projectRoot, backendPath);
          backendCLI.generate();

          // Generazione docker-compose.yml + database
          const dockerCLI = new DockerCLI(projectRoot);
          dockerCLI.generate();

          // Generazione README.md
          const readMeCLI = new ReadMeCLI(projectRoot);
          readMeCLI.generate();

          logger.info(`${projectName} setup complete!`);
        } catch (error: any) {
          logger.error('Error during project setup:', error.message || error);
          process.exit(1);
        }
      });

    program.parse(process.argv);
  }
}

const bacaroCli = new BacaroCLI();
bacaroCli.main();