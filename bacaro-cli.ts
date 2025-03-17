const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { program } = require('commander');

dotenv.config();

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

const setTailwind = (frontendPath: string, finalProjectName: string) => {
  console.log('Installing and configuring Tailwind CSS...');

  // Step 1: Install Tailwind CSS and its dependencies
  try {
    execSync(`npm install -D tailwindcss postcss autoprefixer`, { cwd: frontendPath, stdio: 'inherit' });
  } catch (error: any) {
    console.error('Failed to install Tailwind CSS dependencies. Please check your npm setup.');
    console.error('Error details:', error.message);
    process.exit(1);
  }

  // Step 2: Initialize Tailwind CSS
  try {
    execSync(`npx tailwindcss init`, { cwd: frontendPath, stdio: 'inherit' });
  } catch (error: any) {
    console.error('Failed to initialize Tailwind CSS. Please check your npm and npx setup.');
    console.error('Error details:', error.message);
    process.exit(1);
  }

  // Step 3: Create or update tailwind.config.js
  const tailwindConfig = `
  module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }`;
  fs.writeFileSync(path.join(frontendPath, 'tailwind.config.js'), tailwindConfig);

  // Step 4: Create postcss.config.js
  const postcssConfig = `
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }`;
  fs.writeFileSync(path.join(frontendPath, 'postcss.config.js'), postcssConfig);

  // Step 5: Update styles.scss to include Tailwind CSS directives
  const stylesPath = path.join(frontendPath, 'src', 'styles.scss');
  const stylesContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
  fs.writeFileSync(stylesPath, stylesContent);

  // Step 6: Replace the default Angular page with a custom Tailwind page
  const appComponentHtmlPath = path.join(frontendPath, 'src', 'app', 'app.component.html');
  const customTailwindPage = `
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <h1 class="text-4xl font-bold text-blue-600 mb-4">Welcome to ${finalProjectName}</h1>
    <p class="text-lg text-gray-700">This is a custom page built with Tailwind CSS!</p>
    <button class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
      Get Started
    </button>
  </div>
  `;
  fs.writeFileSync(appComponentHtmlPath, customTailwindPage);

  // Step 7: Clear the default content in app.component.ts
  const appComponentTsPath = path.join(frontendPath, 'src', 'app', 'app.component.ts');
  const appComponentTsContent = `
  import { Component } from '@angular/core';

  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
  })
  export class AppComponent {}
  `;
  fs.writeFileSync(appComponentTsPath, appComponentTsContent);

  console.log('Tailwind CSS setup completed successfully!');
};

const setBootstrap = (frontendPath: string, finalProjectName: string) => {
  console.log('Installing and configuring Bootstrap...');

  // Step 1: Install Bootstrap and its dependencies
  try {
    execSync(`npm install bootstrap @ng-bootstrap/ng-bootstrap`, { cwd: frontendPath, stdio: 'inherit' });
  } catch (error: any) {
    console.error('Failed to install Bootstrap dependencies. Please check your npm setup.');
    console.error('Error details:', error.message);
    process.exit(1);
  }

  // Step 2: Update angular.json to include Bootstrap styles
  const angularJsonPath = path.join(frontendPath, 'angular.json');
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

  // Add Bootstrap CSS to the styles array
  angularJson.projects[finalProjectName + 'FE'].architect.build.options.styles.push(
    'node_modules/bootstrap/dist/css/bootstrap.min.css'
  );

  // Write the updated angular.json file
  fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

  // Step 3: Update styles.scss to include Bootstrap (optional)
  const stylesPath = path.join(frontendPath, 'src', 'styles.scss');
  const stylesContent = `@import "bootstrap/dist/css/bootstrap.min.css";\n`;
  fs.writeFileSync(stylesPath, stylesContent);

  // Step 4: Replace the default Angular page with a custom Bootstrap page
  const appComponentHtmlPath = path.join(frontendPath, 'src', 'app', 'app.component.html');
  const customBootstrapPage = `
  <div class="container text-center mt-5">
    <h1 class="display-4 text-primary">Welcome to ${finalProjectName}</h1>
    <p class="lead text-muted">This is a custom page built with Bootstrap!</p>
    <button class="btn btn-primary btn-lg mt-3">
      Get Started
    </button>
  </div>
  `;
  fs.writeFileSync(appComponentHtmlPath, customBootstrapPage);

  // Step 5: Clear the default content in app.component.ts
  const appComponentTsPath = path.join(frontendPath, 'src', 'app', 'app.component.ts');
  const appComponentTsContent = `
  import { Component } from '@angular/core';

  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
  })
  export class AppComponent {}
  `;
  fs.writeFileSync(appComponentTsPath, appComponentTsContent);

  console.log('Bootstrap setup completed successfully!');
};

