import { Module } from '@nestjs/common';

import { HttpService } from './services/http/http.service';

// TODO Create register() method for this module to be able to set a config
@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
