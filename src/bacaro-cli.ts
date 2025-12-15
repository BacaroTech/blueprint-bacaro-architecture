import { DockerCLI } from "./docker-cli";
import { FrontendCLI } from "./frontend-cli";
import { ReadMeCLI } from "./readme-cli";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { program } from 'commander';
import logger from 'winston';
import { BackendCLI } from "./backend-cli";
import { DictionaryCLI } from "./dictionary-cli" 

dotenv.config();

/**
 * TODO
 * - disabled generate section
 * - improve comments in logger
 * - improve all comments' methods 
 */

class BacaroCLI extends DictionaryCLI {
  constructor(){
    super();
  }

  /**
  * Get the Desktop path based on your operating system
  * @returns Join all arguments together and normalize the resulting pat
  */
  private getDesktopPath(): string {
    if (process.platform === 'win32') {
      return path.join(this.USER_PROFILE || '', 'Desktop');
    } else {
      return path.join(this.HOME || '', 'Desktop');
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
        const projectName = opts.name || this.PROJECT_NAME;
        if (!projectName) {
          logger.error('Project name is required! Set it in the .env file or pass it via CLI with -n.');
          process.exit(1);
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
          const frontendPath = path.join(projectRoot, projectNameFE);
          const backendPath = path.join(projectRoot, projectNameBE);
          fs.mkdirSync(frontendPath, { recursive: true });
          fs.mkdirSync(backendPath, { recursive: true });

          logger.info("*********** SET PROJECT PATH *************");
          logger.info(`Creating project: ${projectName}`);
          logger.info(`Project Root: ${projectRoot}`);
          logger.info(`Frontend Path: ${frontendPath}`);
          logger.info(`Backend Path: ${backendPath}`);

          // Frontend generation
          logger.info("*********** Frontend generation *************");
          const frontendCLI = new FrontendCLI(projectNameFE, projectRoot, frontendPath);
          frontendCLI.generate();

          // Backend generation
          logger.info("*********** Backend generation *************");
          const backendCLI = new BackendCLI(projectNameBE, projectRoot, backendPath);
          backendCLI.generate();

          // Generate Docker-compose.yml + Database
          logger.info("*********** Generate Docker-compose.yml + Database *************");
          const dockerCLI = new DockerCLI(projectRoot);
          dockerCLI.generate();

          // Generating README.md
          logger.info("*********** Generating README.md *************");
          const readMeCLI = new ReadMeCLI(projectRoot);
          readMeCLI.generate();

          logger.info("*********** Setup completed *************");
          logger.info(`${projectName} setup completed!`);
        } catch (error: any) {
          logger.error('Error during project setup:', error.message || error);
          process.exit(1);
        }
      });

    program.parse(process.argv);
  }
}

// Execute CLI and enjoy :)
const bacaroCli = new BacaroCLI();
bacaroCli.main();