import path from 'path';
import fs from 'fs';
import logger from 'winston';
import { Utils } from '../utils/utils';
import { APPLICATION_TEMPLATE } from './templates/application-template';

export class MainGenerator {
    static generateMainApplication(backendPath: string, projectNameBE: string): void {
        const className = Utils.capitalizeFirstLetter(projectNameBE) + 'Application';
        const packageName = `com.example.${projectNameBE.toLowerCase()}`;

        const content = APPLICATION_TEMPLATE
            .replace(/{{packageName}}/g, packageName)
            .replace(/{{className}}/g, className);

        const javaPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase());
        const finalFilePath = path.join(javaPath, `${className}.java`);

        fs.writeFileSync(finalFilePath, content);
        
        logger.info(`Created ${className}.java at ${finalFilePath}`);
    }
}