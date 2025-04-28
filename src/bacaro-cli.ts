import { generateBackendProject } from "./backend-cli";
import { generateDatabase } from "./database-cli";
import { generateDockerComposeFile } from "./docker-cli";
import { generateFeProject } from "./frontend-cli";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { program } = require('commander');

dotenv.config();

// load values from .env file
const projectNameFromEnv = process.env.PROJECTNAME;

// Get the desktop path based on the OS
const getDesktopPath = () => {
  if (process.platform === 'win32') {
    // On Windows, the Desktop folder is under USERPROFILE
    return path.join(process.env.USERPROFILE, 'Desktop');
  } else {
    // On Unix-based systems, Desktop is under HOME
    return path.join(process.env.HOME, 'Desktop');
  }
};

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
    const projectRoot = path.join(getDesktopPath(), projectNameFromEnv);

    // Check if folder exists and delete it
    if (fs.existsSync(projectRoot)) {
      console.log(`Found existing project folder at ${projectRoot}. Deleting it...`);
      fs.rmSync(projectRoot, { recursive: true, force: true });
      console.log('Existing project folder deleted.');
    }

    // Set the project name for FE and BE
    const frontendPath = path.join(projectRoot, projectNameFE);
    const backendPath = path.join(projectRoot, projectNameBE);

    console.log(`Creating project: ${projectNameFromEnv}\n`);
    console.log(`Project Root: ${projectRoot}`);
    console.log(`Frontend Path: ${frontendPath}`);
    console.log(`Backend Path: ${backendPath}`);

    // Create project directories
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.mkdirSync(frontendPath, { recursive: true });
    fs.mkdirSync(backendPath, { recursive: true });

    // Generate Angular frontend with optional UI library from .env file
    generateFeProject(projectNameFE, projectRoot, frontendPath, projectNameFromEnv);

    // Generate Database
    generateDatabase()

    // Generate Node.js backend
    generateBackendProject(projectNameBE, backendPath);

    // Generate Docker Compose file
    generateDockerComposeFile(projectRoot, projectNameFromEnv.toLocaleLowerCase());

    console.log(`${projectNameFromEnv} setup complete!`);
  });

program.parse();