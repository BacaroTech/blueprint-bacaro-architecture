export class BaseCLI{
    public generate(): void{
        //to implement into sub classes
    }

    public auxGenerate(): string {
       //to implement into sub classes 
       throw new Error
    }
}