import { BaseCLI } from "./base-cli";
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import logger from 'winston';

dotenv.config();

/**
 * TODO 
 * - swagger
 * - attach to datasource selected -> mongo/postgress
 */

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
            'security',
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
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
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
        
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
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
</project>`;

        const pomPath = path.join(this.backendPath, 'pom.xml');
        fs.writeFileSync(pomPath, pomContent);
        logger.info('Created pom.xml');
    }

    private generateApplicationProperties(): void {
        const propertiesContent = `# Application
spring.application.name=${this.projectNameBE}
server.port=8080

# Database Configuration (H2 for development)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Logging
logging.level.root=INFO
logging.level.com.example.${this.projectNameBE.toLowerCase()}=DEBUG`;

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
}`;

        const javaPath = path.join(this.backendPath, 'src', 'main', 'java', 'com', 'example', this.projectNameBE.toLowerCase());
        const mainClassPath = path.join(javaPath, `${className}.java`);
        fs.writeFileSync(mainClassPath, mainClassContent);
        logger.info(`Created ${className}.java`);
    }

    private generateSampleFiles(): void {
        const packageName = `com.example.${this.projectNameBE.toLowerCase()}`;
        const javaPath = path.join(this.backendPath, 'src', 'main', 'java', 'com', 'example', this.projectNameBE.toLowerCase());

        // Model
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
}`;
        fs.writeFileSync(path.join(javaPath, 'model', 'User.java'), userModelContent);

        // Repository
        const userRepositoryContent = `package ${packageName}.repository;

import ${packageName}.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}`;
        fs.writeFileSync(path.join(javaPath, 'repository', 'UserRepository.java'), userRepositoryContent);

        // Service
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
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}`;
        fs.writeFileSync(path.join(javaPath, 'service', 'UserService.java'), userServiceContent);

        // Controller
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
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}`;
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
.env.local`;

        const gitignorePath = path.join(this.backendPath, '.gitignore');
        fs.writeFileSync(gitignorePath, gitignoreContent);
        logger.info('Created .gitignore');
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public generate(): void {
        logger.info(`Generating Spring Boot backend: ${this.projectNameBE}`);
        
        try {
            // Create the folder structure
            this.generateFolder();
            
            // Generate configuration files
            this.generatePomXml();
            this.generateApplicationProperties();
            this.generateMainApplication();
            this.generateSampleFiles();
            this.generateGitignore();
            
            logger.info('Spring Boot backend generated successfully!');
            logger.info(`To run the project:`);
            logger.info(`  cd ${this.backendPath}`);
            logger.info(`  mvn spring-boot:run`);
            logger.info(`The API will be available at http://localhost:8080`);
            logger.info(`H2 Console: http://localhost:8080/h2-console`);
            
        } catch (error) {
            logger.error('Error generating Spring Boot backend:', error);
            throw error;
        }
    }
}