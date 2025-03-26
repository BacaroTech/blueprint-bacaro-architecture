const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// load values from .env file
const backendPort = process.env.BACKEND_PORT;

//BE
export const generateBackendProject = (projectNameBE: string, backendPath: string) => {
    console.log('Setting up Express backend with TypeScript...');
  
    // Initialize npm project
    execSync(`npm init -y`, { cwd: backendPath, stdio: 'inherit' });
  
    // Install dependencies
    execSync(`npm install express dotenv pg cors`, { cwd: backendPath, stdio: 'inherit' });
  
    // Install TypeScript and type definitions for dependencies
    execSync(`npm install --save-dev typescript ts-node @types/node @types/express @types/pg @types/cors`, { cwd: backendPath, stdio: 'inherit' });
  
    // Initialize TypeScript configuration
    execSync(`npx tsc --init`, { cwd: backendPath, stdio: 'inherit' });
  
    // Create the src directory if it doesn't exist
    const srcDir = path.join(backendPath, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
  
    // Create basic Express server with TypeScript
    const serverCode = `
      import express from 'express';
      import dotenv from 'dotenv';
      import cors from 'cors';
  
      dotenv.config();
  
      const app = express();
      const port = process.env.PORT || ${backendPort};
  
      app.use(cors());
      app.use(express.json());
  
      app.get('/', (req, res) => {
        res.send('Hello World!');
      });
  
      app.listen(port, () => {
        console.log(\`Server is running on http://localhost:\${port}\`);
      });
    `;
  
    fs.writeFileSync(path.join(srcDir, 'index.ts'), serverCode);
  
    // Update package.json to include start and build scripts
    const packageJsonPath = path.join(backendPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts = {
      ...packageJson.scripts,
      "start": "ts-node src/index.ts",
      "build": "tsc",
      "serve": "node dist/index.js"
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
    // Create .env file
    fs.writeFileSync(path.join(backendPath, '.env'), `DATABASE_URL=postgres://user:password@db:5432/mydatabase\nPORT=3000\n`);
  
    console.log('Express backend with TypeScript setup complete!');
  }