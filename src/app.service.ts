import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): string {
    return `App version: ${process.env.APP_VERSION}`;
  }
}
