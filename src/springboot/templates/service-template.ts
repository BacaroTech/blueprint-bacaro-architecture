export const SERVICE_TEMPLATE = `package {{packageName}}.service;

import {{packageName}}.model.User;
import {{packageName}}.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return this.userRepository.findAll();
    }
    
    public Optional<User> getUserById({{idType}} id) {
        return this.userRepository.findById(id);
    }
    
    public User createUser(User user) {
        return this.userRepository.save(user);
    }
    
    public User updateUser({{idType}} id, User userDetails) {
        User user = this.userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        return userRepository.save(user);
    }
    
    public void deleteUser({{idType}} id) {
        this.userRepository.deleteById(id);
    }
}`;