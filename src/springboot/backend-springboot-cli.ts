import dotenv from "dotenv";
import logger from 'winston';
import { BaseCLI } from '../utils/base-cli';
import { FolderGenerator } from './generate-folder';
import { MainGenerator } from './generate-main';
import { GitIgnoreGenerator } from './generate-git-ignore';
import { SwaggerGenerator } from './generate-swagger';
import { BannerGenerator } from './generate-banner';
import { DictionaryCLI } from '../utils/dictionary-cli';
import { PomGenerator } from './generate-pom';
import { PropertiesGenerator } from './generate-properties';
import { SamplesGenerator } from './generate-samples';
import { execSync } from "child_process";

dotenv.config();

export class BackendSpringbootCLI extends BaseCLI {
    private readonly projectRoot: string;
    private readonly backendPath: string;
    private readonly projectNameBE: string;
    private readonly wrapperCommand: string;
    private readonly mvnCleanInstall: string;

    public constructor(projectNameBE: string, projectRoot: string, backendPath: string) {
        super();
        this.projectNameBE = projectNameBE;
        this.projectRoot = projectRoot;
        this.backendPath = backendPath;
        this.wrapperCommand = `mvn -N wrapper:wrapper`;
        this.mvnCleanInstall = `./mvnw clean install`;
    }
        
    public generate(): void {
        logger.info(`Generating Spring Boot backend: ${this.projectNameBE}`);

        try {
            // Create the folder structure
            FolderGenerator.FolderGenerator(this.backendPath, this.projectNameBE);

            // Generate configuration files
            PomGenerator.generatePomXml(this.backendPath, this.projectNameBE);
            PropertiesGenerator.generateApplicationProperties(this.backendPath, this.projectNameBE);
            //SwaggerGenerator.generateSwaggerConfig(this.backendPath, this.projectNameBE);
            MainGenerator.generateMainApplication(this.backendPath, this.projectNameBE);
            //SamplesGenerator.generateSampleFiles(this.backendPath, this.projectNameBE);
            GitIgnoreGenerator.generateGitignore(this.backendPath);
            BannerGenerator.generateBanner(this.backendPath, this.projectNameBE);
            this.generateWrapper();
            this.execWrapper();

            const isPostgres = DictionaryCLI.get('DATABASE_TYPE') === 'postgres';
            const isMongo = DictionaryCLI.get('DATABASE_TYPE') === 'mongo';

            logger.info('Spring Boot backend generated successfully!');
            logger.info(`To run the project:`);
            logger.info(`  cd ${this.backendPath}`);
            logger.info(`  mvn spring-boot:run`);
            logger.info(`The API will be available at http://localhost:${DictionaryCLI.get('BACKEND_PORT')}`);
            logger.info(`Swagger UI: http://localhost:${DictionaryCLI.get('BACKEND_PORT')}/swagger-ui.html`);
            logger.info(`API Docs: http://localhost:${DictionaryCLI.get('BACKEND_PORT')}/api-docs`);
            logger.info(`Health Check: http://localhost:${DictionaryCLI.get('BACKEND_PORT')}/actuator/health`);

            if (isPostgres) {
                const dbHost = DictionaryCLI.get('DATABASE_HOST');
                const dbPort = DictionaryCLI.get('DATABASE_PORT');
                const dbName = DictionaryCLI.get('DATABASE_NAME');
                logger.info(`PostgreSQL Database: ${dbHost}:${dbPort}/${dbName}`);
            } else if (isMongo) {
                const dbName = DictionaryCLI.get('DATABASE_NAME') || 'database';
                logger.info(`MongoDB Database: ${dbName}`);
            }

        } catch (error) {
            logger.error('Error generating Spring Boot backend:', error);
            throw new Error();
        }
    }

    private generateWrapper(): void {
        execSync(this.wrapperCommand, { cwd: this.backendPath, stdio: 'inherit' });
    }

    private execWrapper(): void {
        execSync(this.mvnCleanInstall, { cwd: this.backendPath, stdio: 'inherit' });
    }
}