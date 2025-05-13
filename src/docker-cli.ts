import { BaseCLI } from "./base-cli";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

// load values from .env file
const projectNameFromEnv = process.env.PROJECT_NAME;
const frontendPort = process.env.FRONTEND_PORT;
const backendPort = process.env.BACKEND_PORT;

export class DockerCLI extends BaseCLI{
    projectRoot!: string;

    public constructor(projectRoot: string){
        super();
        this.projectRoot = projectRoot;
    }

    private generateHead(){
        return `
version: '3.8'

services:`
    }

    private generateAngularService(){
return `
  ${projectNameFromEnv}FE:
    build:
      context: ./${projectNameFromEnv}FE
      ports:
      - "${frontendPort}:${frontendPort}"
      volumes:
      - "./${projectNameFromEnv}FE/app/node_modules"
      - "./${projectNameFromEnv}FE:/app"
      networks:
      - ${projectNameFromEnv}-network
      restart: unless-stopped`
    }

    private generateDataBase(){
        //todo rework database-cli
    }

    private generateVolumes(){
        return `
volumes:
  ${projectNameFromEnv}-db-data:`
    }

    private generateNetwork(){
        return `
networks:
  ${projectNameFromEnv}-network:
    driver: bridge`
    }
    
    generate(){
        const dockerComposePath = path.join(this.projectRoot, 'docker-compose.yml');
        const dockerComposeContent = (``+
            this.generateHead() + `\n` +
            this.generateAngularService() + `\n` +
            //this.generateDataBase() + `\n` + 
            this.generateVolumes()+ `\n` +
            this.generateNetwork() 
        );
        fs.writeFileSync(dockerComposePath, dockerComposeContent);
    }
}

  