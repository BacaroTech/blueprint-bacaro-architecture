import { BaseCLI } from "./base-cli";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

export class DockerCLI extends BaseCLI{
    public constructor(){
        super();
    }
    
    generate(){
        console.log("Docker is empty");
    }
}

  