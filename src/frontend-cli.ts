import { BaseCLI } from "./base-cli";

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

// load values from .env file
const projectNameFromEnv = process.env.PROJECT_NAME;
const uiLibraryFromEnv = process.env.UI_LIBRARY;
const frontendPort = process.env.FRONTEND_PORT;
const angularVersion = process.env.ANGULAR_VERSION;
const backendPort = process.env.BACKEND_PORT;

export class FrontendCLI extends BaseCLI{
  private frontendPath: string = "";
  private angularCommand: string = "";
  private projectNameFE: string = "";
  private projectRoot: string = "";

  public constructor(projectNameFE: string, projectRoot: string, frontendPath:string){
    super();
    this.projectNameFE = projectNameFE;
    this.projectRoot = projectRoot;
    this.frontendPath = frontendPath;
  }

  private updateEnvironmentFiles(): void {
    const environmentsDir = path.join(this.frontendPath, 'src', 'environments');
    
    if (!fs.existsSync(environmentsDir)) {
      fs.mkdirSync(environmentsDir, { recursive: true });
    }
  
    const envPath = path.join(environmentsDir, 'environment.ts');
    const envContent = `
export const environment = {
  production: false,
  logging: {
    level: 'debug'
  }
};`.trim();
    fs.writeFileSync(envPath, envContent);
  
    const envProdPath = path.join(environmentsDir, 'environment.prod.ts');
    const envProdContent = `
export const environment = {
  production: true,
  logging: {
    level: 'info'
  }
};`.trim();
    fs.writeFileSync(envProdPath, envProdContent);
  }  

  private updateAppComponent(): void {
    const appComponentPath = path.join(this.frontendPath, 'src', 'app', 'app.component.ts');
    const appComponentContent = `
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '${this.projectNameFE}';
  data: any;
  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    
    this.http.get('http://localhost:${backendPort}').subscribe({
      next: (response) => {
        this.data = response;
        this.loading = false;
        console.log('Successfully fetched data from backend', response);
      },
      error: (err) => {
        this.error = 'API Error';
        this.loading = false;
        console.error('Failed to fetch data from backend', err);
      },
    });
  }
}`.trim();
    fs.writeFileSync(appComponentPath, appComponentContent);
  }

  private updateAppModule(): void {
    const appModulePath = path.join(this.frontendPath, 'src', 'app', 'app.module.ts');
    const appModuleContent = `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { ErrorHandlerService } from './services/error-handler.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }`.trim();
    fs.writeFileSync(appModulePath, appModuleContent);
  }

  private setupErrorHandler(): void {
    const errorHandlerPath = path.join(this.frontendPath, 'src', 'app', 'services', 'error-handler.service.ts');
    const errorHandlerContent = `
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {

  handleError(error: any): void {
    console.error('Global error handler', error);
    // You can add more error handling logic here
  }
}`.trim();
    fs.writeFileSync(errorHandlerPath, errorHandlerContent);

    // Update app.module.ts to use the error handler
    const appModulePath = path.join(this.frontendPath, 'src', 'app', 'app.module.ts');
    let appModuleContent = fs.readFileSync(appModulePath, 'utf8');
    appModuleContent = appModuleContent.replace(
      `import { NgModule } from '@angular/core';`,
      `import { NgModule, ErrorHandler } from '@angular/core';`
    );
    appModuleContent = appModuleContent.replace(
      `providers: [`,
      `providers: [
    { provide: ErrorHandler, useClass: ErrorHandlerService },`
    );
    fs.writeFileSync(appModulePath, appModuleContent);
  }

