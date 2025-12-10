import { BaseCLI } from "./base-cli";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import logger from "winston";

dotenv.config();

export class ReadMeCLI extends BaseCLI {
  private projectRoot: string;
  private projectName: string;
  private projectDescription: string;
  private angularVersion: string;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;

    // load values from .env file
    this.projectName = process.env.PROJECT_NAME ?? "Project Name";
    this.projectDescription = process.env.PROJECT_DESCRIPTION ?? "Project description not provided.";
    this.angularVersion = process.env.ANGULAR_VERSION ?? "latest";
  }

  public generate(): void {
    const readmeContent = `# ${this.projectName}
${this.projectDescription}

## Documentazioni utili

Angular: [Link alla documentazione](https://v${this.angularVersion}.angular.io/docs)

Node express: [Link alla documentazione](https://nodejs.org/docs/latest/api/)

Postgres: [Link alla documentazione](https://node-postgres.com/)

---

Questa repository è frutto della BacaroTech CLI

Scopri di più su questa repo: [Link alla repo](https://github.com/BacaroTech/blueprint-bacaro-architecture)
`;

    try {
      fs.writeFileSync(path.join(this.projectRoot, "README.md"), readmeContent, "utf-8");
      logger.info("README generated successfully");
    } catch (error) {
      logger.error("Error generating README:", error);
    }
  }
}
