import { describe, expect, it, vi } from 'vitest';

import { HttpException, HttpStatus } from '@nestjs/common';

import * as DocUtil from '@shared/modules/error/utils/get-app-exception-doc-html.util';

import { AppExceptionsRegistry } from './app-exceptions-registry';
import { AppException } from './exception-classes/app.exception';

class TestOkException extends AppException {
  constructor() {
    super('Works', { errorCode: '5.400.1', name: 'TestOkException' });
  }
}

class TestDuplicateException extends AppException {
  constructor() {
    super('Dup', { errorCode: '3.400.1', name: 'TestDuplicateException' });
  }
}

class TestDuplicateException2 extends AppException {
  constructor() {
    super('Dup2', { errorCode: '3.400.1', name: 'TestDuplicateException2' });
  }
}

class BadFormatException extends AppException {
  constructor() {
    // non‑numeric mid part
    //@ts-expect-error wrong errorCode format for unit tests
    super('Bad', { errorCode: '2.abc.1', name: 'BadFormatException' });
  }
}

class BadPartsException extends AppException {
  constructor() {
    // only 2 parts
    //@ts-expect-error wrong errorCode format for unit tests
    super('Bad2', { errorCode: '2.400', name: 'BadPartsException' });
  }
}

// eslint-disable-next-line max-lines-per-function
describe('AppExceptionsRegistry', () => {
  describe('constructor/initialization', () => {
    it('initializes with flow 0 and HTTP exceptions (>=400)', () => {
      const registry = new AppExceptionsRegistry();

      const obj = registry.getRegistryObject();
      const commonFlow = obj.find(f => f.code === 0);
      expect(commonFlow?.name).toBe('Common errors');
      // Ensure a well-known status is present and mapped
      const notFound = commonFlow?.exceptions.find(e => e.code === '0.404.0');
      expect(notFound?.name).toBe('NotFoundException');
      expect(notFound?.description).toBe('Not Found');
    });
  });

  describe('registerFlow()', () => {
    it('validates input and prevents duplicates', () => {
      const registry = new AppExceptionsRegistry();
      expect(() => registry.registerFlow(1.5 as any, 'Users')).toThrow(
        'flowCode should be safe integer',
      );

      registry.registerFlow(1, 'Users');
      expect(() => registry.registerFlow(1, 'Users Again')).toThrow(
        'Flow with code 1 already exists',
      );
    });
  });

  describe('registerException()', () => {
    it('rejects non-AppException constructors/instances', () => {
      const registry = new AppExceptionsRegistry();

      class NotApp {}
      expect(() => registry.registerException(NotApp as unknown as any)).toThrow(
        'Registered exception class should be constructor of AppException or its child',
      );
    });

    it('validates error code format and parts', () => {
      const registry = new AppExceptionsRegistry();
      expect(() => registry.registerException(BadFormatException)).toThrow(
        'error code should consist of 3 dot separated numbers',
      );
      expect(() => registry.registerException(BadPartsException)).toThrow(
        'error code should consist of 3 dot separated numbers',
      );
    });

    it('requires pre-registered flow and prevents duplicates', () => {
      const registry = new AppExceptionsRegistry();

      class Flow2Exception extends AppException {
        constructor() {
          super('X', { errorCode: '2.400.1', name: 'Flow2Exception' });
        }
      }

      // flow 2 not registered yet
      expect(() => registry.registerException(Flow2Exception)).toThrow(
        "the flow with code '2' is not registered",
      );

      registry.registerFlow(3, 'Flow Three');
      registry.registerException(TestDuplicateException);
      expect(() => registry.registerException(TestDuplicateException2)).toThrow(
        'exception with code 3.400.1 already exists',
      );
    });
  });

  describe('registerHttpException()', () => {
    it('wraps an HttpException and registers it (for <400 statuses too)', () => {
      const registry = new AppExceptionsRegistry();
      const httpEx = new HttpException('Accepted', HttpStatus.ACCEPTED);

      registry.registerHttpException(httpEx);

      const flow0 = registry.getRegistryObject().find(f => f.code === 0)!;
      const accepted = flow0.exceptions.find(e => e.code === '0.202.0');
      // registerHttpException preserves HttpException.name
      expect(accepted?.name).toBe('HttpException');
      expect(accepted?.description).toBe('Accepted');
    });
  });

  describe('getRegistryObject()', () => {
    it('returns flows with exceptions grouped correctly', () => {
      const registry = new AppExceptionsRegistry();
      registry.registerFlow(5, 'Flow Five');
      registry.registerException(TestOkException);

      const flows = registry.getRegistryObject();
      const flowFive = flows.find(f => f.code === 5)!;
      expect(flowFive.name).toBe('Flow Five');
      expect(flowFive.exceptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: '5.400.1',
            name: 'TestOkException',
            description: 'Works',
          }),
        ]),
      );
    });
  });

  describe('getRegistryHtml()', () => {
    it('delegates to getAppExceptionDocHtml()', () => {
      const registry = new AppExceptionsRegistry();
      const spy = vi
        .spyOn(DocUtil, 'getAppExceptionDocHtml')
        .mockReturnValueOnce('<html>ok</html>');

      const html = registry.getRegistryHtml();
      expect(html).toBe('<html>ok</html>');
      expect(spy).toHaveBeenCalledOnce();
    });
  });
});