const setFEinterfaceUI = (angularCommand: string, frontendPath: string, finalProjectName: string) => {
  // Check UILIBRARY value and modify the Angular CLI command
  if (uiLibraryFromEnv === 'tailwind') {
    angularCommand += ' --package-manager npm'; // Add Tailwind CSS setup
    console.log('Adding Tailwind CSS to the Angular project...');
    setTailwind(frontendPath, finalProjectName);
  } else if (uiLibraryFromEnv === 'bootstrap') {
    angularCommand += ' --package-manager npm'; // Add Bootstrap setup
    console.log('Adding Bootstrap to the Angular project...');
    setBootstrap(frontendPath, finalProjectName);
  } else {
    console.log('No UI library selected. Skipping UI setup.');
  }
};

// Make sure process.env.PROJECTNAME is used properly
const projectNameFromEnv = process.env.PROJECTNAME;
const uiLibraryFromEnv = process.env.UILIBRARY; // Get UILIBRARY from .env

program
  .version('1.0.0')
  .argument('[PROJECTNAME]', 'Name of the project')
  .action((projectName: string) => {
    // Use the PROJECTNAME from the .env file if not provided via command line argument
    const finalProjectName = projectName || projectNameFromEnv;

    if (!finalProjectName) {
      console.error('Project name is required! Set it in the .env file or as a command-line argument.');
      process.exit(1);
    }

    // Append FE and BE to the final project name
    const projectNameFE = `${finalProjectName}FE`;
    const projectNameBE = `${finalProjectName}BE`;

    // Set the project root directory to the Desktop (no extra paths)
    const projectRoot = path.join(getDesktopPath(), finalProjectName);
    const frontendPath = path.join(projectRoot, projectNameFE);
    const backendPath = path.join(projectRoot, projectNameBE);

    console.log(`Creating project: ${finalProjectName}\n`);
    console.log(`Project Root: ${projectRoot}`);
    console.log(`Frontend Path: ${frontendPath}`);
    console.log(`Backend Path: ${backendPath}`);

    // Create project directories
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.mkdirSync(frontendPath, { recursive: true });
    fs.mkdirSync(backendPath, { recursive: true });

    // Generate Angular frontend with optional UI library
    console.log(`Generating Angular project...\n`);

    let angularCommand = `npx -y @angular/cli new "${projectNameFE}" --directory "${projectNameFE}" --style=scss --routing`;

    // Execute the Angular CLI command
    execSync(angularCommand, { cwd: projectRoot, stdio: 'inherit' });

    // Set up the UI library
    setFEinterfaceUI(angularCommand, frontendPath, finalProjectName);

    // Generate Node.js backend
    console.log('Setting up Express backend...');
    execSync(`npm init -y`, { cwd: backendPath, stdio: 'inherit' });
    execSync(`npm install express dotenv pg cors`, { cwd: backendPath, stdio: 'inherit' });

    // Create basic Express server
    const serverCode = `...`;  // Keep the server code as is
    fs.writeFileSync(path.join(backendPath, 'index.js'), serverCode);

    // Create .env file
    fs.writeFileSync(path.join(projectRoot, '.env'), `DATABASE_URL=postgres://user:password@db:5432/mydatabase\nPORT=3000\n`);

    // Create Docker Compose file
    const dockerCompose = `...`;  // Keep the Docker compose code as is
    fs.writeFileSync(path.join(projectRoot, 'docker-compose.yml'), dockerCompose);

    console.log(`${finalProjectName} setup complete!`);
  });

program.parse();