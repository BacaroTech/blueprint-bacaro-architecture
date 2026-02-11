import { execSync } from "child_process";
import { DictionaryCLI } from "../utils/dictionary-cli";

export class InstallDependencies {
    // Install additional dependencies
    public static installDependencies(projectRoot: string, frontendPath: string): void {
        execSync(`npm install @angular/core@${DictionaryCLI.get("ANGULAR_VERSION")} @angular/cli@${DictionaryCLI.get("ANGULAR_VERSION")}`, { cwd: frontendPath, stdio: 'inherit' });
        execSync(`npm install winston @types/winston`, { cwd: frontendPath, stdio: 'inherit' });
    }

}