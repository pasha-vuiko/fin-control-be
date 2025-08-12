import { HttpService } from '@shared/modules/http/services/http/http.service';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';
import { DKronService } from './d-kron.service';

describe('DKronService', () => {
  let service: DKronService;
  let httpService: HttpService;

  beforeEach(async () => {
    httpService = getMockedInstance(HttpService);
    service = new DKronService({ dKronUrl: '', executeJobEndpoint: '' }, httpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
