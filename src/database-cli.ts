import { error } from "console";

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// load values from .env file
const DBtype = process.env.DATABASE_TYPE;
const DBPort = process.env.DATABASE_PORT;
const DBUsr = process.env.DATABASE_USR;
const DBPassword = process.env.DATABASE_PASSWORD;
const DBName = process.env.DATABASE_NAME;


function generatePostgress(projectRoot: string, projectNameFromEnv: string){
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
    restart: unless-stopped  # -> Added for automatic restart

volumes:
  ${projectNameFromEnv}-db-data:

networks:
  ${projectNameFromEnv}-network:
    driver: bridge
`;
    fs.writeFileSync(path.join(projectRoot, 'docker-compose.yml'), dockerComposeContent);
}

function generateMongo(projectRoot: string, projectNameFromEnv: string){
    const dockerComposeContent = `
version: '3.8'

services:
  ${projectNameFromEnv}db:
    container_name: ${projectNameFromEnv}db
    image: mongo:6.0  # Using MongoDB 6.0 (latest stable as of 2023)
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${DBUsr}
      MONGO_INITDB_ROOT_PASSWORD: ${DBPassword}
      MONGO_INITDB_DATABASE: ${DBName}
    ports:
      - "${DBPort}:${DBPort}"  # MongoDB default port is 27017
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
    fs.writeFileSync(path.join(projectRoot, 'docker-compose.yml'), dockerComposeContent);
}

//DATABASE
export function generateDatabase(projectRoot: string, projectNameFromEnv: string){
    switch(DBtype){
        case "postgress": 
            generatePostgress(projectRoot, projectNameFromEnv);
            break;
        case "mongo": 
            generateMongo(projectRoot, projectNameFromEnv);
            break;
        default:
            throw new Error("ERROR: Database type not found");
    }
}
