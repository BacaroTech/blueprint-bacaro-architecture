export const MODEL_TEMPLATE = `package {{packageName}};

import jakarta.persistence.*;
{{lombokImports}}

@Entity
@Table(name = "{{tableName}}")
{{lombokAnnotations}}
public class {{className}} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String email;
    
    private String password;
}`;