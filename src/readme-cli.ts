import { BaseCLI } from "./utils/base-cli";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import logger from "winston";
import { DictionaryCLI } from "./utils/dictionary-cli";

dotenv.config();

export class ReadMeCLI extends BaseCLI {
  private readonly projectRoot: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  private docByBackend(): string {
    switch (DictionaryCLI.get("HOME")) {
      case 'node':
        return "Node express: [Link alla documentazione](https://nodejs.org/docs/latest/api/)"
      case 'springboot':
        return "Springboot: [Link alla documentazione](https://docs.spring.io/spring-boot/index.html)"
      default:
        return ""
    }
  }

  private docByDB(): string {
    switch (DictionaryCLI.get("DATABASE_TYPE")) {
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
      `# ${DictionaryCLI.get("PROJECT_NAME")}
${DictionaryCLI.get("PROJECT_DESCRIPTION")}

## Useful documentation

Angular: [Link alla documentazione](https://v${DictionaryCLI.get("ANGULAR_VERSION")}.angular.io/docs)

${this.docByBackend()}

${this.docByDB()}

---

This repository is a result of the BacaroTech CLI

Learn more about this repo: [Link to the repo](https://github.com/BacaroTech/blueprint-bacaro-architecture)`.trim();
    try {
      fs.writeFileSync(path.join(this.projectRoot, "README.md"), readmeContent, "utf-8");
      logger.info("README generated successfully");
    } catch (error) {
      logger.error("Error generating README:", error);
      throw new Error();
    }
  }
}


