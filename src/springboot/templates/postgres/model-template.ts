export const MODEL_TEMPLATE = `package {{packageName}}.model;

import jakarta.persistence.*;
{{lombokImports}}

@Entity
@Table(name = "{{tableName}}")
{{lombokAnnotations}}
public class {{className}} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "password", nullable = false)
    private String password;
}`;