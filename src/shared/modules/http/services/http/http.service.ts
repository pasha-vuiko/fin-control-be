import { UrlObject } from 'node:url';

import undici, { Agent, Dispatcher } from 'undici';

import { Injectable } from '@nestjs/common';

import { HttpServiceException } from '@shared/modules/http/exceptions/exception-classes';
import { Logger } from '@shared/modules/logger/loggers/logger';

import { HttpReqOptions } from '../../interfaces/http-req-options.interface';
import { HttpResponse } from '../../interfaces/http-response.interface';

import HttpMethod = Dispatcher.HttpMethod;
import ResponseData = Dispatcher.ResponseData;

const defaultHeaders = {
  accept: 'application/json',
  'content-type': 'application/json',
};

/**
 * HTTP service built in top of undici library request()
 */
@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);

  public async get<T>(
    url: string | URL | UrlObject,
    options?: HttpReqOptions,
  ): Promise<HttpResponse<T>> {
    return await this.executeRequest('GET', url, options);
  }

  public async post<T>(
    url: string | URL | UrlObject,
    body: any,
    options?: HttpReqOptions,
  ): Promise<HttpResponse<T>> {
    return await this.executeRequest('POST', url, options, body);
  }

  public async put<T>(
    url: string | URL | UrlObject,
    body: any,
    options?: HttpReqOptions,
  ): Promise<HttpResponse<T>> {
    return await this.executeRequest('PUT', url, options, body);
  }

  public async patch<T>(
    url: string | URL | UrlObject,
    body: any,
    options?: HttpReqOptions,
  ): Promise<HttpResponse<T>> {
    return await this.executeRequest('PATCH', url, options, body);
  }

  public async delete<T>(
    url: string | URL | UrlObject,
    options?: HttpReqOptions,
  ): Promise<HttpResponse<T>> {
    return await this.executeRequest('DELETE', url, options);
  }

  private async executeRequest<T>(
    method: HttpMethod,
    url: string | URL | UrlObject,
    options?: HttpReqOptions,
    body?: any,
  ): Promise<HttpResponse<T>> {
    const agent = new Agent({ allowH2: true }).compose(
      undici.interceptors.retry({
        maxRetries: options?.retries,
        maxTimeout: options?.retryIntervalMs,
      }),
      undici.interceptors.deduplicate(),
    );

    if (body) {
      return await undici
        .request(url, {
          method,
          // @ts-expect-error incompatible type, but was compatible in the previous version
          dispatcher: agent,
          body: typeof body === 'object' ? JSON.stringify(body) : body,
          ...this.mergeOptionsWithDefaultOnes(options),
        })
        .then(res => this.handleResponseError(res))
        .then(res => this.addDataToResponse(res));
    }

    return await undici
      .request(url, {
        method,
        // @ts-expect-error incompatible type, but was compatible in the previous version
        dispatcher: agent,
        ...this.mergeOptionsWithDefaultOnes(options),
      })
      .then(res => this.handleResponseError(res))
      .then(res => this.addDataToResponse(res));
  }

  private async handleResponseError(response: ResponseData): Promise<ResponseData> {
    if (response.statusCode >= 400) {
      const msg = await response.body.text();

      this.logger.debug(msg);

      throw new HttpServiceException(msg, response.statusCode);
    }

    return response;
  }

  private async addDataToResponse<T>(response: ResponseData): Promise<HttpResponse<T>> {
    try {
      (response as any).data = await response.body.json();

      return response as HttpResponse<T>;
    } catch {
      this.logger.debug(
        `Failed to parse JSON response data for response: ${JSON.stringify(response)}`,
      );

      (response as any).data = await response.body.text();

      return response as HttpResponse<T>;
    }
  }

  private mergeOptionsWithDefaultOnes(options?: HttpReqOptions): HttpReqOptions {
    const abortSignalOptions = options?.timeout
      ? { signal: AbortSignal.timeout(options.timeout) }
      : {};

    return {
      ...(options ?? {}),
      ...abortSignalOptions,
      headers: {
        ...defaultHeaders,
        ...(options?.headers ?? {}),
      },
    };
  }
}
