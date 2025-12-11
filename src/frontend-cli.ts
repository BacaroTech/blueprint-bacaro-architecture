import { BaseCLI } from "./base-cli";
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as logger from 'winston';

dotenv.config();

export class FrontendCLI extends BaseCLI {
  private projectName: string;
  private projectRoot: string;
  private frontendPath: string;
  private angularCommand: string = "";

  public constructor(projectName: string, projectRoot: string, frontendPath: string) {
    super();
    this.projectName = projectName;
    this.projectRoot = projectRoot;
    this.frontendPath = frontendPath;
  }

  // Generate the entire frontend application
  public generate(): void {
    logger.info(`Generating Angular project "${this.projectName}" with version ${this.ANGULAR_VERSION}...`);

    this.generateAngularProject();
    this.installDependencies();
    this.createFolderStructure();
    this.updateEnvironmentFiles();
    this.updateAppFiles();
    this.setupErrorHandling();
    this.setupHttpInterceptor();
    this.setupUiLibrary();
    this.createDockerfile();
    this.updateAngularJson();

    logger.info(`Angular project "${this.projectName}" is configured and running on port ${this.FRONTEND_PORT}.`);
  }

  // Create Angular project
  private generateAngularProject(): void {
    this.angularCommand = `npx -y @angular/cli@${this.ANGULAR_VERSION} new "${this.projectName}" \
      --directory "${this.projectName}" \
      --style=scss \
      --routing \
      --skip-git`;

    execSync(this.angularCommand, { cwd: this.projectRoot, stdio: 'inherit' });
  }

  // Install additional dependencies
  private installDependencies(): void {
    const projectDir = path.join(this.projectRoot, this.projectName);
    execSync(`npm install @angular/core@${this.ANGULAR_VERSION} @angular/cli@${this.ANGULAR_VERSION} --legacy-peer-deps`, { cwd: projectDir, stdio: 'inherit' });
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

  // Update core app files (app.component.ts, app.module.ts, etc.)
  private updateAppFiles(): void {
    this.updateAppComponent();
    this.updateAppModule();
  }

  private updateAppComponent(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'app.component.ts');
    const content = `
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
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
    this.http.get('http://localhost:${this.BACKEND_PORT}').subscribe({
      next: (response) => {
        this.data = response;
        this.loading = false;
        console.log('Fetched data from backend:', response);
      },
      error: (err) => {
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

  private updateAppModule(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'app.module.ts');
    const content = `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { ErrorHandlerService } from './services/error-handler.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
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

    this.updateAppModuleForErrorHandler();
  }

  private updateAppModuleForErrorHandler(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'app.module.ts');
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(
      `import { NgModule } from '@angular/core';`,
      `import { NgModule, ErrorHandler } from '@angular/core';`
    );

    content = content.replace(
      `providers: [`,
      `providers: [\n    { provide: ErrorHandler, useClass: ErrorHandlerService },`
    );

    fs.writeFileSync(filePath, content);
  }

  // Setup HTTP interceptor service
  private setupHttpInterceptor(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'services', 'http-interceptor.service.ts');
    const content = `
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
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
            console.debug(\`HTTP \${request.method} \${request.url} - \${event.status} (\${elapsed}ms)\`);
          }
        },
        error: (error: HttpErrorResponse) => {
          const elapsed = Date.now() - startTime;
          console.error(\`HTTP \${request.method} \${request.url} - \${error.status} (\${elapsed}ms)\`, error.message);
        }
      })
    );
  }
}`.trim();
    fs.writeFileSync(filePath, content);

    this.updateAppModuleForHttpInterceptor();
  }

  private updateAppModuleForHttpInterceptor(): void {
    const filePath = path.join(this.frontendPath, 'src', 'app', 'app.module.ts');
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(
      `import { HttpClientModule } from '@angular/common/http';`,
      `import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';`
    );

    content = content.replace(
      `providers: [`,
      `providers: [\n    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },`
    );

    fs.writeFileSync(filePath, content);
  }

  // Setup UI library (only Bootstrap for now)
  private setupUiLibrary(): void {
    if (this.UI_LIBRARY === 'bootstrap') {
      this.setupBootstrap();
    } else {
      logger.warn(`Unsupported UI library: ${this.UI_LIBRARY}`);
    }
  }

  private setupBootstrap(): void {
    logger.info('Installing and configuring Bootstrap...');
    execSync(`npm install bootstrap @ng-bootstrap/ng-bootstrap`, { cwd: this.frontendPath, stdio: 'inherit' });

    // Update angular.json
    const angularJsonPath = path.join(this.frontendPath, 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

    if (!angularJson.projects[`${this.PROJECT_NAME}FE`]) {
      logger.error('Project name mismatch in angular.json');
      process.exit(1);
    }

    angularJson.projects[`${this.PROJECT_NAME}FE`].architect.build.options.styles.push('node_modules/bootstrap/dist/css/bootstrap.min.css');
    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

    // Add Bootstrap import to styles.scss
    const stylesPath = path.join(this.frontendPath, 'src', 'styles.scss');
    fs.writeFileSync(stylesPath, `@import "bootstrap/dist/css/bootstrap.min.css";\n`);

    // Replace default Angular page with Bootstrap page
    const appComponentHtmlPath = path.join(this.frontendPath, 'src', 'app', 'app.component.html');
    const bootstrapPage = `
<div class="container text-center mt-5">
  <h1 class="display-4 text-primary">Welcome to ${this.PROJECT_NAME}</h1>
  <p class="lead text-muted">This is a custom page built with Bootstrap!</p>
  <button class="btn btn-primary btn-lg mt-3">Get Started</button>
</div>

<div>
  <h2>Test API node</h2>
  <div *ngIf="loading">Loading...</div>
  <div *ngIf="error">{{ error }}</div>
  <pre>{{ data | json }}</pre>
</div>`;
    fs.writeFileSync(appComponentHtmlPath, bootstrapPage);

    logger.info('Bootstrap UI setup complete.');
  }

  // Create Dockerfile
  private createDockerfile(): void {
    const dockerfilePath = path.join(this.projectRoot, this.projectName, 'Dockerfile');
    const content = `
FROM node:12.2.0

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
EXPOSE ${this.FRONTEND_PORT}

CMD ["npm", "start"]
`.trim();
    fs.writeFileSync(dockerfilePath, content);
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

    angularJson.projects[this.projectName].architect.serve.options.port = Number(this.FRONTEND_PORT);
    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
  }
}
