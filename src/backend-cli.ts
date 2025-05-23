import { BaseCLI } from "./base-cli";

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('winston');

dotenv.config();

// load values from .env file
const BackendPort = process.env.BACKEND_PORT;
const LogLevel = process.env.LOG_LEVEL;
const DBtype = process.env.DATABASE_TYPE;
const DBPort = process.env.DATABASE_PORT;
const DBUsr = process.env.DATABASE_USR;
const DBPassword = process.env.DATABASE_PASSWORD;
const DBName = process.env.DATABASE_NAME;
const DBhost = process.env.DATABASE_HOST;
const DBUri = process.env.DATABASE_URI;

export class BackendCLI extends BaseCLI{
  projectRoot: string = ""; 
  backendPath: string = "";
  projectNameBE: string = "";

  public constructor(projectNameBE: string, projectRoot: string, backendPath: string){
    super();
    this.projectNameBE = projectNameBE;
    this.projectRoot = projectRoot;
    this.backendPath = backendPath;
  }

  //generate folder structure
  private generateFolder() {
    const root = path.join(this.backendPath, 'src');
    logger.info('Target root:', root);
  
    if (!fs.existsSync(root)) {
      logger.error('Target folder does not exist:', root);
      return;
    }
  
    const folders = ['config', 'database', 'routes', 'utils', 'middleware', 'models', 'controllers', 'helpers', 'views'];
  
    folders.forEach(folder => {
      const folderPath = path.join(root, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        logger.info('Created:', folderPath);
      }
    });
  }

  private getLoggerConfig(): string {
    return `
// src/config/logger.ts
import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => \`[\${info.timestamp}] \${info.level}: \${info.message}\`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
    }),
  ],
});

// Morgan stream for HTTP request logging
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, morganStream };
`.trim();
  }

  private getPostgresServer(): string {
    return `
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Client } from 'pg';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import morgan from 'morgan';
import { logger, morganStream } from './config/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || ${BackendPort};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_PORT', 'DATABASE_USR', 'DATABASE_PASSWORD', 'DATABASE_NAME', 'DATABASE_HOST'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error('Missing required environment variable: ' + envVar);
    throw new Error('Missing required environment variable: ' + envVar);
  }
}

const pool = new Client({
  user: process.env.DATABASE_USR,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
});

app.use(cors());
app.use(express.json());

// HTTP request logging
app.use(morgan('combined', { stream: morganStream }));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated Swagger docs',
    },
    servers: [
      {
        url: 'http://localhost:' + port
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Success response
 */
app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Successfully connected to PostgreSQL database');
    res.json({
      status: 'success',
      message: 'Connected to PostgreSQL database',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    logger.error('Database connection error:', err);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

pool.connect()
  .then(() => {
    app.listen(port, () => {
      logger.info('Server running on http://localhost:' + port);
      logger.info('Swagger docs available at http://localhost:' + port + '/api-docs');
      logger.info('Database connection established');
    });
  })
  .catch((err: Error) => {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  pool.end()
    .then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    })
    .catch((err: Error) => {
      logger.error('Error closing database connection:', err);
      process.exit(1);
    });
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});
`.trim();
  }
  
  private getMongoServer(): string {
    return `
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import morgan from 'morgan';
import { logger, morganStream } from './config/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || ${BackendPort};

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error('Missing required environment variable: ' + envVar);
    throw new Error('Missing required environment variable: ' + envVar);
  }
}

const mongoUri = process.env.MONGO_URI!;
app.use(cors());
app.use(express.json());

// HTTP request logging
app.use(morgan('combined', { stream: morganStream }));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated Swagger docs',
    },
    servers: [
      {
        url: 'http://localhost:' + port
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Example schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});
const User = mongoose.model('User', userSchema);

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Mongoose status
 */
app.get('/', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState];

  logger.info(\`Mongoose connection status: \${status}\`);
  
  res.json({
    status: dbState === 1 ? 'success' : 'error',
    message: 'Mongoose is ' + status,
    timestamp: new Date().toISOString()
  });
});

mongoose.connect(mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB with Mongoose');
    app.listen(port, () => {
      logger.info('Server running on http://localhost:' + port);
      logger.info('Swagger docs available at http://localhost:' + port + '/api-docs');
    });
  })
  .catch((err: Error) => {
    logger.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  mongoose.connection.close()
    .then(() => {
      logger.info('Mongoose connection closed');
      process.exit(0);
    })
    .catch((err: Error) => {
      logger.error('Error closing Mongoose connection:', err);
      process.exit(1);
    });
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});
`.trim();
  }
  
