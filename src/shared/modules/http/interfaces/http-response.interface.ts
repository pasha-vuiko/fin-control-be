import { Dispatcher } from 'undici';

import ResponseData = Dispatcher.ResponseData;

/**
 * Describes response of HttpService methods
 */
export interface HttpResponse<T> extends ResponseData {
  data: T;
}
