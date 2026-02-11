export const MONGO_MODEL_TEMPLATE = `package {{packageName}}.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
{{lombokImports}}

@Document(collection = "{{collectionName}}")
{{lombokAnnotations}}
public class {{className}} {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    private String email;
    
    private String password;

}`;