import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Base class that all generators must extend
 */
export class BaseCLI {
    /**
     * Generate subproject
     */
    public generate(): void{
        throw new Error
    }

    /**
     * Generate subproject aux
     */
    public auxGenerate(): string {
       throw new Error
    }

    /**
     * Generate folder structure
     */
    protected generateFolder(): void{
        throw new Error
    }
}