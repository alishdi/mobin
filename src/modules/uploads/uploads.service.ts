import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadsService {
  private readonly baseDir = join(process.cwd(), 'public', 'assets');

  constructor() {
    const folders = ['brands', 'vehicles', 'models', 'sliders'];
    folders.forEach(folder => {
      const dirPath = join(this.baseDir, folder);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    });
  }


  static getDestinationPath(folder: string): string {
    const validFolders = ['brands', 'vehicles', 'models', 'sliders'];
    
    if (!folder || !validFolders.includes(folder)) {
      throw new BadRequestException('پوشه مقصد نامعتبر است. مجاز: brands, vehicles, models, sliders');
    }
    
    return join(process.cwd(), 'public', 'assets', folder);
  }

  // متد معمولی برای استفاده‌های دیگر در صورت نیاز
  getDestination(folder: string): string {
    return UploadsService.getDestinationPath(folder);
  }
}