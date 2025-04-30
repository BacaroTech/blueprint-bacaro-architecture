const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// load values from .env file
const backendPort = process.env.BACKEND_PORT;
const DBtype = process.env.DATABASE_TYPE;
const DBPort = process.env.DATABASE_PORT;
const DBUsr = process.env.DATABASE_USR;
const DBPassword = process.env.DATABASE_PASSWORD;
const DBName = process.env.DATABASE_NAME;
const DBhost = process.env.DATABASE_HOST;

//BE
export function generateBackendProject(projectNameBE: string, backendPath: string){
  console.log('Setting up Express backend with TypeScript...');

  // Initialize npm project
  execSync(`npm init -y`, { 
    cwd: backendPath, 
    stdio: 'inherit' 
  });

  // Install dependencies
  execSync(`npm install express dotenv pg cors`, { 
    cwd: backendPath, 
    stdio: 'inherit' 
  });

  // Install dev dependencies
  execSync(`npm install -D nodemon typescript ts-node @types/node @types/express @types/pg @types/cors`, { 
    cwd: backendPath, 
    stdio: 'inherit' 
  });

  // Initialize TypeScript configuration
  execSync(`npx tsc --init`, { 
    cwd: backendPath, 
    stdio: 'inherit' 
  });

  // Install driver for connection DB
  if(DBtype === "postgress"){
    execSync(`npm install pg`, { 
      cwd: backendPath, 
      stdio: 'inherit' 
    });
  }else{
    //todo mongo configuration
  }

  // Create the src directory if it doesn't exist
  const srcDir = path.join(backendPath, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Create basic Express server with TypeScript
  const serverCode = 
`import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Client } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || ${backendPort};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_PORT', 'DATABASE_USR', 'DATABASE_PASSWORD', 'DATABASE_NAME', 'DATABASE_HOST'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error('Missing required environment variable');
  }
}

// Create a new pool instead of single client
const pool = new Client({
  user: process.env.DATABASE_USR,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    // Test the connection
    await pool.query('SELECT NOW()');
    res.json({
      status: 'success',
      message: 'Connected to PostgreSQL database',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Database connection error:', err);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Start server
pool.connect()
  .then(() => {
    app.listen(port, () => {
      console.log('Server running on http://localhost:'+port);
      console.log('Database connection established');
    });
  })
  .catch((err: Error) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end()
    .then(() => {
      console.log('Database connection closed');
      process.exit(0);
    })
    .catch((err: Error) => {
      console.error('Error closing database connection:', err);
      process.exit(1);
    });
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
`;

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
`DATABASE_PORT=${DBPort}
DATABASE_USR=${DBUsr}
DATABASE_PASSWORD=${DBPassword}
DATABASE_NAME=${DBName}
DATABASE_HOST=${DBhost}
BACKEND_PORT=${backendPort}`);

  // Create README.md
  fs.writeFileSync(path.join(backendPath, 'README.md'), 
`# ${projectNameBE}
avvio: npm run dev`);

  // Create .gitignore
  fs.writeFileSync(path.join(backendPath, '.gitignore'), 
  `node_modules
.env
dist`);

  console.log('Express backend with TypeScript and Docker setup complete!');
};