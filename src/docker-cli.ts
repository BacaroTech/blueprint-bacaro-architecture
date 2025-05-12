import { BaseCLI } from "./base-cli";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

export class DockerCLI extends BaseCLI{
    public constructor(){
        super();
    }
    
    generate(){
        logger.info("Docker is empty");
    }
}

  