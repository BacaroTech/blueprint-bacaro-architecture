export const REPOSITORY_TEMPLATE = `package {{packageName}}.repository;

import {{packageName}}.model.{{className}};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface {{className}}Repository extends JpaRepository<{{className}}, Long> {
    Optional<{{className}}> findByUsername(String username);
    Optional<{{className}}> findByEmail(String email);
}`;