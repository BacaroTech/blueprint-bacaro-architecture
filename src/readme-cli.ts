import { BaseCLI } from "./base-cli";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import logger from "winston";

dotenv.config();

/**
 * TODO
 * - fix doc in base of cases
 */

export class ReadMeCLI extends BaseCLI {
  private readonly projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  private docByBackend(): string {
    switch(this.BACKEND_TYPE){
      case 'node':
        return "Node express: [Link alla documentazione](https://nodejs.org/docs/latest/api/)"
      case 'springboot':
        return "Springboot: [Link alla documentazione](https://docs.spring.io/spring-boot/index.html)"
      default:
        return ""
    }
  }

  private docByDB(): string {
    switch(this.DATABASE_TYPE){
      case 'postgress':
        return "Postgres: [Link alla documentazione](https://node-postgres.com/)"
      case 'mongo':
        return "MongoDB: [Link alla documentazione](https://www.mongodb.com/docs/)"
      default:
        return ""
    }
  }

  public generate(): void {
    const readmeContent = 
`# ${this.PROJECT_NAME}
${this.PROJECT_DESCRIPTION}

## Useful documentation

Angular: [Link alla documentazione](https://v${this.ANGULAR_VERSION}.angular.io/docs)

${this.docByBackend()}

${this.docByDB()}

---

This repository is a result of the BacaroTech CLI

Learn more about this repo: [Link to the repo](https://github.com/BacaroTech/blueprint-bacaro-architecture)`;
    try {
      fs.writeFileSync(path.join(this.projectRoot, "README.md"), readmeContent, "utf-8");
      logger.info("README generated successfully");
    } catch (error) {
      logger.error("Error generating README:", error);
    }
  }
}


