import * as fs from 'fs';
import path from "path";
import * as logger from 'winston';

export class FolderStructure {
    // Create default folder structure
    public static createFolderStructure(frontendPath: string, ): void {
        const appRoot = path.join(frontendPath, 'src', 'app');
        const folders = ['components', 'services', 'models', 'guards', 'media', 'directives', 'pages'];

        folders.forEach(folder => {
            const folderPath = path.join(appRoot, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                logger.info(`Created folder: ${folderPath}`);
            }
        });

        // Create logs directory
        const logsDir = path.join(frontendPath, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
            logger.info(`Created logs directory: ${logsDir}`);
        }
    }
}