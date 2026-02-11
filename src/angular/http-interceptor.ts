import * as fs from 'fs';
import path from "path";

export class HttpInterceptor {
  // Setup HTTP interceptor service (Angular 19 functional approach)
  public static setupHttpInterceptor(frontendPath: string): void {
    const filePath = path.join(frontendPath, 'src', 'app', 'services', 'http-interceptor.service.ts');
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
}