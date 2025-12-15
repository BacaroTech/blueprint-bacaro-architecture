import { DictionaryCLI } from "./dictionary-cli"

/**
 * Base class that all generators must extend
 */
export class BaseCLI extends DictionaryCLI {
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