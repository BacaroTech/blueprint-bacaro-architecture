import logger from 'winston';

/**
 * Class containing all loads from the .env file
 */
export class DictionaryCLI {
    protected static BACKEND_PORT: string;
    protected static ENABLE_UI_LIBRARY: string;
    protected static LOG_LEVEL: string;
    protected static DATABASE_TYPE: string;
    protected static DATABASE_PORT: string;
    protected static DATABASE_USR: string;
    protected static DATABASE_PASSWORD: string;
    protected static DATABASE_NAME: string;
    protected static DATABASE_HOST: string;
    protected static DATABASE_URI: string;
    protected static PROJECT_NAME: string;
    protected static UI_LIBRARY: string;
    protected static FRONTEND_PORT: string;
    protected static ANGULAR_VERSION: string;
    protected static PROJECT_DESCRIPTION: string;
    protected static USER_PROFILE: string;
    protected static HOME: string;
    protected static BACKEND_TYPE: string;
    protected static ENABLE_GENERATE_FRONTEND: string;
    protected static ENABLE_GENERATE_BACKEND: string;
    protected static ENABLE_GENERATE_DOCKER: string;
    protected static ENABLE_GENERATE_README: string;
    protected static SPRINGBOOT_VERSION: string;
    protected static JAVA_VERSION: string;
    protected static GROUP_ID: string;
    protected static BE_VERSION: string;
    protected static ENABLE_ACTUATOR: string;
    protected static ENABLE_LOMBOK: string;
    protected static ENABLE_VALIDATOR: string;
    protected static ENABLE_SWAGGER: string;
    protected static SWAGGER_VERSION: string;
    protected static ENABLE_SAMPLES: string;

    private static readonly REQUIRED_KEYS: string[] = [
        'BACKEND_PORT',
        'LOG_LEVEL',
        'DATABASE_TYPE',
        'DATABASE_PORT',
        'DATABASE_USR',
        'DATABASE_PASSWORD',
        'DATABASE_NAME',
        'DATABASE_HOST',
        'DATABASE_URI',
        'PROJECT_NAME',
        'UI_LIBRARY',
        'FRONTEND_PORT',
        'ANGULAR_VERSION',
        'PROJECT_DESCRIPTION',
        'USER_PROFILE',
        'HOME',
        'BACKEND_TYPE',
        'ENABLE_GENERATE_FRONTEND',
        'ENABLE_GENERATE_BACKEND',
        'ENABLE_GENERATE_DOCKER',
        'ENABLE_GENERATE_README',
        'ENABLE_UI_LIBRARY',
        'SPRINGBOOT_VERSION',
        'JAVA_VERSION',
        'GROUP_ID',
        'BE_VERSION',
        'ENABLE_ACTUATOR',
        'ENABLE_LOMBOK',
        'ENABLE_VALIDATOR',
        'ENABLE_SWAGGER',
        'SWAGGER_VERSION',
        'ENABLE_SAMPLES'
    ];

    private static initialized = false;

    /**
     * Initialize all environment variables
     */
    public static init(): void {
        if (this.initialized) {
            logger.warn('DictionaryCLI already initialized');
            return;
        }

        this.loadEnv();
        this.initialized = true;
        logger.info('DictionaryCLI initialized successfully');
    }

    /**
     * Load all required environment variables
     */
    private static loadEnv(): void {
        for (const key of DictionaryCLI.REQUIRED_KEYS) {
            const value = this.env(key);
            (this as any)[key] = value;
        }
    }

    /**
     * Reads a REQUIRED env variable
     */
    public static env(key: string): string {
        const value: string | undefined = process.env[key];

        if (!value) {
            logger.error(`Missing required environment variable: ${key}`);
            throw new Error(`Missing required environment variable: ${key}`);
        }

        return value;
    }

    /**
     * Get a specific environment variable value (after init)
     */
    public static get(key: string): string {
        if (!this.initialized) {
            DictionaryCLI.init();
        }
        return (this as any)[key];
    }
}