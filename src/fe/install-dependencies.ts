import { execSync } from "child_process";
import path from "path";
import { DictionaryCLI } from "../utils/dictionary-cli";

export class InstallDependencies {
    // Install additional dependencies
    public static installDependencies(projectRoot: string, frontendPath:string): void {
        const projectDir = path.join(projectRoot, projectRoot);
        execSync(`npm install @angular/core@${DictionaryCLI.get("ANGULAR_VERSION")} @angular/cli@${DictionaryCLI.get("ANGULAR_VERSION")}`, { cwd: projectDir, stdio: 'inherit' });
        execSync(`npm install winston @types/winston`, { cwd: frontendPath, stdio: 'inherit' });
    }

}