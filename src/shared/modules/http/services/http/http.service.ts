import { UrlObject } from 'node:url';

import undici, { Dispatcher } from 'undici';

import { HttpException, Injectable } from '@nestjs/common';

import { executeWithRetries } from '@shared/modules/http/util/execute-with-retries';
import { Logger } from '@shared/modules/logger/loggers/logger';

import { IHttpReqOptions } from '../../interfaces/http-req-options.interface';
import { IHttpResponse } from '../../interfaces/http-response.interface';

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
    options?: IHttpReqOptions,
  ): Promise<IHttpResponse<T>> {
    return await this.executeRequest('GET', url, options);
  }

  public async post<T>(
    url: string | URL | UrlObject,
    body: any,
    options?: IHttpReqOptions,
  ): Promise<IHttpResponse<T>> {
    return await this.executeRequest('POST', url, options, body);
  }

  public async put<T>(
    url: string | URL | UrlObject,
    body: any,
    options?: IHttpReqOptions,
  ): Promise<IHttpResponse<T>> {
    return await this.executeRequest('PUT', url, options, body);
  }

  public async patch<T>(
    url: string | URL | UrlObject,
    body: any,
    options?: IHttpReqOptions,
  ): Promise<IHttpResponse<T>> {
    return await this.executeRequest('PATCH', url, options, body);
  }

  public async delete<T>(
    url: string | URL | UrlObject,
    options?: IHttpReqOptions,
  ): Promise<IHttpResponse<T>> {
    return await this.executeRequest('DELETE', url, options);
  }

  private async executeRequest<T>(
    method: HttpMethod,
    url: string | URL | UrlObject,
    options?: IHttpReqOptions,
    body?: any,
  ): Promise<IHttpResponse<T>> {
    if (options?.retries) {
      return await executeWithRetries(
        () => this.executeSingleRequest(method, url, options, body),
        options?.retries,
        options?.retryIntervalMs,
      );
    }

    return await this.executeSingleRequest(method, url, options, body);
  }

  private async executeSingleRequest<T>(
    method: HttpMethod,
    url: string | URL | UrlObject,
    options?: IHttpReqOptions,
    body?: any,
  ): Promise<IHttpResponse<T>> {
    if (body) {
      return await undici
        .request(url, {
          method,
          body: typeof body === 'object' ? JSON.stringify(body) : body,
          ...this.mergeOptionsWithDefaultOnes(options),
        })
        .then(res => this.handleResponseError(res))
        .then(res => this.addDataToResponse(res));
    }

    return await undici
      .request(url, {
        method,
        ...this.mergeOptionsWithDefaultOnes(options),
      })
      .then(res => this.handleResponseError(res))
      .then(res => this.addDataToResponse(res));
  }

  private async handleResponseError(response: ResponseData): Promise<ResponseData> {
    if (response.statusCode >= 400) {
      const msg = await response.body.text();

      this.logger.debug(msg);

      throw new HttpException(msg, response.statusCode);
    }

    return response;
  }

  private async addDataToResponse<T>(response: ResponseData): Promise<IHttpResponse<T>> {
    try {
      (response as any).data = await response.body.json();

      return response as IHttpResponse<T>;
    } catch {
      this.logger.debug(
        `Failed to parse JSON response data for response: ${JSON.stringify(response)}`,
      );

      (response as any).data = await response.body.text();

      return response as IHttpResponse<T>;
    }
  }

  private mergeOptionsWithDefaultOnes(options?: IHttpReqOptions): IHttpReqOptions {
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
