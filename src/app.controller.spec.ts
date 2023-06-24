import { Test, TestingModule } from '@nestjs/testing';

import { packageJsonInfo } from '@shared/constants/package-json-info';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app info', () => {
      expect(appController.getAppVersion()).toBe(
        `App version: ${packageJsonInfo.version}`,
      );
    });
  });
});
