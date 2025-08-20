import { getMockedInstance } from '../../../../test/utils/get-mocked-instance.util';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  beforeEach(async () => {
    service = getMockedInstance(JobsService);

    controller = new JobsController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
