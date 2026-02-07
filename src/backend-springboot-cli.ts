import { BaseCLI } from "./base-cli";
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import logger from 'winston';
import { DictionaryCLI } from "./dictionary-cli";

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

    protected generateFolder(): void {
        const srcMainPath = path.join(this.backendPath, 'src', 'main');
        const javaPath = path.join(srcMainPath, 'java', 'com', 'example', this.projectNameBE.toLowerCase());
        const resourcesPath = path.join(srcMainPath, 'resources');
        const testPath = path.join(this.backendPath, 'src', 'test', 'java', 'com', 'example', this.projectNameBE.toLowerCase());

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

    private generatePomXml(): void {
        const isPostgres = DictionaryCLI.get("DATABASE_TYPE") === 'postgres';
        const isMongo = DictionaryCLI.get("DATABASE_TYPE") === 'mongo';

        const databaseDependencies = isPostgres ? `
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>` : isMongo ? `
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>` : '';

        const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>${this.projectNameBE}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${this.projectNameBE}</name>
    <description>Spring Boot project for ${this.projectNameBE}</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        ${databaseDependencies}
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>
        
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <finalName>app</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`.trim();

        const pomPath = path.join(this.backendPath, 'pom.xml');
        fs.writeFileSync(pomPath, pomContent);
        logger.info('Created pom.xml');
    }

    private generateApplicationProperties(): void {
        const isPostgres = DictionaryCLI.get("DATABASE_TYPE") === 'postgres';
        const isMongo = DictionaryCLI.get("DATABASE_TYPE") === 'mongo';

        let databaseConfig = '';

        if (isPostgres) {
            const dbHost = DictionaryCLI.get("DATABASE_HOST");
            const dbPort = DictionaryCLI.get("DATABASE_PORT");
            const dbName = DictionaryCLI.get("DATABASE_NAME");
            const dbUser = DictionaryCLI.get("DATABASE_USR");
            const dbPassword = DictionaryCLI.get("DATABASE_PASSWORD");

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
            const mongoUri = DictionaryCLI.get("DATABASE_URI") || 'mongodb://localhost:27017';
            const dbName = DictionaryCLI.get("DATABASE_NAME") || 'database';

            databaseConfig = `# MongoDB Database Configuration
spring.data.mongodb.uri=${mongoUri}
spring.data.mongodb.database=${dbName}`.trim();
        }

        const propertiesContent = `# Application
spring.application.name=${this.projectNameBE}
server.port=${DictionaryCLI.get("BACKEND_PORT")}

${databaseConfig}

# Logging
logging.level.root=INFO
logging.level.com.example.${this.projectNameBE.toLowerCase()}=DEBUG`.trim();

        const resourcesPath = path.join(this.backendPath, 'src', 'main', 'resources');
        const propertiesPath = path.join(resourcesPath, 'application.properties');
        fs.writeFileSync(propertiesPath, propertiesContent);
        logger.info('Created application.properties');
    }

    private generateMainApplication(): void {
        const className = this.capitalizeFirstLetter(this.projectNameBE) + 'Application';
        const packageName = `com.example.${this.projectNameBE.toLowerCase()}`;

        const mainClassContent = `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className} {
    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}`.trim();

        const javaPath = path.join(this.backendPath, 'src', 'main', 'java', 'com', 'example', this.projectNameBE.toLowerCase());
        const mainClassPath = path.join(javaPath, `${className}.java`);
        fs.writeFileSync(mainClassPath, mainClassContent);
        logger.info(`Created ${className}.java`);
    }

    private generateSampleFiles(): void {
        const packageName = `com.example.${this.projectNameBE.toLowerCase()}`;
        const javaPath = path.join(this.backendPath, 'src', 'main', 'java', 'com', 'example', this.projectNameBE.toLowerCase());
        const isPostgres = DictionaryCLI.get("DATABASE_TYPE") === 'postgres';
        const isMongo = DictionaryCLI.get("DATABASE_TYPE") === 'mongo';

        if (isPostgres) {
            // Model per PostgreSQL (JPA)
            const userModelContent = `package ${packageName}.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String email;
    
    private String password;
}`.trim();
            fs.writeFileSync(path.join(javaPath, 'model', 'User.java'), userModelContent);

            // Repository per PostgreSQL (JPA)
            const userRepositoryContent = `package ${packageName}.repository;

import ${packageName}.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}`.trim();
            fs.writeFileSync(path.join(javaPath, 'repository', 'UserRepository.java'), userRepositoryContent);

        } else if (isMongo) {
            // Model per MongoDB
            const userModelContent = `package ${packageName}.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    private String email;
    
    private String password;
}`;
            fs.writeFileSync(path.join(javaPath, 'model', 'User.java'), userModelContent);

            // Repository per MongoDB
            const userRepositoryContent = `package ${packageName}.repository;

import ${packageName}.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}`.trim();
            fs.writeFileSync(path.join(javaPath, 'repository', 'UserRepository.java'), userRepositoryContent);
        }

        // Service (uguale per entrambi i database, ma cambia il tipo ID)
        const idType = isPostgres ? 'Long' : 'String';
        const userServiceContent = `package ${packageName}.service;

