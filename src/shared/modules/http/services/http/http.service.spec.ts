import undici from 'undici';

import { HttpException } from '@nestjs/common';

import * as retryUtil from '@shared/modules/http/util/execute-with-retries';

import { HttpService } from './http.service';

// eslint-disable-next-line max-lines-per-function
describe('HttpService', () => {
  let service: HttpService;

  beforeEach(() => {
    vi.useRealTimers();
    service = new HttpService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('GET: calls undici.request with merged default headers and returns parsed JSON as data', async () => {
    const spy = vi
      .spyOn(undici, 'request')
      .mockResolvedValue(createResponse({ jsonData: { hello: 'world' } }));

    const res = await service.get<{ hello: string }>('https://example.com/hello', {
      headers: { 'x-test': '1' },
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const [urlArg, optionsArg] = spy.mock.calls[0] as any;
    expect(urlArg).toBe('https://example.com/hello');
    expect(optionsArg).toEqual(
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          accept: 'application/json',
          'content-type': 'application/json',
          'x-test': '1',
        }),
      }),
    );

    expect(res.data).toEqual({ hello: 'world' });
  });

  it('POST: stringifies object body but passes string body as-is', async () => {
    const spy = vi
      .spyOn(undici, 'request')
      .mockResolvedValue(createResponse({ jsonData: { created: true } }));

    await service.post('https://example.com/create', { a: 1 });
    let [, optionsObj] = spy.mock.calls[0] as any;
    expect(optionsObj.method).toBe('POST');
    expect(optionsObj.body).toBe(JSON.stringify({ a: 1 }));

    await service.post('https://example.com/create', 'raw-string-body');
    [, optionsObj] = spy.mock.calls[1] as any;
    expect(optionsObj.body).toBe('raw-string-body');
  });

  it('PUT/PATCH/DELETE: call undici.request with correct methods', async () => {
    const spy = vi
      .spyOn(undici, 'request')
      .mockResolvedValue(createResponse({ jsonData: { ok: true } }));

    await service.put('https://example.com/item/1', { x: 1 });
    await service.patch('https://example.com/item/1', { y: 2 });
    await service.delete('https://example.com/item/1');

    expect(spy).toHaveBeenCalledTimes(3);
    expect((spy.mock.calls[0] as any)[1].method).toBe('PUT');
    expect((spy.mock.calls[1] as any)[1].method).toBe('PATCH');
    expect((spy.mock.calls[2] as any)[1].method).toBe('DELETE');
  });

  it('adds AbortSignal when timeout option is provided', async () => {
    const spy = vi
      .spyOn(undici, 'request')
      .mockResolvedValue(createResponse({ jsonData: { ok: true } }));

    await service.get('https://example.com/timeout', { timeout: 500 });

    const optionsArg = (spy.mock.calls[0] as any)[1];
    expect(optionsArg.signal).toBeDefined();
    // not asserting exact type to avoid environment differences
  });

  it('throws HttpException on non-2xx and logs response body text', async () => {
    vi.spyOn(undici, 'request').mockResolvedValue(
      createResponse({ statusCode: 404, textData: 'Not Found' }),
    );

    await expect(service.get('https://example.com/missing')).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof HttpException && (err as HttpException).getStatus() === 404,
    );
  });

  it('falls back to text() when JSON parsing fails', async () => {
    vi.spyOn(undici, 'request').mockResolvedValue(
      createResponse({ jsonThrows: true, textData: 'plain text' }),
    );

    const res = await service.get<string>('https://example.com/plain');
    expect(res.data).toBe('plain text');
  });

  it('uses executeWithRetries when retries option is provided', async () => {
    const requestSpy = vi
      .spyOn(undici, 'request')
      .mockResolvedValue(createResponse({ jsonData: { ok: true } }));

    const retrySpy = vi
      .spyOn(retryUtil, 'executeWithRetries')
      // call the provided function immediately to simulate success on first attempt
      .mockImplementation(async (fn: any, _retries?: number, _interval?: number) => fn());

    const res = await service.get('https://example.com/retry', {
      retries: 3,
      retryIntervalMs: 1000,
    });

    expect(retrySpy).toHaveBeenCalledTimes(1);
    expect(retrySpy).toHaveBeenCalledWith(expect.any(Function), 3, 1000);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(res.data).toEqual({ ok: true });
  });
});

// Helpers
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createResponse({
  statusCode = 200,
  jsonData = { ok: true },
  textData,
  jsonThrows = false,
}: {
  statusCode?: number;
  jsonData?: any;
  textData?: string;
  jsonThrows?: boolean;
}) {
  const body = {
    async json() {
      if (jsonThrows) throw new Error('bad json');
      return jsonData;
    },
    async text() {
      if (typeof textData !== 'undefined') return textData;
      try {
        return typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
      } catch {
        return '';
      }
    },
  } as any;

  return {
    statusCode,
    headers: {},
    body,
  } as any; // shape compatible with Dispatcher.ResponseData for our tests
}
