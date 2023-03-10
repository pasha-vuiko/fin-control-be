import { Injectable } from '@nestjs/common';
import { packageJsonInfo } from '@shared/constants/package-json-info';

@Injectable()
export class AppService {
  getVersion(): string {
    return `App version: ${packageJsonInfo.version}`;
  }
}
