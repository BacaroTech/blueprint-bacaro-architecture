import { BaseCLI } from "./base-cli";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

// load values from .env file
const projectNameFromEnv = process.env.PROJECT_NAME;
const projectDescription = process.env.PROJECT_DESCRIPTION
const angularVersion = process.env.ANGULAR_VERSION

export class ReadMeCLI extends BaseCLI{
    projectRoot: string = "";

    public constructor(projectRoot: string){
        super();
        this.projectRoot = projectRoot;
    }

    public generate(){
        const readmeContent = `
# ${projectNameFromEnv}
${projectDescription}

## Documentazioni utili

Angular: [Link alla documentazione](https://v${angularVersion}.angular.io/docs)

Node express: [Link alla documentazione](https://nodejs.org/docs/latest/api/)

Postgress: [Link alla documentazione](https://node-postgres.com/)

---

Questa repository è frutto della BacaroTech CLI

Scopri di più su questa repo: [Link alla repo](https://github.com/BacaroTech/blueprint-bacaro-architecture)`;
    
        fs.writeFileSync(path.join(this.projectRoot, 'README.md'), readmeContent);
        logger.info("ReadMe genereted");
    }
}

