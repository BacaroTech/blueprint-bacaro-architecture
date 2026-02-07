import path from 'path';
import fs from 'fs';
import logger from 'winston';
import { Utils } from '../utils/utils';

export class MainGenerator {
    static generateMainApplication(backendPath: string, projectNameBE: string): void {
            const className = Utils.capitalizeFirstLetter(projectNameBE) + 'Application';
            const packageName = `com.example.${projectNameBE.toLowerCase()}`;
    
            const mainClassContent = `package ${packageName};
    
    import org.springframework.boot.SpringApplication;
    import org.springframework.boot.autoconfigure.SpringBootApplication;
    
    @SpringBootApplication
    public class ${className} {
        public static void main(String[] args) {
            SpringApplication.run(${className}.class, args);
        }
    }`.trim();
    
            const javaPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase());
            const mainClassPath = path.join(javaPath, `${className}.java`);
            fs.writeFileSync(mainClassPath, mainClassContent);
            logger.info(`Created ${className}.java`);
        }

    
}