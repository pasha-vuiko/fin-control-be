import request from 'supertest';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { packageJsonInfo } from '@shared/constants/package-json-info';

import { config } from '../../src/app.config';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      //@ts-expect-error FastifyAdapter is not compatible with the default NestApplication
      new FastifyAdapter(config.app.fastify),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(`App version: ${packageJsonInfo.version}`);
  });
});
