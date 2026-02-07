import path from 'path';
import fs from 'fs';
import logger from 'winston';
import { BaseCLI } from '../base-cli';

export class SamplesGenerator extends BaseCLI {
    generateSampleFiles(backendPath: string, projectNameBE: string): void {
        const packageName = `com.example.${projectNameBE.toLowerCase()}`;
        const javaPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase());
        const isPostgres = this.DATABASE_TYPE === 'postgres';
        const isMongo = this.DATABASE_TYPE === 'mongo';

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
}