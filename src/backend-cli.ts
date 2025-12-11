import { BaseCLI } from "./base-cli";
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import logger from 'winston';
import { BackendSpringbootCLI } from "./backend-springboot-cli";
import { BackendNodeCLI } from "./backend-node-cli";
import { error } from "console";

dotenv.config();

export class BackendCLI extends BaseCLI {

    private projectNameBE: string;
    private projectRoot: string;
    private backendPath: string;

    constructor(projectNameBE: string, projectRoot: string, backendPath: string){
        super();
        this.projectNameBE = projectNameBE;
        this.projectRoot = projectRoot;
        this.backendPath = backendPath;
    }

    public generate(): void {
        // Generazione backend
        switch (this.BACKEND_TYPE) {
            case 'springboot': {
                const backendCLI = new BackendSpringbootCLI(this.projectNameBE, this.projectRoot, this.backendPath);
                backendCLI.generate();
                break;
            }
            case 'node': {
                const backendCLI = new BackendNodeCLI(this.projectNameBE, this.projectRoot, this.backendPath);
                backendCLI.generate();
                break;
            }
            default: {
                logger.error("BE not recognize");
                throw error;
            }
        }
    }
}