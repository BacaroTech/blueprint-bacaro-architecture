const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// load values from .env file
const projectNameFromEnv = process.env.PROJECT_NAME;
const uiLibraryFromEnv = process.env.UI_LIBRARY;
const frontendPort = process.env.FRONTEND_PORT;
const angularVersion = process.env.ANGULAR_VERSION;
const backendPort = process.env.BACKEND_PORT;

//TODO because not working
function setTailwind(frontendPath: string){
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

  // Step 7: Clear the default content in app.component.ts
  const appComponentTsPath = path.join(frontendPath, 'src', 'app', 'app.component.ts');
  const appComponentTsContent = `
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data: any;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.http.get('http://localhost:${backendPort}').subscribe({
      next: (response) => {
        this.data = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'API Error';
        this.loading = false;
      },
    });
  }
}  
  `;
  fs.writeFileSync(appComponentTsPath, appComponentTsContent);

  console.log('Tailwind CSS setup completed successfully!');
};

function setBootstrap(frontendPath: string){
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
  angularJson.projects[projectNameFromEnv + 'FE'].architect.build.options.styles.push(
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
</div>
  `;
  fs.writeFileSync(appComponentHtmlPath, customBootstrapPage);

  // Step 5: Clear the default content in app.component.ts
  const appComponentTsPath = path.join(frontendPath, 'src', 'app', 'app.component.ts');
  const appComponentTsContent = `
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data: any;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.http.get('http://localhost:${backendPort}').subscribe({
      next: (response) => {
        this.data = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'API Error';
        this.loading = false;
      },
    });
  }
}
`;
  fs.writeFileSync(appComponentTsPath, appComponentTsContent);

  // Step 6: Rework app.module.ts
  const appModuleTsPath = path.join(frontendPath, 'src', 'app', 'app.module.ts');
  const appModuleTsContent = `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
`;
  fs.writeFileSync(appModuleTsPath, appModuleTsContent);


  console.log('Angular Bootstrap setup completed!');
};

function setFEinterfaceUI(angularCommand: string, frontendPath: string){
  // Check UI_LIBRARY value and modify the Angular CLI command
  if (uiLibraryFromEnv === 'tailwind') {
    angularCommand += ' --package-manager npm'; // Add Tailwind CSS setup
    console.log('Adding Tailwind CSS to the Angular project...');
    //TODO FIX NOT WORK
    setTailwind(frontendPath);
  } else if (uiLibraryFromEnv === 'bootstrap') {
    angularCommand += ' --package-manager npm'; // Add Bootstrap setup
    console.log('Adding Bootstrap to the Angular project...');
    setBootstrap(frontendPath);
  } else {
    console.log('No UI library selected. Skipping UI setup.');
  }
};

export function generateFeProject(projectNameFE: string, projectRoot: string, frontendPath: string){
  console.log(`Generating Angular "${angularVersion}" project...\n`);

  // Angular CLI command to create a new project with specific version
  let angularCommand = `npx -y @angular/cli@${angularVersion} new "${projectNameFE}" \
    --directory "${projectNameFE}" \
    --style=scss \
    --routing \
    --skip-git \
    --skip-install`;

  // Execute the Angular CLI command
  execSync(angularCommand, { cwd: projectRoot, stdio: 'inherit' });

  // Install dependencies explicitly (optional but recommended)
  const installCommand = `npm install @angular/core@${angularVersion} @angular/cli@${angularVersion} --legacy-peer-deps`;
  execSync(installCommand, { cwd: path.join(projectRoot, projectNameFE), stdio: 'inherit' });

  // Generate Dockerfile and Nginx config
  const dockerfileContent = 
`# Stage 1: Build Angular application
FROM node:16.20.2-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:1.25.3-alpine

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

COPY --from=builder /app/dist/${projectNameFE} /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`;

  const nginxConfContent = 
`server {
  listen 80;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
  }
}`;

  // Write Dockerfile and nginx.conf
  fs.writeFileSync(path.join(frontendPath, 'dockerfile'), dockerfileContent);
  fs.writeFileSync(path.join(frontendPath, 'nginx.conf'), nginxConfContent);

  // Rest of your existing code...
  setFEinterfaceUI(angularCommand, frontendPath);

  const angularJsonPath = path.join(frontendPath, 'angular.json');
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

  if (!angularJson.projects[projectNameFE].architect) {
    angularJson.projects[projectNameFE].architect = {};
  }
  if (!angularJson.projects[projectNameFE].architect.serve) {
    angularJson.projects[projectNameFE].architect.serve = {};
  }
  if (!angularJson.projects[projectNameFE].architect.serve.options) {
    angularJson.projects[projectNameFE].architect.serve.options = {};
  }

  angularJson.projects[projectNameFE].architect.serve.options.port = Number(frontendPort);

  fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

  console.log(`Angular ${angularVersion} application is running on port ${frontendPort}.`);
  console.log(`Dockerfile and nginx.conf have been generated for container deployment.`);
};