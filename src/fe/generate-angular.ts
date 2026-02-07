import { execSync } from "child_process";
import { DictionaryCLI } from "../utils/dictionary-cli";

export class GenerateAngular {


    // Create Angular project (standalone by default in Angular 19)
    public static generateAngularProject(projectRoot: string, projectName:string): void {

        const angularCommand: string = `npx -y @angular/cli@${DictionaryCLI.get("ANGULAR_VERSION")} new "${projectName}" \
      --directory "${projectName}" \
      --style=scss \
      --routing \
      --skip-git \
  }`
        execSync(angularCommand, { cwd: projectRoot, stdio: 'inherit' });
    }
}