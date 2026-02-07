import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import logger from 'winston';
import { BaseCLI } from '../base-cli';
import { FolderGenerator } from './generate-folder';
import { MainGenerator } from './generate-main';
import { GitIgnoreGenerator } from './generate-git-ignore';
import { SwaggerGenerator } from './generate-swagger';
import { BannerGenerator } from './generate-banner';

dotenv.config();

export class BackendSpringbootCLI extends BaseCLI {
    private readonly projectRoot: string;
    private readonly backendPath: string;
    private readonly projectNameBE: string;

    public constructor(projectNameBE: string, projectRoot: string, backendPath: string) {
        super();
        this.projectNameBE = projectNameBE;
        this.projectRoot = projectRoot;
        this.backendPath = backendPath;
    }
        
    public generate(): void {
        logger.info(`Generating Spring Boot backend: ${this.projectNameBE}`);

        try {
            // Create the folder structure
            FolderGenerator.FolderGenerator(this.backendPath, this.projectNameBE);

            // Generate configuration files
            //todo implement static pom generator
            //todo implement static properties generator
            SwaggerGenerator.generateSwaggerConfig(this.backendPath, this.projectNameBE);
            MainGenerator.generateMainApplication(this.backendPath, this.projectNameBE);
            //todo implement samples generator
            GitIgnoreGenerator.generateGitignore(this.backendPath);
            BannerGenerator.generateBanner(this.backendPath, this.projectNameBE);

            const isPostgres = this.DATABASE_TYPE === 'postgres';
            const isMongo = this.DATABASE_TYPE === 'mongo';

            logger.info('Spring Boot backend generated successfully!');
            logger.info(`To run the project:`);
            logger.info(`  cd ${this.backendPath}`);
            logger.info(`  mvn spring-boot:run`);
            logger.info(`The API will be available at http://localhost:${this.BACKEND_PORT}`);
            logger.info(`Swagger UI: http://localhost:${this.BACKEND_PORT}/swagger-ui.html`);
            logger.info(`API Docs: http://localhost:${this.BACKEND_PORT}/api-docs`);
            logger.info(`Health Check: http://localhost:${this.BACKEND_PORT}/actuator/health`);

            if (isPostgres) {
                const dbHost = this.DATABASE_HOST;
                const dbPort = this.DATABASE_PORT;
                const dbName = this.DATABASE_NAME;
                logger.info(`PostgreSQL Database: ${dbHost}:${dbPort}/${dbName}`);
            } else if (isMongo) {
                const dbName = this.DATABASE_NAME || 'database';
                logger.info(`MongoDB Database: ${dbName}`);
            }

        } catch (error) {
            logger.error('Error generating Spring Boot backend:', error);
            throw new Error();
        }
    }
}