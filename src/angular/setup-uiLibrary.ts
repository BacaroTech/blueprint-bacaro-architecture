import { execSync } from "child_process";
import * as fs from 'fs';
import path from "path";
import * as logger from 'winston';
import { DictionaryCLI } from "../utils/dictionary-cli";
import { MessageCLI } from "../utils/message-cli";

export class SetupUiLibrary {
    // Setup UI library (only Bootstrap for now)
    public static setupUiLibrary(frontendPath: string, projectName: string): void {
        logger.info('*********** FE ui library generation *************')
        if (DictionaryCLI.get('ENABLE_UI_LIBRARY') === 'false') {
            logger.info(MessageCLI.messagePhaseSkip)
        } else {
            if (DictionaryCLI.get("UI_LIBRARY") === 'bootstrap') {
                this.setupBootstrap(frontendPath, projectName);
            } else {
                logger.warn(`Unsupported UI library: ${DictionaryCLI.get("UI_LIBRARY")}`);
            }
        }

    }

    private static setupBootstrap(frontendPath: string, projectName: string): void {
        logger.info('Installing and configuring Bootstrap...');
        execSync(`npm install bootstrap @popperjs/core`, { cwd: frontendPath, stdio: 'inherit' });

        // Update angular.json
        const angularJsonPath = path.join(frontendPath, 'angular.json');
        const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

        const projectKey = projectName;
        if (!angularJson.projects[projectKey]) {
            logger.error(`Project "${projectKey}" not found in angular.json`);
            throw new Error(`Project "${projectKey}" not found in angular.json`);
        }

        // Add Bootstrap CSS to styles array
        const stylesArray = angularJson.projects[projectKey].architect.build.options.styles;
        if (!stylesArray.includes('node_modules/bootstrap/dist/css/bootstrap.min.css')) {
            stylesArray.push('node_modules/bootstrap/dist/css/bootstrap.min.css');
        }

        // Add Bootstrap JS to scripts array
        if (!angularJson.projects[projectKey].architect.build.options.scripts) {
            angularJson.projects[projectKey].architect.build.options.scripts = [];
        }
        const scriptsArray = angularJson.projects[projectKey].architect.build.options.scripts;
        if (!scriptsArray.includes('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js')) {
            scriptsArray.push('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js');
        }

        fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

        // Update styles.scss
        const stylesPath = path.join(frontendPath, 'src', 'styles.scss');
        fs.writeFileSync(stylesPath, `@import "bootstrap/dist/css/bootstrap.min.css";\n`);

        // Replace default Angular page with Bootstrap page
        const appComponentHtmlPath = path.join(frontendPath, 'src', 'app', 'app.component.html');
        const bootstrapPage = `
<div class="container text-center mt-5">
  <h1 class="display-4 text-primary">Welcome to ${projectName}</h1>
  <p class="lead text-muted">This is a custom page built with Bootstrap!</p>
  <button class="btn btn-primary btn-lg mt-3">Get Started</button>
</div>

<div class="container mt-5">
  <h2>Test API node</h2>
  @if (loading) {
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  }
  @if (error) {
    <div class="alert alert-danger">{{ error }}</div>
  }
  @if (data) {
    <pre class="bg-light p-3 rounded">{{ data | json }}</pre>
  }
</div>

<router-outlet />`;
        fs.writeFileSync(appComponentHtmlPath, bootstrapPage);

        logger.info('Bootstrap UI setup complete.');
    }
}