const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

//DOCKER COMPOSE
export const generateDockerComposeFile = (projectRoot: string, projectNameFromEnv: string) => {
    const dockerComposeContent = `version: '3.8'
  
  services:
    ${projectNameFromEnv}be:
      container_name: ${projectNameFromEnv}be
      build:
        context: ./${projectNameFromEnv}BE
        dockerfile: Dockerfile
      ports:
        - "3000:3000"
      environment:
        - NODE_ENV=development
      volumes:
        - ./${projectNameFromEnv}BE:/app
        - /app/node_modules
      networks:
        - ${projectNameFromEnv}-network
      depends_on:
        - ${projectNameFromEnv}db
  
    ${projectNameFromEnv}fe:
      container_name: ${projectNameFromEnv}fe
      build:
        context: ./${projectNameFromEnv}FE
        dockerfile: Dockerfile
      ports:
        - "4200:4200"
      volumes:
        - ./${projectNameFromEnv}FE:/app
        - /app/node_modules
      networks:
        - ${projectNameFromEnv}-network
      depends_on:
        - ${projectNameFromEnv}be
  
    ${projectNameFromEnv}db:
      container_name: ${projectNameFromEnv}db
      image: postgres:13
      environment:
        POSTGRES_PASSWORD: example
        POSTGRES_USER: example
        POSTGRES_DB: example
      ports:
        - "5432:5432"
      volumes:
        - ${projectNameFromEnv}-db-data:/var/lib/postgresql/data
      networks:
        - ${projectNameFromEnv}-network
  
  volumes:
    ${projectNameFromEnv}-db-data:
  
  networks:
    ${projectNameFromEnv}-network:
      driver: bridge
  `;
  
    fs.writeFileSync(path.join(projectRoot, 'docker-compose.yml'), dockerComposeContent);
  }
  