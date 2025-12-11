import { BaseCLI } from "./base-cli";
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import logger from 'winston';

dotenv.config();

export class BackendSpringbootCLI extends BaseCLI {
    projectRoot: string = "";
    backendPath: string = "";
    projectNameBE: string = "";

    public constructor(projectNameBE: string, projectRoot: string, backendPath: string) {
        super();
        this.projectNameBE = projectNameBE;
        this.projectRoot = projectRoot;
        this.backendPath = backendPath;
    }

    protected generateFolder(): void {
        
    }

    public generate(): void {
        
    }
}