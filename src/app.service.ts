import { Injectable } from '@nestjs/common';

import { config } from './app.config';

@Injectable()
export class AppService {
  getVersion(): string {
    return `App version: ${config.app.version}`;
  }
}
