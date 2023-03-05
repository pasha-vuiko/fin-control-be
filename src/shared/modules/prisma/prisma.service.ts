import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '@shared/modules/logger/app-logger';
import { PrismaClient } from '../../../../prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new AppLogger(PrismaService.name);

  constructor() {
    super({
      errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    });
  }

  onModuleInit(): void {
    this.$connect()
      .then(() => this.logger.log('Successfully connected to the DB'))
      .catch((e: Error | any) =>
        this.logger.error(
          'Failed to connect to the DB, the connection retry will be done on the first request to the DB',
          e,
        ),
      );
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    this.$on('beforeExit', async (): Promise<void> => {
      await this.$disconnect();
      await app.close();
    });
  }
}