  private getServerCode(): string {
    return DBtype === 'mongo' ? this.getMongoServer() : this.getPostgresServer();
  }
  
  private writeEnvFile() {
    //load configuration for database
    let content: string = DBtype === "Mongo" ? 
`MONGO_URI=${DBUri}
MONGO_DB_NAME=${DBName}`
    : 
`DATABASE_PORT=${DBPort}
DATABASE_USR=${DBUsr}
DATABASE_PASSWORD=${DBPassword}
DATABASE_NAME=${DBName}
DATABASE_HOST=${DBhost}`;

    //common configuration
    content += 
`\nBACKEND_PORT=${BackendPort}
LOG_LEVEL=${LogLevel}`;

    fs.writeFileSync(path.join(this.backendPath, '.env'), content);
  }
  
  private writeReadme() {
    fs.writeFileSync(path.join(this.backendPath, 'README.md'),
`# ${this.projectRoot}
Avvio locale: \`npm run dev\`

## Logging
Logs are stored in the \`logs\` directory with the following files:
- \`error.log\`: Only error logs
- \`combined.log\`: All logs
- \`exceptions.log\`: Uncaught exceptions

Log level can be configured via the \`LOG_LEVEL\` environment variable (debug, info, warn, error)`);
  }
  
  private writeGitignore() {
    fs.writeFileSync(path.join(this.backendPath, '.gitignore'), 
`node_modules
.env
dist
logs`);
  }
  
  public generate() {
    logger.info('Setting up Express backend with TypeScript...');
  
    const backendCWD = this.backendPath;
    const srcDir = path.join(backendCWD, 'src');
  
    // Init npm
    execSync(`npm init -y`, { cwd: backendCWD, stdio: 'inherit' });
  
    // Base dependencies
    execSync(`npm install express dotenv cors morgan winston`, { cwd: backendCWD, stdio: 'inherit' });
  
    // Dev dependencies
    execSync(`npm install -D nodemon typescript ts-node @types/node @types/express @types/cors @types/morgan @types/winston`, {
      cwd: backendCWD,
      stdio: 'inherit'
    });
  
    // Install DB driver
    if (DBtype === 'postgress') {
      execSync(`npm install pg @types/pg`, { cwd: backendCWD, stdio: 'inherit' });
    } else if (DBtype === 'mongo') {
      execSync(`npm install mongoose`, { cwd: backendCWD, stdio: 'inherit' });
    }
  
    // Init TypeScript config
    execSync(`npx tsc --init`, { cwd: backendCWD, stdio: 'inherit' });
  
    // Swagger dependencies
    execSync(`npm install swagger-ui-express`, { cwd: backendCWD, stdio: 'inherit' });
    execSync(`npm install swagger-jsdoc`, { cwd: backendCWD, stdio: 'inherit' });
    execSync(`npm i --save-dev @types/swagger-jsdoc`, { cwd: backendCWD, stdio: 'inherit' });
    execSync(`npm install -D @types/swagger-ui-express`, { cwd: backendCWD, stdio: 'inherit' });
  
    // Create src directory
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
  
    // Create src/types and write swagger-jsdoc.d.ts
    const typesDir = path.join(srcDir, 'types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    const typeDeclaration = `declare module 'swagger-jsdoc' {
    const swaggerJsDoc: any;
    export default swaggerJsDoc;
  }
  `;
    fs.writeFileSync(path.join(typesDir, 'swagger-jsdoc.d.ts'), typeDeclaration);
  
    // Create logs directory
    const logsDir = path.join(backendCWD, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  
    // Write logger configuration
    const loggerConfig = this.getLoggerConfig();
    const configDir = path.join(srcDir, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(path.join(configDir, 'logger.ts'), loggerConfig);
  
    // Write main server file
    const serverCode = this.getServerCode();
    fs.writeFileSync(path.join(srcDir, 'index.ts'), serverCode);
  
    // Update package.json scripts
    const packageJsonPath = path.join(backendCWD, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts = {
      dev: 'nodemon --exec ts-node src/index.ts'
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
    // Create .env file
    this.writeEnvFile();
  
    // Create README and .gitignore
    this.writeReadme();
    this.writeGitignore();
  
    // Generate folders
    this.generateFolder();
  
    logger.info('Express backend with TypeScript and Winston logging setup complete!');
  }
}