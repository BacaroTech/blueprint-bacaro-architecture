import * as fs from 'fs';
import path from "path";
import { DictionaryCLI } from "../utils/dictionary-cli";

export class UpdateAppFiles {
  // Update core app files
  public static updateAppFiles(frontendPath: string, projectName: string): void {
    this.updateAppComponent(frontendPath, projectName);
    this.updateAppConfig(frontendPath);
  }

  private static updateAppComponent(frontendPath: string, projectName: string): void {
    const filePath = path.join(frontendPath, 'src', 'app', 'app.component.ts');
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
      title = '${projectName}';
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

  private static updateAppConfig(frontendPath: string): void {
    const filePath = path.join(frontendPath, 'src', 'app', 'app.config.ts');
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
}