  private setupHttpInterceptor(): void {
    const interceptorPath = path.join(this.frontendPath, 'src', 'app', 'services', 'http-interceptor.service.ts');
    const interceptorContent = `
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    console.debug(\`HTTP \${request.method} \${request.url}\`);

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const elapsed = Date.now() - startTime;
            console.debug(
              \`HTTP \${request.method} \${request.url} - \${event.status} (\${elapsed}ms)\`
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          const elapsed = Date.now() - startTime;
          console.error(
            \`HTTP \${request.method} \${request.url} - \${error.status} (\${elapsed}ms)\`,
            error.message
          );
        }
      })
    );
  }
}`.trim();
    fs.writeFileSync(interceptorPath, interceptorContent);

    // Update app.module.ts to use the interceptor
    const appModulePath = path.join(this.frontendPath, 'src', 'app', 'app.module.ts');
    let appModuleContent = fs.readFileSync(appModulePath, 'utf8');
    appModuleContent = appModuleContent.replace(
      `import { HttpClientModule } from '@angular/common/http';`,
      `import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';`
    );
    appModuleContent = appModuleContent.replace(
      `providers: [`,
      `providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },`
    );
    fs.writeFileSync(appModulePath, appModuleContent);
  }

  //TODO because not working
  private setTailwind(){
    logger.info('Installing and configuring Tailwind CSS...');

    // Step 1: Install Tailwind CSS and its dependencies
    try {
      execSync(`npm install -D tailwindcss postcss autoprefixer winston @types/winston`, { cwd: this.frontendPath, stdio: 'inherit' });
    } catch (error: any) {
      logger.error('Failed to install Tailwind CSS dependencies. Please check your npm setup.');
      logger.error('Error details:', error.message);
      process.exit(1);
    }

    // Step 2: Initialize Tailwind CSS
    try {
      execSync(`npx tailwindcss init`, { cwd: this.frontendPath, stdio: 'inherit' });
    } catch (error: any) {
      logger.error('Failed to initialize Tailwind CSS. Please check your npm and npx setup.');
      logger.error('Error details:', error.message);
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
    fs.writeFileSync(path.join(this.frontendPath, 'tailwind.config.js'), tailwindConfig);

    // Step 4: Create postcss.config.js
    const postcssConfig = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    fs.writeFileSync(path.join(this.frontendPath, 'postcss.config.js'), postcssConfig);

    // Step 5: Update styles.scss to include Tailwind CSS directives
    const stylesPath = path.join(this.frontendPath, 'src', 'styles.scss');
    const stylesContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
    fs.writeFileSync(stylesPath, stylesContent);

    // Step 6: Replace the default Angular page with a custom Tailwind page
    const appComponentHtmlPath = path.join(this.frontendPath, 'src', 'app', 'app.component.html');
    const customTailwindPage = `
<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
  <h1 class="text-4xl font-bold text-blue-600 mb-4">Welcome to ${projectNameFromEnv}</h1>
  <p class="text-lg text-gray-700">This is a custom page built with Tailwind CSS!</p>
  <button class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
    Get Started
  </button>
</div>

<div>
  <h2>Test API node</h2>
  <div *ngIf="loading">Loading...</div>
  <div *ngIf="error">{{ error }}</div>
  <pre>{{ data | json }}</pre>
</div>
    `;
    fs.writeFileSync(appComponentHtmlPath, customTailwindPage);

    logger.info('Tailwind CSS setup completed successfully!');
  };

  //Set Bootstrap as UI library!
  private setBootstrap(){
    logger.info('Installing and configuring Bootstrap...');
  
    // Step 1: Install Bootstrap and its dependencies
    try {
      execSync(`npm install bootstrap @ng-bootstrap/ng-bootstrap winston @types/winston`, { cwd: this.frontendPath, stdio: 'inherit' });
    } catch (error: any) {
      logger.error('Failed to install Bootstrap dependencies. Please check your npm setup.');
      logger.error('Error details:', error.message);
      process.exit(1);
    }
  
    // Step 2: Update angular.json to include Bootstrap styles
    const angularJsonPath = path.join(this.frontendPath, 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  
    // Add Bootstrap CSS to the styles array
    if (!angularJson.projects[projectNameFromEnv + 'FE']) {
      logger.error('Project name mismatch in angular.json');
      process.exit(1);
    }    

    angularJson.projects[projectNameFromEnv + 'FE'].architect.build.options.styles.push(
      'node_modules/bootstrap/dist/css/bootstrap.min.css'
    );
  
    // Write the updated angular.json file
    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
  
    // Step 3: Update styles.scss to include Bootstrap (optional)
    const stylesPath = path.join(this.frontendPath, 'src', 'styles.scss');
    const stylesContent = `@import "bootstrap/dist/css/bootstrap.min.css";\n`;
    fs.writeFileSync(stylesPath, stylesContent);
  
    // Step 4: Replace the default Angular page with a custom Bootstrap page
    const appComponentHtmlPath = path.join(this.frontendPath, 'src', 'app', 'app.component.html');
    const customBootstrapPage = `
<div class="container text-center mt-5">
  <h1 class="display-4 text-primary">Welcome to ${projectNameFromEnv}</h1>
  <p class="lead text-muted">This is a custom page built with Bootstrap!</p>
  <button class="btn btn-primary btn-lg mt-3">
    Get Started
  </button>
</div>

<div>
  <h2>Test API node</h2>
  <div *ngIf="loading">Loading...</div>
  <div *ngIf="error">{{ error }}</div>
  <pre>{{ data | json }}</pre>
</div>`;
    fs.writeFileSync(appComponentHtmlPath, customBootstrapPage);
  
    logger.info('Angular Bootstrap setup completed!');
  };

  //Set FE interface UI
  private setFEinterfaceUI(){
    // Check UI_LIBRARY value and modify the Angular CLI command
    this.angularCommand += ' --package-manager npm';
    if (uiLibraryFromEnv === 'tailwind') {
      //TODO FIX NOT WORK
      this.setTailwind();
    } else if (uiLibraryFromEnv === 'bootstrap') {
      this.setBootstrap();
    } else {
      logger.warn(`Unsupported UI library: ${uiLibraryFromEnv}`);
    }
  };

  //generate folder structure
  private generateFolder() {
    const root = path.join(this.projectRoot, this.projectNameFE, 'src', 'app');
    logger.info('Target root:', root);
  
    if (!fs.existsSync(root)) {
      logger.error('Target folder does not exist:', root);
      return;
    }
  
    const folders = ['components', 'services', 'models', 'guards', 'media', 'directives', 'pages'];
  
    folders.forEach(folder => {
      const folderPath = path.join(root, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        logger.info('Created:', folderPath);
      }
    });

    // Create logs directory
    const logsDir = path.join(this.frontendPath, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      logger.info('Created logs directory:', logsDir);
    }
  }

  //Generete FE project 
  public generate(){
    logger.info(`Generating Angular "${angularVersion}" project...\n`);
  
    // Angular CLI command to create a new project with specific version
    this.angularCommand = `npx -y @angular/cli@${angularVersion} new "${this.projectNameFE}" \
      --directory "${this.projectNameFE}" \
      --style=scss \
      --routing \
      --skip-git \
      --skip-install`;
  
    // Execute the Angular CLI command
    execSync(this.angularCommand, { cwd: this.projectRoot, stdio: 'inherit' });
  
    // Install dependencies explicitly (optional but recommended)
    const installCommand = `npm install @angular/core@${angularVersion} @angular/cli@${angularVersion} --legacy-peer-deps`;
    execSync(installCommand, { cwd: path.join(this.projectRoot, this.projectNameFE), stdio: 'inherit' });

    // Install Winston and types
    execSync(`npm install winston @types/winston`, { cwd: this.frontendPath, stdio: 'inherit' });

    // Generate folder structure
    this.generateFolder();
  
    // Set up
    this.updateEnvironmentFiles();
    this.updateAppComponent();
    this.updateAppModule();
    this.setupErrorHandler();
    this.setupHttpInterceptor();
  
    // Rest of your existing code...
    this.setFEinterfaceUI();
  
    const angularJsonPath = path.join(this.frontendPath, 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  
    if (!angularJson.projects[this.projectNameFE].architect) {
      angularJson.projects[this.projectNameFE].architect = {};
    }
    if (!angularJson.projects[this.projectNameFE].architect.serve) {
      angularJson.projects[this.projectNameFE].architect.serve = {};
    }
    if (!angularJson.projects[this.projectNameFE].architect.serve.options) {
      angularJson.projects[this.projectNameFE].architect.serve.options = {};
    }
  
    angularJson.projects[this.projectNameFE].architect.serve.options.port = Number(frontendPort);
  
    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
  
    logger.info(`Angular ${angularVersion} application is running on port ${frontendPort}.`);
  };
}