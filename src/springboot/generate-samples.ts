import path from 'path';
import fs from 'fs';
import logger from 'winston';
import { DictionaryCLI } from '../utils/dictionary-cli';
import { MODEL_TEMPLATE } from './templates/postgres/model-template';
import { REPOSITORY_TEMPLATE } from './templates/postgres/repository-template';
import { MONGO_MODEL_TEMPLATE } from './templates/mongo/model-template';
import { MONGO_REPOSITORY_TEMPLATE } from './templates/mongo/repository-template';
import { SERVICE_TEMPLATE } from './templates/service-template';
import { CONTROLLER_TEMPLATE } from './templates/controller-template';

export class SamplesGenerator {
    static generateSampleFiles(backendPath: string, projectNameBE: string): void {
        const packageName = `com.example.${projectNameBE.toLowerCase()}`;
        const javaPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase());

        let idType: string = '';

        switch (DictionaryCLI.get('DATABASE_TYPE')) {
            case 'postgres': {
                this.generateSamplePostgresModel(packageName, javaPath);
                this.generateSamplePostgresRepository(packageName, javaPath);
                idType = 'long';
                break;
            }
            case 'mongo': {
                this.generateMongoUserModel(packageName, javaPath);
                this.generateMongoUserRepository(packageName, javaPath);
                idType = 'String';
                break;
            }
            default:
                //no db
                break;
        }

        this.generateSampleService(idType, packageName, javaPath);
        
        this.generateSampleController(idType, packageName, javaPath);
        
        logger.info('Created sample files (User model, repository, service, controller)');
    }

    static generateSamplePostgresModel(packageName: string, javaPath: string): void {
        const isLombokEnabled = DictionaryCLI.get('ENABLE_LOMBOK') === 'true';
        
        const className = 'User';
        const tableName = 'users';

        const lombokImports = isLombokEnabled 
            ? "import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;" 
            : "";
        
        const lombokAnnotations = isLombokEnabled 
            ? "@Data\n@NoArgsConstructor\n@AllArgsConstructor" 
            : "";

        const content = MODEL_TEMPLATE
            .replace('{{packageName}}', packageName)
            .replace('{{tableName}}', tableName)
            .replace('{{className}}', className)
            .replace('{{lombokImports}}', lombokImports)
            .replace('{{lombokAnnotations}}', lombokAnnotations);

        const modelPath = path.join(javaPath, 'model');

        fs.writeFileSync(path.join(modelPath, `${className}.java`), content.trim());
        
        logger.info(`Generated ${className}.java (Lombok: ${isLombokEnabled})`);
    }

    static generateSamplePostgresRepository(packageName: string, javaPath: string): void {
        const className = 'User';

        const content = REPOSITORY_TEMPLATE
            .replace(/{{packageName}}/g, packageName)
            .replace(/{{className}}/g, className);

        const repoPath = path.join(javaPath, 'repository');

        const finalFilePath = path.join(repoPath, `${className}Repository.java`);
        fs.writeFileSync(finalFilePath, content);
        
        logger.info(`Created ${className}Repository.java`);
    }

    static generateMongoUserModel(packageName: string, javaPath: string): void {
        const isLombokEnabled = DictionaryCLI.get('ENABLE_LOMBOK') === 'true';
        const className = 'User';
        const collectionName = 'users';

        const lombokImports = isLombokEnabled 
            ? "import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;" 
            : "";
        
        const lombokAnnotations = isLombokEnabled 
            ? "@Data\n@NoArgsConstructor\n@AllArgsConstructor" 
            : "";

        const content = MONGO_MODEL_TEMPLATE
            .replace(/{{packageName}}/g, packageName)
            .replace('{{className}}', className)
            .replace('{{collectionName}}', collectionName)
            .replace('{{lombokImports}}', lombokImports)
            .replace('{{lombokAnnotations}}', lombokAnnotations);

        const modelPath = path.join(javaPath, 'model');
        
        fs.writeFileSync(path.join(modelPath, `${className}.java`), content.trim());
        
        logger.info(`Created MongoDB User Model (Lombok: ${isLombokEnabled})`);
    }

    static generateMongoUserRepository(packageName: string, javaPath: string): void {
        const className = 'User';

        const content = MONGO_REPOSITORY_TEMPLATE
            .replace(/{{packageName}}/g, packageName)
            .replace(/{{className}}/g, className);

        const repoPath = path.join(javaPath, 'repository');

        const finalFilePath = path.join(repoPath, `${className}Repository.java`);
        fs.writeFileSync(finalFilePath, content.trim());
        
        logger.info(`Created MongoDB Repository: ${className}Repository.java`);
    }
    
    static generateSampleService(idType: string, packageName: string, javaPath: string): void {

        const content = SERVICE_TEMPLATE
            .replace(/{{packageName}}/g, packageName)
            .replace(/{{idType}}/g, idType);

        const servicePath = path.join(javaPath, 'service');

        fs.writeFileSync(path.join(servicePath, 'UserService.java'), content.trim());
        
        logger.info(`Created UserService.java with ID type: ${idType}`);
    }

    static generateSampleController(idType: string, packageName: string, javaPath: string): void {

        const content = CONTROLLER_TEMPLATE
            .replace(/{{packageName}}/g, packageName)
            .replace(/{{idType}}/g, idType);

        const controllerPath = path.join(javaPath, 'controller');

        fs.writeFileSync(path.join(controllerPath, 'UserController.java'), content.trim());
        
        logger.info(`Created UserController.java with @PathVariable type: ${idType}`);
    }
}