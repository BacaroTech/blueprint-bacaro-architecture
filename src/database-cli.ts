import { BaseCLI } from "./base-cli";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

// load values from .env file
const projectNameFromEnv = (process.env.PROJECT_NAME)?.toLocaleLowerCase();
const DBtype = process.env.DATABASE_TYPE;
const DBPort = process.env.DATABASE_PORT;
const DBUsr = process.env.DATABASE_USR;
const DBPassword = process.env.DATABASE_PASSWORD;
const DBName = process.env.DATABASE_NAME;

export class DatabaseCLI extends BaseCLI{
  private projectRoot: string = "";

  public constructor(projectRoot: string){
    super();
    this.projectRoot = projectRoot;
  }

  private generatePostgress(){
    const dockerComposeContent = `
version: '3.8'

services:
  ${projectNameFromEnv}db:
    container_name: ${projectNameFromEnv}db
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: ${DBPassword}
      POSTGRES_USER: ${DBUsr}
      POSTGRES_DB: ${DBName}
    ports:
      - "${DBPort}:${DBPort}"
    volumes:
      - ${projectNameFromEnv}-db-data:/var/lib/postgresql/data
    networks:
      - ${projectNameFromEnv}-network
    restart: unless-stopped 

volumes:
  ${projectNameFromEnv}-db-data:

networks:
  ${projectNameFromEnv}-network:
    driver: bridge
`;
    fs.writeFileSync(path.join(this.projectRoot, 'docker-compose.yml'), dockerComposeContent);
  }
  
  private generateMongo(){
    const dockerComposeContent = `
version: '3.8'

services:
  ${projectNameFromEnv}db:
    container_name: ${projectNameFromEnv}db
    image: mongo:6.0
    ports:
      - "${DBPort}:${DBPort}"
    volumes:
      - ${projectNameFromEnv}-db-data:/data/db
    networks:
      - ${projectNameFromEnv}-network
    restart: unless-stopped
    # Optional health check for MongoDB
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  ${projectNameFromEnv}-db-data:

networks:
  ${projectNameFromEnv}-network:
    driver: bridge
`;
    fs.writeFileSync(path.join(this.projectRoot, 'docker-compose.yml'), dockerComposeContent);
  }
  
  //DATABASE
  public generate(){
    switch(DBtype){
      case "postgress": 
        this.generatePostgress();
        break;
      case "mongo": 
        this.generateMongo();
        break;
      default:
        throw new Error("Database type not found");
    }
  }
}