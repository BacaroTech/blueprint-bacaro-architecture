import path from 'path';
import fs from 'fs';
import logger from 'winston';
import dotenv from "dotenv";
import { DictionaryCLI } from '../dictionary-cli';

dotenv.config();


export class PropertiesGenerator extends DictionaryCLI{
    
        generateApplicationProperties(backendPath: string, projectNameBE: string): void {
            const isPostgres = this.DATABASE_TYPE === 'postgres';
            const isMongo = this.DATABASE_TYPE === 'mongo';
    
            let databaseConfig = '';
    
            if (isPostgres) {
                const dbHost = this.DATABASE_HOST;
                const dbPort = this.DATABASE_PORT;
                const dbName = this.DATABASE_NAME;
                const dbUser = this.DATABASE_USR;
                const dbPassword = this.DATABASE_PASSWORD;
    
                databaseConfig = `# PostgreSQL Database Configuration
    spring.datasource.url=jdbc:postgresql://${dbHost}:${dbPort}/${dbName}
    spring.datasource.username=${dbUser}
    spring.datasource.password=${dbPassword}
    spring.datasource.driver-class-name=org.postgresql.Driver
    
    # JPA Configuration
    spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    spring.jpa.properties.hibernate.format_sql=true
    spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true`.trim();
            } else if (isMongo) {
                const mongoUri = this.DATABASE_URI || 'mongodb://localhost:27017';
                const dbName = this.DATABASE_NAME || 'database';
    
                databaseConfig = `# MongoDB Database Configuration
    spring.data.mongodb.uri=${mongoUri}
    spring.data.mongodb.database=${dbName}`.trim();
            }
    
            const propertiesContent = `# Application
    spring.application.name=${projectNameBE}
    server.port=${this.BACKEND_PORT}
    
    ${databaseConfig}
    
    # Logging
    logging.level.root=INFO
    logging.level.com.example.${projectNameBE.toLowerCase()}=DEBUG`.trim();
    
            const resourcesPath = path.join(backendPath, 'src', 'main', 'resources');
            const propertiesPath = path.join(resourcesPath, 'application.properties');
            fs.writeFileSync(propertiesPath, propertiesContent);
            logger.info('Created application.properties');
        }
}