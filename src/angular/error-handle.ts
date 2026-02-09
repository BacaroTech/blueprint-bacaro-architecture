import * as fs from 'fs';
import path from "path";

export class ErrorHandling {
    // Setup error handler service
    public static setupErrorHandling(frontendPath: string): void {
        const filePath = path.join(frontendPath, 'src', 'app', 'services', 'error-handler.service.ts');
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
}