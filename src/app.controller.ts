import { Controller, Get, Version } from '@nestjs/common';
import { VERSION_NEUTRAL } from '@nestjs/common/interfaces/version-options.interface';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Version(VERSION_NEUTRAL)
  @Get('/version')
  getAppVersion(): string {
    return this.appService.getVersion();
  }
}
