import path from 'path';
import fs from 'fs';
import logger from 'winston';
import dotenv from "dotenv";
import { DictionaryCLI } from '../utils/dictionary-cli';
import { create } from 'xmlbuilder2';

dotenv.config();


export class PomGenerator {
    
        static generatePomXml(backendPath: string, projectNameBE: string): void {
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
            project.ele('artifactId').txt(projectNameBE);
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
            

            switch (DictionaryCLI.get('DATABASE_TYPE')) {
                case 'postgres': {
                    const jpa = deps.ele('dependency');
                    jpa.ele('groupId').txt('org.springframework.boot').up();
                    jpa.ele('artifactId').txt('spring-boot-starter-data-jpa').up();

                    const postgres = deps.ele('dependency');
                    postgres.ele('groupId').txt('org.postgresql').up();
                    postgres.ele('artifactId').txt('postgresql').up();
                    postgres.ele('scope').txt('runtime').up();
                    break;
                }
                case 'mongo': {
                    const mongo = deps.ele('dependency');
                    mongo.ele('groupId').txt('org.springframework.boot').up();
                    mongo.ele('artifactId').txt('spring-boot-starter-data-mongodb').up();
                    break;
                }
                default:
                    //no db
                    break;
            }

            if (DictionaryCLI.get('ENABLE_ACTUATOR') === 'true') {
                const actuator = deps.ele('dependency');
                    actuator.ele('groupId').txt('org.springframework.boot').up();
                    actuator.ele('artifactId').txt('spring-boot-starter-actuator').up();
            }

            if (DictionaryCLI.get('ENABLE_LOMBOK') === 'true') {
                const lombok = deps.ele('dependency');
                    lombok.ele('groupId').txt('org.projectlombok').up();
                    lombok.ele('artifactId').txt('lombok').up();
                    lombok.ele('scope').txt('compile').up
            }
            
            if (DictionaryCLI.get('ENABLE_VALIDATOR') === 'true') {
                const validator = deps.ele('dependency');
                    validator.ele('groupId').txt('org.springframework.boot').up();
                    validator.ele('artifactId').txt('spring-boot-starter-validation').up();
            }

            if (DictionaryCLI.get('ENABLE_SWAGGER') === 'true') {
                const swagger = deps.ele('dependency');
                    swagger.ele('groupId').txt('org.springdoc').up();
                    swagger.ele('artifactId').txt('springdoc-openapi-starter-webmvc-ui').up();
                    swagger.ele('version').txt(DictionaryCLI.get('SWAGGER_VERSION')).up();
            }
            

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