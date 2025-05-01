import { BackendCLI } from "./backend-cli";
import { DatabaseCLI } from "./database-cli";
import { DockerCLI } from "./docker-cli";
import { FrontendCLI } from "./frontend-cli";
import { ReadMeCLI } from "./readme-cli";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { program } = require('commander');

dotenv.config();

// load values from .env file
const projectNameFromEnv = process.env.PROJECT_NAME;

class BacaroCLI{
  // Get the desktop path based on the OS
  private getDesktopPath(){
    if (process.platform === 'win32') {
      // On Windows, the Desktop folder is under USERPROFILE
      return path.join(process.env.USERPROFILE, 'Desktop');
    } else {
      // On Unix-based systems, Desktop is under HOME
      return path.join(process.env.HOME, 'Desktop');
    }
  };

  public main(){
    program
      .version('1.0.0')
      .action(() => {
        if (!projectNameFromEnv) {
          console.error('Project name is required! Set it in the .env file or as a command-line argument.');
          process.exit(1);
        }

        // Append FE and BE to the final project name
        const projectNameFE = `${projectNameFromEnv}FE`;
        const projectNameBE = `${projectNameFromEnv}BE`;

        // Set the project root directory to the Desktop
        const projectRoot = path.join(this.getDesktopPath(), projectNameFromEnv);

        // Check if folder exists and delete it
        if (fs.existsSync(projectRoot)) {
          console.log(`Found existing project folder at ${projectRoot}. Deleting it...`);
          fs.rmSync(projectRoot, { recursive: true, force: true });
          console.log('Existing project folder deleted.');
        }

        // Set the project name for FE and BE
        const frontendPath = path.join(projectRoot, projectNameFE);
        const backendPath = path.join(projectRoot, projectNameBE);

        // Set project path
        console.log("*********** SET PROJECT PATH *************")
        console.log(`Creating project: ${projectNameFromEnv}`);
        console.log(`Project Root: ${projectRoot}`);
        console.log(`Frontend Path: ${frontendPath}`);
        console.log(`Backend Path: ${backendPath}`);

        // Create project directories
        fs.mkdirSync(projectRoot, { recursive: true });
        fs.mkdirSync(frontendPath, { recursive: true });
        fs.mkdirSync(backendPath, { recursive: true });

        // Generate Frontend
        const frontendCLI: FrontendCLI = new FrontendCLI(projectNameFE, projectRoot, frontendPath);
        frontendCLI.generate();

        // Generate Database
        const databaseCLI: DatabaseCLI = new DatabaseCLI(projectRoot);
        databaseCLI.generate();

        // Generate Backend
        const backendCLI: BackendCLI = new BackendCLI(projectRoot, backendPath);
        backendCLI.generate();

        // Generate Docker Compose file
        const dockerCLI: DockerCLI = new DockerCLI();
        dockerCLI.generate();

        // Generate README.md
        const readMeCLI: ReadMeCLI = new ReadMeCLI(projectRoot);
        readMeCLI.generate();

        console.log(`${projectNameFromEnv} setup complete!`);
      });

    program.parse();
  }
}

let bacaroCli: BacaroCLI = new BacaroCLI()
bacaroCli.main();