import ${packageName}.model.User;
import ${packageName}.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(${idType} id) {
        return userRepository.findById(id);
    }
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public User updateUser(${idType} id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        return userRepository.save(user);
    }
    
    public void deleteUser(${idType} id) {
        userRepository.deleteById(id);
    }
}`.trim();
        fs.writeFileSync(path.join(javaPath, 'service', 'UserService.java'), userServiceContent);

        // Controller (cambia il tipo del PathVariable)
        const pathVariableType = isPostgres ? 'Long' : 'String';
        const userControllerContent = `package ${packageName}.controller;

import ${packageName}.model.User;
import ${packageName}.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable ${pathVariableType} id) {
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable ${pathVariableType} id, @RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable ${pathVariableType} id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}`.trim();
        fs.writeFileSync(path.join(javaPath, 'controller', 'UserController.java'), userControllerContent);

        logger.info('Created sample files (User model, repository, service, controller)');
    }

    private generateGitignore(): void {
        const gitignoreContent = `HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

### VS Code ###
.vscode/

### Environment ###
.env
.env.local`.trim();;

        const gitignorePath = path.join(this.backendPath, '.gitignore');
        fs.writeFileSync(gitignorePath, gitignoreContent);
        logger.info('Created .gitignore');
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private generateSwaggerConfig(): void {
        const packageName = `com.example.${this.projectNameBE.toLowerCase()}`;
        const javaPath = path.join(this.backendPath, 'src', 'main', 'java', 'com', 'example', this.projectNameBE.toLowerCase());

        const swaggerConfigContent = `package ${packageName}.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("${this.projectNameBE} API")
                .version("1.0.0")
                .description("API documentation for ${this.projectNameBE}")
                .contact(new Contact()
                    .name("API Support")
                    .email("support@example.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}`.trim();

        fs.writeFileSync(path.join(javaPath, 'config', 'OpenApiConfig.java'), swaggerConfigContent);
        logger.info('Created Swagger configuration');
    }

    private generateBanner(): void {
        const bannerContent = `
   _____ _____  _____  _____ _   _  _____   ____   ____   ____ _______ 
  / ____|  __ \\|  __ \\|_   _| \\ | |/ ____| |  _ \\ / __ \\ / __ \\__   __|
 | (___ | |__) | |__) | | | |  \\| | |  __  | |_) | |  | | |  | | | |   
  \\___ \\|  ___/|  _  /  | | | . \` | | |_ | |  _ <| |  | | |  | | | |   
  ____) | |    | | \\ \\ _| |_| |\\  | |__| | | |_) | |__| | |__| | | |   
 |_____/|_|    |_|  \\_\\_____|_| \\_|\\_____| |____/ \\____/ \\____/  |_|   
                                                                        
 :: ${this.projectNameBE} :: Spring Boot :: (v3.2.0)
`;

        const resourcesPath = path.join(this.backendPath, 'src', 'main', 'resources');
        const bannerPath = path.join(resourcesPath, 'banner.txt');
        fs.writeFileSync(bannerPath, bannerContent);
        logger.info('Created custom banner.txt');
    }

    public generate(): void {
        logger.info(`Generating Spring Boot backend: ${this.projectNameBE}`);

        try {
            // Create the folder structure
            this.generateFolder();

            // Generate configuration files
            this.generatePomXml();
            this.generateApplicationProperties();
            this.generateSwaggerConfig();
            this.generateMainApplication();
            this.generateSampleFiles();
            this.generateGitignore();
            this.generateBanner();

            const isPostgres = DictionaryCLI.get("DATABASE_TYPE") === 'postgres';
            const isMongo = DictionaryCLI.get("DATABASE_TYPE") === 'mongo';

            logger.info('Spring Boot backend generated successfully!');
            logger.info(`To run the project:`);
            logger.info(`  cd ${this.backendPath}`);
            logger.info(`  mvn spring-boot:run`);
            logger.info(`The API will be available at http://localhost:${DictionaryCLI.get("BACKEND_PORT")}`);
            logger.info(`Swagger UI: http://localhost:${DictionaryCLI.get("BACKEND_PORT")}/swagger-ui.html`);
            logger.info(`API Docs: http://localhost:${DictionaryCLI.get("BACKEND_PORT")}/api-docs`);
            logger.info(`Health Check: http://localhost:${DictionaryCLI.get("BACKEND_PORT")}/actuator/health`);

            if (isPostgres) {
                const dbHost = DictionaryCLI.get("DATABASE_HOST");
                const dbPort = DictionaryCLI.get("DATABASE_PORT");
                const dbName = DictionaryCLI.get("DATABASE_NAME");
                logger.info(`PostgreSQL Database: ${dbHost}:${dbPort}/${dbName}`);
            } else if (isMongo) {
                const dbName = DictionaryCLI.get("DATABASE_NAME") || 'database';
                logger.info(`MongoDB Database: ${dbName}`);
            }

        } catch (error) {
            logger.error('Error generating Spring Boot backend:', error);
            throw new Error();
        }
    }
}