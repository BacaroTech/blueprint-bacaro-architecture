export const MONGO_REPOSITORY_TEMPLATE = `package {{packageName}}.repository;

import {{packageName}}.model.{{className}};
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface {{className}}Repository extends MongoRepository<{{className}}, String> {
    Optional<{{className}}> findByUsername(String username);
    Optional<{{className}}> findByEmail(String email);
}`;