import { DictionaryCLI } from "./dictionary-cli"

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