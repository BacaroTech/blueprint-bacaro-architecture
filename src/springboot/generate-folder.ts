import path from 'path';
import fs from 'fs';
import logger from 'winston';

export class FolderGenerator {

    static FolderGenerator(backendPath: string, projectNameBE: string): void {
        const srcMainPath = path.join(backendPath, 'src', 'main');
        const javaPath = path.join(srcMainPath, 'java', 'com', 'example', projectNameBE.toLowerCase());
        const resourcesPath = path.join(srcMainPath, 'resources');
        const testPath = path.join(backendPath, 'src', 'test', 'java', 'com', 'example', projectNameBE.toLowerCase());

        logger.info('Creating Spring Boot folder structure...');

        // Java root folders
        const javaFolders = [
            'config',
            'controller',
            'service',
            'repository',
            'model',
            'dto',
            'exception',
            'util'
        ];

        javaFolders.forEach(folder => {
            const folderPath = path.join(javaPath, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                logger.info('Created:', folderPath);
            }
        });

        // Folder resources
        if (!fs.existsSync(resourcesPath)) {
            fs.mkdirSync(resourcesPath, { recursive: true });
            logger.info('Created:', resourcesPath);
        }

        // Folder test
        if (!fs.existsSync(testPath)) {
            fs.mkdirSync(testPath, { recursive: true });
            logger.info('Created:', testPath);
        }
    }
}