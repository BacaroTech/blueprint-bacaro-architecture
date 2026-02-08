import path from 'path';
import fs from 'fs';
import logger from 'winston';
import dotenv from "dotenv";
import { DictionaryCLI } from '../utils/dictionary-cli';
import { create } from 'xmlbuilder2';

dotenv.config();


export class PomGenerator {
    
        static generatePomXml(backendPath: string, projectNameBE: string): void {
    //         const isPostgres = DictionaryCLI.get('DATABASE_TYPE') === 'postgres';
    //         const isMongo = DictionaryCLI.get('DATABASE_TYPE') === 'mongo'; 
    
    //         const databaseDependencies = isPostgres ? `
    //         <dependency>
    //             <groupId>org.springframework.boot</groupId>
    //             <artifactId>spring-boot-starter-data-jpa</artifactId>
    //         </dependency>
            
    //         <dependency>
    //             <groupId>org.postgresql</groupId>
    //             <artifactId>postgresql</artifactId>
    //             <scope>runtime</scope>
    //         </dependency>` : isMongo ? `
    //         <dependency>
    //             <groupId>org.springframework.boot</groupId>
    //             <artifactId>spring-boot-starter-data-mongodb</artifactId>
    //         </dependency>` : '';
    
    //         const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
    // <project xmlns="http://maven.apache.org/POM/4.0.0"
    //          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    //          xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
    //          https://maven.apache.org/xsd/maven-4.0.0.xsd">
    //     <modelVersion>4.0.0</modelVersion>
        
    //     <parent>
    //         <groupId>org.springframework.boot</groupId>
    //         <artifactId>spring-boot-starter-parent</artifactId>
    //         <version>3.2.0</version>
    //         <relativePath/>
    //     </parent>
        
    //     <groupId>com.example</groupId>
    //     <artifactId>${projectNameBE}</artifactId>
    //     <version>0.0.1-SNAPSHOT</version>
    //     <name>${projectNameBE}</name>
    //     <description>Spring Boot project for ${projectNameBE}</description>
        
    //     <properties>
    //         <java.version>17</java.version>
    //     </properties>
        
    //     <dependencies>
    //         <dependency>
    //             <groupId>org.springframework.boot</groupId>
    //             <artifactId>spring-boot-starter-web</artifactId>
    //         </dependency>
    //         ${databaseDependencies}
            
    //         <dependency>
    //             <groupId>org.springframework.boot</groupId>
    //             <artifactId>spring-boot-starter-validation</artifactId>
    //         </dependency>
            
    //         <dependency>
    //             <groupId>org.springframework.boot</groupId>
    //             <artifactId>spring-boot-starter-actuator</artifactId>
    //         </dependency>
            
    //         <dependency>
    //             <groupId>org.springdoc</groupId>
    //             <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    //             <version>2.3.0</version>
    //         </dependency>
            
    //         <dependency>
    //             <groupId>org.projectlombok</groupId>
    //             <artifactId>lombok</artifactId>
    //             <optional>true</optional>
    //         </dependency>
            
    //         <dependency>
    //             <groupId>org.springframework.boot</groupId>
    //             <artifactId>spring-boot-starter-test</artifactId>
    //             <scope>test</scope>
    //         </dependency>
    //     </dependencies>
        
    //     <build>
    //         <finalName>app</finalName>
    //         <plugins>
    //             <plugin>
    //                 <groupId>org.springframework.boot</groupId>
    //                 <artifactId>spring-boot-maven-plugin</artifactId>
    //                 <configuration>
    //                     <excludes>
    //                         <exclude>
    //                             <groupId>org.projectlombok</groupId>
    //                             <artifactId>lombok</artifactId>
    //                         </exclude>
    //                     </excludes>
    //                 </configuration>
    //             </plugin>
    //         </plugins>
    //     </build>
    // </project>`.trim();
    
            //const pomPath = path.join(backendPath, 'pom.xml');
            //fs.writeFileSync(pomPath, pomContent);

            const doc = create({ version: '1.0', encoding: 'UTF-8' });
            const project = doc.ele('project', {
                'xmlns': 'http://maven.apache.org/POM/4.0.0',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                'xsi:schemaLocation': 'http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd'
            });

            project.ele('modelVersion').txt('4.0.0');

            project.ele('parent')
                .ele('groupId').txt('org.springframework.boot').up()
                .ele('artifactId').txt('spring-boot-starter-parent').up()
                .ele('version').txt(DictionaryCLI.get('SPRINGBOOT_VERSION')).up()
                .ele('relativePath').up();

            project.ele('groupId').txt(DictionaryCLI.get('GROUP_ID'));
            project.ele('artifactId').txt(DictionaryCLI.get('ARTIFACT_ID'));
            project.ele('version').txt(DictionaryCLI.get('BE_VERSION'));

            project.ele('properties')
                .ele('java.version').txt(DictionaryCLI.get('JAVA_VERSION')).up();

            const deps = project.ele('dependencies');

            const starter = deps.ele('dependency');
            starter.ele('groupId').txt('org.springframework.boot').up();
            starter.ele('artifactId').txt('spring-boot-starter').up();

            const webStarter = deps.ele('dependency');
            webStarter.ele('groupId').txt('org.springframework.boot').up();
            webStarter.ele('artifactId').txt('spring-boot-starter-web').up();

            const testStarter = deps.ele('dependency');
            testStarter.ele('groupId').txt('org.springframework.boot').up();
            testStarter.ele('artifactId').txt('spring-boot-starter-test').up();
            testStarter.ele('scope').txt('test').up();

            const build = project.ele('build');
            const plugins = build.ele('plugins');
            plugins.ele('plugin')
                .ele('groupId').txt('org.springframework.boot').up()
                .ele('artifactId').txt('spring-boot-maven-plugin').up();

            const pomPath = path.join(backendPath, 'pom.xml');
            const pom = doc.end({ prettyPrint: true });

            fs.writeFileSync(pomPath, pom);

            logger.info('Created pom.xml');
        }
}