import { BaseCLI } from "./base-cli";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import logger from "winston";

dotenv.config();

export class ReadMeCLI extends BaseCLI {
  private projectRoot: string;

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
