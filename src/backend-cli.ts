const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// load values from .env file
const backendPort = process.env.BACKEND_PORT;
const DBPort = process.env.DATABASE_PORT;
const DBUsr = process.env.DATABASE_USR;
const DBPassword = process.env.DATABASE_PASSWORD;
const DBName = process.env.DATABASE_NAME;

//BE
export const generateBackendProject = (projectNameBE: string, backendPath: string) => {
  console.log('Setting up Express backend with TypeScript...');

  // Initialize npm project
  execSync(`npm init -y`, { cwd: backendPath, stdio: 'inherit' });

  // Install dependencies
  execSync(`npm install express dotenv pg cors`, { cwd: backendPath, stdio: 'inherit' });

  // Install dev dependencies
  execSync(`npm install -D nodemon typescript ts-node @types/node @types/express @types/pg @types/cors`, { 
    cwd: backendPath, 
    stdio: 'inherit' 
  });

  // Initialize TypeScript configuration
  execSync(`npx tsc --init`, { cwd: backendPath, stdio: 'inherit' });

  // Create the src directory if it doesn't exist
  const srcDir = path.join(backendPath, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Create basic Express server with TypeScript
  const serverCode = `import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || ${backendPort};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send({message:'Hello World!'});
});

app.listen(port, () => {
  console.log(\`Server is running on http://localhost:\${port}\`);
});`;
  
  fs.writeFileSync(path.join(srcDir, 'index.ts'), serverCode);

  // Generate Dockerfile
  const dockerfileContent = `# Development stage with Nodemon
FROM node:16.20.2-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --include=dev

COPY . .

EXPOSE ${backendPort}

CMD ["npm", "run", "dev"]

# Production stage (uncomment to use)
# FROM node:16.20.2-alpine AS production
# WORKDIR /app
# COPY --from=development /app/node_modules ./node_modules
# COPY --from=development /app/package*.json ./
# COPY --from=development /app/dist ./dist
# EXPOSE ${backendPort}
# CMD ["node", "dist/index.js"]`;

  // Write Docker files
  fs.writeFileSync(path.join(backendPath, 'dockerfile'), dockerfileContent);

  // Update package.json scripts
  const packageJsonPath = path.join(backendPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.scripts = {
    "dev": "nodemon --exec ts-node src/index.ts",
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Create environment files
  fs.writeFileSync(path.join(backendPath, '.env'), 
  `DATABASE_URL=postgres://${DBUsr}:${DBPassword}@db:${DBPort}/${DBName}
PORT=${backendPort}`);

  // Create README.md
  fs.writeFileSync(path.join(backendPath, 'README.md'), 
`# ${projectNameBE}
avvio: npm run dev`);

  // Create .gitignore
  fs.writeFileSync(path.join(backendPath, '.gitignore'), 
  `node_modules
.env
dist
dockerfile`);

  console.log('Express backend with TypeScript and Docker setup complete!');
};