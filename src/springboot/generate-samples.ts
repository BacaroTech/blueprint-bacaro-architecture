import path from 'path';
import fs from 'fs';
import logger from 'winston';
import { DictionaryCLI } from '../utils/dictionary-cli';
import { MODEL_TEMPLATE } from './templates/postgres/model-template';
import { REPOSITORY_TEMPLATE } from './templates/postgres/repository-template';
import { MONGO_MODEL_TEMPLATE } from './templates/mongo/model-template';
import { MONGO_REPOSITORY_TEMPLATE } from './templates/mongo/repository-template';

export class SamplesGenerator {
    static generateSampleFiles(backendPath: string, projectNameBE: string): void {
        const packageName = `com.example.${projectNameBE.toLowerCase()}`;
        const javaPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase());

        let idType;

        switch (DictionaryCLI.get('DATABASE_TYPE')) {
            case 'postgres': {
                this.generateSamplePostgresModel(backendPath, projectNameBE);
                this.generateSamplePostgresRepository(backendPath, projectNameBE);
                idType = 'long';
            }
            case 'mongo': {
                this.generateMongoUserModel(backendPath, projectNameBE);
                this.generateMongoUserRepository(backendPath, projectNameBE);
                idType = 'String';
            }
            default:
                //no db
                break;
        }
            


        // Service (uguale per entrambi i database, ma cambia il tipo ID)
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
    public ResponseEntity<User> getUserById(@PathVariable ${idType} id) {
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable ${idType} id, @RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable ${idType} id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}`.trim();
        fs.writeFileSync(path.join(javaPath, 'controller', 'UserController.java'), userControllerContent);

        logger.info('Created sample files (User model, repository, service, controller)');
    }

    static generateSamplePostgresModel(backendPath: string, projectNameBE: string): void {
        const isLombokEnabled = DictionaryCLI.get('ENABLE_LOMBOK') === 'true';
        
        const className = 'User';
        const packageName = `com.example.${projectNameBE.toLowerCase()}.model`;
        const tableName = 'users';

        const lombokImports = isLombokEnabled 
            ? "import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;" 
            : "";
        
        const lombokAnnotations = isLombokEnabled 
            ? "@Data\n@NoArgsConstructor\n@AllArgsConstructor" 
            : "";

        const content = MODEL_TEMPLATE
            .replace('{{packageName}}', packageName)
            .replace('{{tableName}}', tableName)
            .replace('{{className}}', className)
            .replace('{{lombokImports}}', lombokImports)
            .replace('{{lombokAnnotations}}', lombokAnnotations);

        const modelPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase(), 'model');

        fs.writeFileSync(path.join(modelPath, `${className}.java`), content.trim());
        
        logger.info(`Generated ${className}.java (Lombok: ${isLombokEnabled})`);
    }

    static generateSamplePostgresRepository(backendPath: string, projectNameBE: string): void {
        const className = 'User';
        const basePackage = `com.example.${projectNameBE.toLowerCase()}`;

        const content = REPOSITORY_TEMPLATE
            .replace(/{{packageName}}/g, basePackage)
            .replace(/{{className}}/g, className);

        const repoPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase(), 'repository');

        const finalFilePath = path.join(repoPath, `${className}Repository.java`);
        fs.writeFileSync(finalFilePath, content);
        
        logger.info(`Created ${className}Repository.java`);
    }

    static generateMongoUserModel(backendPath: string, projectNameBE: string): void {
        const isLombokEnabled = DictionaryCLI.get('ENABLE_LOMBOK') === 'true';
        const className = 'User';
        const basePackage = `com.example.${projectNameBE.toLowerCase()}`;
        const collectionName = 'users';

        const lombokImports = isLombokEnabled 
            ? "import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;" 
            : "";
        
        const lombokAnnotations = isLombokEnabled 
            ? "@Data\n@NoArgsConstructor\n@AllArgsConstructor" 
            : "";

        const content = MONGO_MODEL_TEMPLATE
            .replace(/{{packageName}}/g, basePackage)
            .replace('{{className}}', className)
            .replace('{{collectionName}}', collectionName)
            .replace('{{lombokImports}}', lombokImports)
            .replace('{{lombokAnnotations}}', lombokAnnotations);

        const modelPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase(), 'model');
        
        fs.writeFileSync(path.join(modelPath, `${className}.java`), content.trim());
        
        logger.info(`Created MongoDB User Model (Lombok: ${isLombokEnabled})`);
    }

    static generateMongoUserRepository(backendPath: string, projectNameBE: string): void {
        const className = 'User';
        const basePackage = `com.example.${projectNameBE.toLowerCase()}`;

        const content = MONGO_REPOSITORY_TEMPLATE
            .replace(/{{packageName}}/g, basePackage)
            .replace(/{{className}}/g, className);

        const repoPath = path.join(
            backendPath, 
            'src', 'main', 'java', 'com', 'example', 
            projectNameBE.toLowerCase(), 
            'repository'
        );

        const finalFilePath = path.join(repoPath, `${className}Repository.java`);
        fs.writeFileSync(finalFilePath, content.trim());
        
        logger.info(`Created MongoDB Repository: ${className}Repository.java`);
    }
}