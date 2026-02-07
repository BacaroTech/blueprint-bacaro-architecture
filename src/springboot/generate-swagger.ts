import path from 'path';
import fs from 'fs';
import logger from 'winston';

export class SwaggerGenerator {

        static generateSwaggerConfig(backendPath: string, projectNameBE: string): void {
            const packageName = `com.example.${projectNameBE.toLowerCase()}`;
            const javaPath = path.join(backendPath, 'src', 'main', 'java', 'com', 'example', projectNameBE.toLowerCase());
    
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
                    .title("${projectNameBE} API")
                    .version("1.0.0")
                    .description("API documentation for ${projectNameBE}")
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
    
}