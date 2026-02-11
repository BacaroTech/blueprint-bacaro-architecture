import { program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import logger from 'winston';
import { BackendCLI } from "./backend-cli";
import { DictionaryCLI } from "./utils/dictionary-cli";
import { DockerCLI } from "./docker-cli";
import { FrontendCLI } from "./angular/frontend-cli";
import { ReadMeCLI } from "./readme-cli";
import { MessageCLI } from './utils/message-cli';

dotenv.config();

class BacaroCLI {

  constructor() {
  }

  /**
  * Get the Desktop path based on your operating system
  * @returns Join all arguments together and normalize the resulting pat
  */
  private getDesktopPath(): string {
    if (process.platform === 'win32') {
      return path.join(DictionaryCLI.get("USER_PROFILE") || '', 'Desktop');
    } else {
      return path.join(DictionaryCLI.get("HOME") || '', 'Desktop');
    }
  }

  /**
   * Orchestrator of the cli
   */
  public main(): void {

    program
      .version('1.0.0')
      .option('-n, --name <projectName>', 'Project name (overrides .env)')
      .action((opts) => {
        // Use the project name passed from CLI or .env file
        const projectName = opts.name || DictionaryCLI.get("PROJECT_NAME");
        if (!projectName) {
          logger.error('Project name is required! Set it in the .env file or pass it via CLI with -n.');
          throw new Error();
        }

        const projectNameFE: string = `${projectName}FE`;
        const projectNameBE: string = `${projectName}BE`;
        const projectRoot = path.join(this.getDesktopPath(), projectName);

        try {
          // If the folder exists, delete it
          if (fs.existsSync(projectRoot)) {
            logger.info(`Found existing project folder at ${projectRoot}. Deleting it...`);
            fs.rmSync(projectRoot, { recursive: true, force: true });
            logger.info('Existing project folder deleted.');
          }

          // Creating project folders
          fs.mkdirSync(projectRoot, { recursive: true });          

          logger.info("*********** SET PROJECT PATH *************");
          logger.info(`Creating project: ${projectName}`);
          logger.info(`Project Root: ${projectRoot}`);

          // Frontend generation
          logger.info("*********** Frontend generation *************");
          if (DictionaryCLI.get("ENABLE_GENERATE_FRONTEND") === 'true') {
            const frontendPath = path.join(projectRoot, projectNameFE);
            fs.mkdirSync(frontendPath, { recursive: true });
            logger.info(`Frontend Path: ${frontendPath}`);
            const frontendCLI = new FrontendCLI(projectNameFE, projectRoot, frontendPath);
            frontendCLI.generate();
          }
          else
            logger.info(MessageCLI.messagePhaseSkip)

          // Backend generation
          logger.info("*********** Backend generation *************");
          if (DictionaryCLI.get("ENABLE_GENERATE_BACKEND") === 'true'){
            const backendPath = path.join(projectRoot, projectNameBE);
            fs.mkdirSync(backendPath, { recursive: true });
            logger.info(`Backend Path: ${backendPath}`);
            const backendCLI = new BackendCLI(projectNameBE, projectRoot, backendPath);
            backendCLI.generate();
          }else
            logger.info(MessageCLI.messagePhaseSkip)

          // Generate Docker-compose.yml + Database
          logger.info("*********** Generate Docker-compose.yml + Database *************");
          const dockerCLI = new DockerCLI(projectRoot);
          if (DictionaryCLI.get("ENABLE_GENERATE_DOCKER") === 'true')
            dockerCLI.generate();
          else
            logger.info(MessageCLI.messagePhaseSkip)

          // Generating README.md
          logger.info("*********** Generating README.md *************");
          const readMeCLI = new ReadMeCLI(projectRoot);
          if (DictionaryCLI.get("ENABLE_GENERATE_README") === 'true')
            readMeCLI.generate();
          else
            logger.info(MessageCLI.messagePhaseSkip)

          logger.info("*********** Setup completed *************");
          logger.info(`${projectName} setup completed!`);
        } catch (error: any) {
          logger.error('Error during project setup:\n', error);
          process.exit(1);
        }
      });

    program.parse(process.argv);
  }
}

// Execute CLI and enjoy :)
const bacaroCli = new BacaroCLI();
bacaroCli.main();