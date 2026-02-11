import * as fs from 'fs';
import path from "path";
import { DictionaryCLI } from "../utils/dictionary-cli";

export class AngularJson {
    // Update angular.json to set custom port
    public static updateAngularJson(frontendPath: string, projectName: string): void {
        const angularJsonPath = path.join(frontendPath, 'angular.json');
        const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

        if (!angularJson.projects[projectName].architect) {
            angularJson.projects[projectName].architect = {};
        }
        if (!angularJson.projects[projectName].architect.serve) {
            angularJson.projects[projectName].architect.serve = {};
        }
        if (!angularJson.projects[projectName].architect.serve.options) {
            angularJson.projects[projectName].architect.serve.options = {};
        }

        angularJson.projects[projectName].architect.serve.options.port = Number(DictionaryCLI.get("FRONTEND_PORT"));
        fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
    }
}