import { BaseCLI } from "../base-cli";
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as logger from 'winston';
import { DictionaryCLI } from "../dictionary-cli";

export class FrontendCLI extends BaseCLI {
  private readonly projectName: string;
  private readonly projectRoot: string;
  private readonly frontendPath: string;
  private readonly angularCommand: string;

  public constructor(projectName: string, projectRoot: string, frontendPath: string) {
    super();
    this.projectName = projectName;
    this.projectRoot = projectRoot;
    this.frontendPath = frontendPath;

    this.angularCommand = `npx -y @angular/cli@${DictionaryCLI.get("ANGULAR_VERSION")} new "${this.projectName}" \
      --directory "${this.projectName}" \
      --style=scss \
      --routing \
      --skip-git \
      --standalone`;
  }

  // Generate the entire frontend application
  public generate(): void {
    logger.info(`Generating Angular project "${this.projectName}" with version ${DictionaryCLI.get("ANGULAR_VERSION")}...`);

    this.generateAngularProject();
    this.installDependencies();
    this.createFolderStructure();
    this.updateEnvironmentFiles();
    this.updateAppFiles();
    this.setupErrorHandling();
    this.setupHttpInterceptor();
    this.setupUiLibrary();
    this.updateAngularJson();

    logger.info(`Angular project "${this.projectName}" is configured and running on port ${DictionaryCLI.get("FRONTEND_PORT")}.`);
  }

  // Create Angular project (standalone by default in Angular 19)
  private generateAngularProject(): void {
    execSync(this.angularCommand, { cwd: this.projectRoot, stdio: 'inherit' });
  }

  // Install additional dependencies
  private installDependencies(): void {
    const projectDir = path.join(this.projectRoot, this.projectName);
    execSync(`npm install @angular/core@${DictionaryCLI.get("ANGULAR_VERSION")} @angular/cli@${DictionaryCLI.get("ANGULAR_VERSION")}`, { cwd: projectDir, stdio: 'inherit' });
    execSync(`npm install winston @types/winston`, { cwd: this.frontendPath, stdio: 'inherit' });
  }

  // Create default folder structure
  private createFolderStructure(): void {
    const appRoot = path.join(this.frontendPath, 'src', 'app');
    const folders = ['components', 'services', 'models', 'guards', 'media', 'directives', 'pages'];

    folders.forEach(folder => {
      const folderPath = path.join(appRoot, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        logger.info(`Created folder: ${folderPath}`);
      }
    });

    // Create logs directory
    const logsDir = path.join(this.frontendPath, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      logger.info(`Created logs directory: ${logsDir}`);
    }
  }

  // Create environment files
  private updateEnvironmentFiles(): void {
    const environmentsDir = path.join(this.frontendPath, 'src', 'environments');
    fs.mkdirSync(environmentsDir, { recursive: true });

    const envContent = `
export const environment = {
  production: false,
  logging: {
    level: 'debug'
  }
};`.trim();

    const envProdContent = `
export const environment = {
  production: true,
  logging: {
    level: 'info'
  }
};`.trim();

    fs.writeFileSync(path.join(environmentsDir, 'environment.ts'), envContent);
    fs.writeFileSync(path.join(environmentsDir, 'environment.prod.ts'), envProdContent);
  }

  // Update core app files
  private updateAppFiles(): void {
    this.updateAppComponent();
    this.updateAppConfig();
  }

  private updateAppComponent(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'app.component.ts');
    const content = `
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '${this.projectName}';
  data: any;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.http.get('http://localhost:${DictionaryCLI.get("BACKEND_PORT")}/api/users').subscribe({
      next: (response: any) => {
        this.data = response;
        this.loading = false;
        console.log('Fetched data from backend:', response);
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'API Error';
        this.loading = false;
        console.error('Error fetching data:', err);
      },
    });
  }
}
`.trim();
    fs.writeFileSync(filePath, content);
  }

  private updateAppConfig(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'app.config.ts');
    const content = `
import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { httpInterceptor } from './services/http-interceptor.service';
import { ErrorHandlerService } from './services/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpInterceptor])),
    { provide: ErrorHandler, useClass: ErrorHandlerService }
  ]
};
`.trim();
    fs.writeFileSync(filePath, content);
  }

  // Setup error handler service
  private setupErrorHandling(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'services', 'error-handler.service.ts');
    const content = `
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error handler:', error);
  }
}`.trim();
    fs.writeFileSync(filePath, content);
  }

  // Setup HTTP interceptor service (Angular 19 functional approach)
  private setupHttpInterceptor(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'services', 'http-interceptor.service.ts');
    const content = `
import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  console.debug(\`HTTP \${req.method} \${req.url}\`);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - startTime;
          console.debug(\`HTTP \${req.method} \${req.url} - \${event.status} (\${elapsed}ms)\`);
        }
      },
      error: (error: HttpErrorResponse) => {
        const elapsed = Date.now() - startTime;
        console.error(\`HTTP \${req.method} \${req.url} - \${error.status} (\${elapsed}ms)\`, error.message);
      }
    })
  );
};`.trim();
    fs.writeFileSync(filePath, content);
  }

  // Setup UI library (only Bootstrap for now)
  private setupUiLibrary(): void {
    if (DictionaryCLI.get("UI_LIBRARY") === 'bootstrap') {
      this.setupBootstrap();
    } else {
      logger.warn(`Unsupported UI library: ${DictionaryCLI.get("UI_LIBRARY")}`);
    }
  }

  private setupBootstrap(): void {
    logger.info('Installing and configuring Bootstrap...');
    execSync(`npm install bootstrap @popperjs/core`, { cwd: this.frontendPath, stdio: 'inherit' });

    // Update angular.json
    const angularJsonPath = path.join(this.frontendPath, 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

    const projectKey = this.projectName;
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
    const stylesPath = path.join(this.frontendPath, 'src', 'styles.scss');
    fs.writeFileSync(stylesPath, `@import "bootstrap/dist/css/bootstrap.min.css";\n`);

    // Replace default Angular page with Bootstrap page
    const appComponentHtmlPath = path.join(this.frontendPath, 'src', 'app', 'app.component.html');
    const bootstrapPage = `
<div class="container text-center mt-5">
  <h1 class="display-4 text-primary">Welcome to ${this.projectName}</h1>
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

  // Update angular.json to set custom port
  private updateAngularJson(): void {
    const angularJsonPath = path.join(this.frontendPath, 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

    if (!angularJson.projects[this.projectName].architect) {
      angularJson.projects[this.projectName].architect = {};
    }
    if (!angularJson.projects[this.projectName].architect.serve) {
      angularJson.projects[this.projectName].architect.serve = {};
    }
    if (!angularJson.projects[this.projectName].architect.serve.options) {
      angularJson.projects[this.projectName].architect.serve.options = {};
    }

    angularJson.projects[this.projectName].architect.serve.options.port = Number(DictionaryCLI.get("FRONTEND_PORT"));
    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
  }
}