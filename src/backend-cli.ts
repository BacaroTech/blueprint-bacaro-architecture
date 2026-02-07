import { BaseCLI } from "./base-cli";
import dotenv from "dotenv";
import logger from 'winston';
import { BackendSpringbootCLI } from "./springboot/backend-springboot-cli";
import { BackendNodeCLI } from "./backend-node-cli";

dotenv.config();

/**
 * Backend generation aux class
 */
export class BackendCLI extends BaseCLI {

    private readonly projectNameBE: string;
    private readonly projectRoot: string;
    private readonly backendPath: string;

    constructor(projectNameBE: string, projectRoot: string, backendPath: string){
        super();
        this.projectNameBE = projectNameBE;
        this.projectRoot = projectRoot;
        this.backendPath = backendPath;
    }

    public generate(): void {
        // Backend generation
        switch (this.BACKEND_TYPE) {
            case 'springboot': {
                logger.info('Backend generation: springboot')
                const backendCLI = new BackendSpringbootCLI(this.projectNameBE, this.projectRoot, this.backendPath);
                backendCLI.generate();
                break;
            }
            case 'node': {
                logger.info('Backend generation: node')
                const backendCLI = new BackendNodeCLI(this.projectNameBE, this.projectRoot, this.backendPath);
                backendCLI.generate();
                break;
            }
            default: {
                logger.error("BE not recognize");
                throw new Error();
            }
        }
    }
}