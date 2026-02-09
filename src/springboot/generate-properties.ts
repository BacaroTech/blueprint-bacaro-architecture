import path from 'path';
import fs from 'fs';
import logger from 'winston';
import dotenv from "dotenv";
import { DictionaryCLI } from '../utils/dictionary-cli';

dotenv.config();


export class PropertiesGenerator {
    
        static generateApplicationProperties(backendPath: string, projectNameBE: string): void {
            const isPostgres = DictionaryCLI.get('DATABASE_TYPE') === 'postgres';
            const isMongo = DictionaryCLI.get('DATABASE_TYPE') === 'mongo';
    
            let databaseConfig = '';
    
            if (isPostgres) {
                const dbHost = DictionaryCLI.get('DATABASE_HOST');
                const dbPort = DictionaryCLI.get('DATABASE_PORT');
                const dbName = DictionaryCLI.get('DATABASE_NAME');
                const dbUser = DictionaryCLI.get('DATABASE_USR');
                const dbPassword = DictionaryCLI.get('DATABASE_PASSWORD');
    
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
                const mongoUri = DictionaryCLI.get('DATABASE_URI') || 'mongodb://localhost:27017';
                const dbName = DictionaryCLI.get('DATABASE_NAME') || 'database';
    
                databaseConfig = `# MongoDB Database Configuration
    spring.data.mongodb.uri=${mongoUri}
    spring.data.mongodb.database=${dbName}`.trim();
            }
    
            const propertiesContent = `# Application
    spring.application.name=${projectNameBE}
    server.port=${DictionaryCLI.get('BACKEND_PORT')}
    
    ${databaseConfig}
    
    # Logging
    logging.level.root=INFO
    logging.level.com.example.${projectNameBE.toLowerCase()}=DEBUG
    springdoc.swagger-ui.enabled=${DictionaryCLI.get('ENABLE_SWAGGER')}`.trim();
    
    
            const resourcesPath = path.join(backendPath, 'src', 'main', 'resources');
            const propertiesPath = path.join(resourcesPath, 'application.properties');
            fs.writeFileSync(propertiesPath, propertiesContent);
            logger.info('Created application.properties');
        }
}