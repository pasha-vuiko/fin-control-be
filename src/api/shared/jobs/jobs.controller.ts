import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JobExecutionDto } from '@api/shared/jobs/dto/job-execution.dto';

import { JobsService } from './jobs.service';

@ApiTags('Job Execution')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobExecutionService: JobsService) {}

  @Post('execute')
  async executeJob(@Body() dto: JobExecutionDto): Promise<void> {
    return await this.jobExecutionService.executeJob(dto);
  }
}
