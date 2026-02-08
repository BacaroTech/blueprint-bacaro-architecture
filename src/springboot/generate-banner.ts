import path from 'path';
import fs from 'fs';
import logger from 'winston';
import { DictionaryCLI } from '../utils/dictionary-cli';

export class BannerGenerator {
    static generateBanner(backendPath: string, projectNameBE: string): void {
            const bannerContent = `
       _____ _____  _____  _____ _   _  _____   ____   ____   ____ _______ 
      / ____|  __ \\|  __ \\|_   _| \\ | |/ ____| |  _ \\ / __ \\ / __ \\__   __|
     | (___ | |__) | |__) | | | |  \\| | |  __  | |_) | |  | | |  | | | |   
      \\___ \\|  ___/|  _  /  | | | . \` | | |_ | |  _ <| |  | | |  | | | |   
      ____) | |    | | \\ \\ _| |_| |\\  | |__| | | |_) | |__| | |__| | | |   
     |_____/|_|    |_|  \\_\\_____|_| \\_|\\_____| |____/ \\____/ \\____/  |_|   
                                                                            
     :: ${projectNameBE} :: Spring Boot :: ${DictionaryCLI.get('SPRINGBOOT_VERSION')}
    `;
    const resourcesPath = path.join(backendPath, 'src', 'main', 'resources');
    const bannerPath = path.join(resourcesPath, 'banner.txt');
    fs.writeFileSync(bannerPath, bannerContent);
    logger.info('Created custom banner.txt');
}
    
}