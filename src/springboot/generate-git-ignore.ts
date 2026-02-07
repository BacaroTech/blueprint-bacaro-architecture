import path from 'path';
import fs from 'fs';
import logger from 'winston';

export class GitIgnoreGenerator {
       static generateGitignore(backendPath: string): void {
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
    .env.local`.trim();;
    
            const gitignorePath = path.join(backendPath, '.gitignore');
            fs.writeFileSync(gitignorePath, gitignoreContent);
            logger.info('Created .gitignore');
        }
    
}