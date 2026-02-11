import * as fs from 'fs';
import path from "path";

export class EnviromentSetup {
    // Create environment files
    public static updateEnvironmentFiles(frontendPath: string): void {
        const environmentsDir = path.join(frontendPath, 'src', 'environments');
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
}