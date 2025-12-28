import logger from 'winston';

/**
 * Class containing all loads from the env file
 */
export class DictionaryCLI {
    protected BACKEND_PORT!: string;
    protected LOG_LEVEL!: string;
    protected DATABASE_TYPE!: string;
    protected DATABASE_PORT!: string;
    protected DATABASE_USR!: string;
    protected DATABASE_PASSWORD!: string;
    protected DATABASE_NAME!: string;
    protected DATABASE_HOST!: string;
    protected DATABASE_URI!: string;
    protected PROJECT_NAME!: string;
    protected UI_LIBRARY!: string;
    protected FRONTEND_PORT!: string;
    protected ANGULAR_VERSION!: string;
    protected PROJECT_DESCRIPTION!: string;
    protected USER_PROFILE!: string;
    protected HOME!: string;
    protected BACKEND_TYPE!: string;
    protected ENABLE_GENERATE_FRONTEND!: string;
    protected ENABLE_GENERATE_BACKEND!: string;
    protected ENABLE_GENERATE_DOCKER!: string;
    protected ENABLE_GENERATE_README!: string;

    private static readonly REQUIRED_KEYS = [
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
        'ENABLE_GENERATE_README'
    ] as const;

    constructor() {
        this.loadEnv();
    }

    private loadEnv(): void {
        for (const key of DictionaryCLI.REQUIRED_KEYS) {
            const value = this.env(key);
            (this as any)[key] = value;
        }
    }

    /**
     * Reads a REQUIRED env variable
     */
    private env(key: string): string {
        const value = process.env[key];

        if (!value) {
            logger.error(`Missing required environment variable: ${key}`);
            throw new Error()
        }

        return value;
    }
}
