export class DictionaryCLI {
    protected BACKEND_PORT: string;
    protected LOG_LEVEL: string;
    protected DATABASE_TYPE: string;
    protected DATABASE_PORT: string;
    protected DATABASE_USR: string;
    protected DATABASE_PASSWORD: string;
    protected DATABASE_NAME: string;
    protected DATABASE_HOST: string;
    protected DATABASE_URI: string;
    protected PROJECT_NAME: string;
    protected UI_LIBRARY: string;
    protected FRONTEND_PORT: string;
    protected ANGULAR_VERSION: string;
    protected PROJECT_DESCRIPTION: string;
    protected USER_PROFILE: string;
    protected HOME: string;
    protected BACKEND_TYPE: string;

    /**
     * Load all values from .env file
     */
    constructor(){
        this.BACKEND_PORT = process.env.BACKEND_PORT ?? "";
        this.LOG_LEVEL = process.env.LOG_LEVEL ?? "";
        this.DATABASE_TYPE = process.env.DATABASE_TYPE ?? "";
        this.DATABASE_PORT = process.env.DATABASE_PORT ?? "";
        this.DATABASE_USR = process.env.DATABASE_USR ?? "";
        this.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? "";
        this.DATABASE_NAME = process.env.DATABASE_NAME ?? "";
        this.DATABASE_HOST = process.env.DATABASE_HOST ?? "";
        this.DATABASE_URI = process.env.DATABASE_URI ?? "";
        this.PROJECT_NAME = process.env.PROJECT_NAME ?? "";
        this.UI_LIBRARY = process.env.UI_LIBRARY ?? "";
        this.FRONTEND_PORT = process.env.UI_LIBRARY ?? "";
        this.ANGULAR_VERSION = process.env.ANGULAR_VERSION ?? "";
        this.PROJECT_DESCRIPTION = process.env.PROJECT_DESCRIPTION ?? "";
        this.USER_PROFILE = process.env.USER_PROFILE ?? "";
        this.HOME = process.env.HOME ?? "";
        this.BACKEND_TYPE = process.env.BACKEND_TYPE ?? "";
    }
}