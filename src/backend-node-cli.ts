import { BaseCLI } from "./base-cli";
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import logger from 'winston';
import { error } from "console";

dotenv.config();

/**
 * Backend Node generation 
 */
export class BackendNodeCLI extends BaseCLI {
  private readonly projectRoot: string;
  private readonly backendPath: string;
  private readonly projectNameBE: string;

  public constructor(projectNameBE: string, projectRoot: string, backendPath: string) {
    super();
    this.projectNameBE = projectNameBE;
    this.projectRoot = projectRoot;
    this.backendPath = backendPath;
  }

  /**
   * Generate the different folders with the correct tree structure
   */
  protected generateFolder(): void {
    const root = path.join(this.backendPath, 'src');
    logger.info('Target root:', root);

    if (!fs.existsSync(root)) {
      logger.error('Target folder does not exist:', root);
      throw new Error();
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

  /**
   * Generate the backend piece to handle the logs
   * @returns Content of file logger.ts
   */
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
const port = process.env.PORT || ${this.BACKEND_PORT};

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
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        UserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
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

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    logger.info('Retrieved ' + result.rows.length + ' users');
    res.json(result.rows);
  } catch (err: any) {
    logger.error('Error fetching users:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      logger.warn('User not found with id: ' + id);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    logger.info('Retrieved user with id: ' + id);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error('Error fetching user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO users (name, email, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [name, email]
    );
    
    logger.info('Created new user with id: ' + result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    logger.error('Error creating user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
    }
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    
    if (result.rows.length === 0) {
      logger.warn('User not found for update with id: ' + id);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    logger.info('Updated user with id: ' + id);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error('Error updating user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      logger.warn('User not found for deletion with id: ' + id);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    logger.info('Deleted user with id: ' + id);
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (err: any) {
    logger.error('Error deleting user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

pool.connect()
  .then(async () => {
    // Create users table if it doesn't exist
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    \`);
    logger.info('Users table ready');
    
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
const port = process.env.PORT || ${this.BACKEND_PORT};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error('Missing required environment variable: ' + envVar);
    throw new Error('Missing required environment variable: ' + envVar);
  }
}

const mongoUri = process.env.DATABASE_URI!;
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
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// User schema with timestamps
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { timestamps: true });

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

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    logger.info('Retrieved ' + users.length + ' users');
    res.json(users);
  } catch (err: any) {
    logger.error('Error fetching users:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      logger.warn('User not found with id: ' + id);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    logger.info('Retrieved user with id: ' + id);
    res.json(user);
  } catch (err: any) {
    logger.error('Error fetching user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
    }
    
    const user = new User({ name, email });
    await user.save();
    
    logger.info('Created new user with id: ' + user._id);
    res.status(201).json(user);
  } catch (err: any) {
    logger.error('Error creating user:', err);
    
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }
    
    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      logger.warn('User not found for update with id: ' + id);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    logger.info('Updated user with id: ' + id);
    res.json(user);
  } catch (err: any) {
    logger.error('Error updating user:', err);
    
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      logger.warn('User not found for deletion with id: ' + id);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    logger.info('Deleted user with id: ' + id);
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (err: any) {
    logger.error('Error deleting user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
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
});`.trim();
  }

  private getServerCode(): string {
    return this.DATABASE_TYPE === 'mongo' ? this.getMongoServer() : this.getPostgresServer();
  }

  private writeEnvFile() {
    //load configuration for database
    let envFileContent: string = 
`DATABASE_PORT=${this.DATABASE_PORT}
DATABASE_USR=${this.DATABASE_USR}
DATABASE_PASSWORD=${this.DATABASE_PASSWORD}
DATABASE_NAME=${this.DATABASE_NAME}
DATABASE_URI=${this.DATABASE_URI}
DATABASE_HOST=${this.DATABASE_HOST}
BACKEND_PORT=${this.BACKEND_PORT}
LOG_LEVEL=${this.LOG_LEVEL}`.trim();

    fs.writeFileSync(path.join(this.backendPath, '.env'), envFileContent);
  }

  private writeReadme() {
    const readMeContet = `# ${this.projectRoot}
Local startup: \`npm run dev\`

## Logging
Logs are stored in the \`logs\` directory with the following files:
- \`error.log\`: Only error logs
- \`combined.log\`: All logs
- \`exceptions.log\`: Uncaught exceptions

Log level can be configured via the \`LOG_LEVEL\` environment variable (debug, info, warn, error)`.trim();

    fs.writeFileSync(path.join(this.backendPath, 'README.md'), readMeContet);
  }

  private writeGitignore() {
    const gitIngoreContent: string = `node_modules
.env
dist
logs`.trim();

    fs.writeFileSync(path.join(this.backendPath, '.gitignore'), gitIngoreContent);
  }

  private writeTSconfigJson() {
    const gitIngoreContent: string = `
    {
      "compilerOptions": {
        "target": "es2017",
        "module": "commonjs",
        "moduleResolution": "node",
        "rootDir": "src",
        "outDir": "dist",
        "esModuleInterop": true,
        "strict": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
      }
    }`.trim();
    fs.writeFileSync(path.join(this.backendPath, 'tsconfig.json'), gitIngoreContent);
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
    if (this.DATABASE_TYPE === 'postgres') {
      execSync(`npm install pg @types/pg`, { cwd: backendCWD, stdio: 'inherit' });
    } else if (this.DATABASE_TYPE === 'mongo') {
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
    const typeDeclaration = 
    `declare module 'swagger-jsdoc' {
      const swaggerJsDoc: any;
      export default swaggerJsDoc;
    }`.trim();
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

    // Merge without overwriting
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "nodemon --exec ts-node src/index.ts",
      build: "tsc",
      start: "node dist/index.js"
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Create .env file
    this.writeEnvFile();

    // Create README and .gitignore
    this.writeReadme();
    this.writeGitignore();

    // Create tsconfig.json
    this.writeTSconfigJson();

    // Generate folders
    this.generateFolder();

    logger.info('Express backend with TypeScript and Winston logging setup complete!');
  }
}