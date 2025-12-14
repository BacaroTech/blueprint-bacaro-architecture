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

  public generate(): void {
    const readmeContent = `# ${this.PROJECT_NAME}
${this.PROJECT_DESCRIPTION}

## Documentazioni utili

Angular: [Link alla documentazione](https://v${this.ANGULAR_VERSION}.angular.io/docs)

Node express: [Link alla documentazione](https://nodejs.org/docs/latest/api/)

Postgres: [Link alla documentazione](https://node-postgres.com/)

---

This repository is a result of the BacaroTech CLI

Learn more about this repo: [Link to the repo](https://github.com/BacaroTech/blueprint-bacaro-architecture)
`;

    try {
      fs.writeFileSync(path.join(this.projectRoot, "README.md"), readmeContent, "utf-8");
      logger.info("README generated successfully");
    } catch (error) {
      logger.error("Error generating README:", error);
    }
  }
}
