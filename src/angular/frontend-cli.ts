import * as logger from 'winston';
import { BaseCLI } from "../utils/base-cli";
import { DictionaryCLI } from "../utils/dictionary-cli";
import { AngularJson } from "./angular-json";
import { EnviromentSetup } from "./enviroment-setup";
import { ErrorHandling } from "./error-handle";
import { FolderStructure } from "./folder-structure";
import { GenerateAngular } from "./generate-angular";
import { HttpInterceptor } from "./http-interceptor";
import { InstallDependencies } from "./install-dependencies";
import { SetupUiLibrary } from "./setup-uiLibrary";
import { UpdateAppFiles } from "./update-appFiles";

export class FrontendCLI extends BaseCLI {
  private readonly projectName: string;
  private readonly projectRoot: string;
  private readonly frontendPath: string;

  public constructor(projectName: string, projectRoot: string, frontendPath: string) {
    super();
    this.projectName = projectName;
    this.projectRoot = projectRoot;
    this.frontendPath = frontendPath;
  }
    
  // Generate the entire frontend application
  public generate(): void {
    logger.info(`Generating Angular project "${this.projectName}" with version ${DictionaryCLI.get("ANGULAR_VERSION")}...`);

    GenerateAngular.generateAngularProject(this.projectRoot, this.projectName);
    InstallDependencies.installDependencies(this.projectRoot, this.frontendPath);
    FolderStructure.createFolderStructure(this.frontendPath);
    EnviromentSetup.updateEnvironmentFiles(this.frontendPath);
    UpdateAppFiles.updateAppFiles(this.frontendPath, this.projectName);
    ErrorHandling.setupErrorHandling(this.frontendPath);
    HttpInterceptor.setupHttpInterceptor(this.frontendPath);
    SetupUiLibrary.setupUiLibrary(this.frontendPath, this.projectName);
    AngularJson.updateAngularJson(this.frontendPath, this.projectName);

    logger.info(`Angular project "${this.projectName}" is configured and running on port ${DictionaryCLI.get("FRONTEND_PORT")}.`);
  }
}