import * as debug from 'debug';
import { NextFunction, Request, Response, Router } from 'express';

import {
  RouterConfig,
  ValidationConfigOptions,
  ValidationOptions
} from './index.interfaces';

const indicative = require('indicative');
const PromiseRouter = require('express-promise-router');
const log = debug('express-router-helper');

export function createRouter(config: RouterConfig): Router {
  const r = PromiseRouter();
  const prefix = addMissingForwardSlash(config.prefix);
  log('prefix:', prefix);
  for (const route of config.routes) {
    const path = addMissingForwardSlash(route.path);
    log('path:', path);
    let mds = route.middleware || [];
    if (route.validation) {
      const { body, headers, query, options } = route.validation;
      const defaults: ValidationOptions = {
        abortEarly: false,
        extends: [],
        messages: {}
      };
      if (options) {
        if (options.abortEarly) defaults.abortEarly = options.abortEarly;
        if (options.extends) defaults.extends = options.extends;
        if (options.messages) defaults.messages = options.messages;
      }
      log('options:', defaults);
      if (headers) {
        mds = [
          ...mds,
          createValidationMiddleware('headers', {
            ...headers,
            options: defaults
          })
        ];
      }
      if (query) {
        mds = [
          ...mds,
          createValidationMiddleware('query', { ...query, options: defaults })
        ];
      }
      if (body) {
        mds = [
          ...mds,
          createValidationMiddleware('body', { ...body, options: defaults })
        ];
      }
    }
    log('middleware stack:', mds);
    const url = (prefix + path).replace('//', '/');
    log('URL:', url);
    r[route.method.toLowerCase()](url, ...mds, route.handler);
  }
  return r;
}

export const HttpMethods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch'
};

function createValidationMiddleware(
  type: 'headers' | 'query' | 'body',
  config: ValidationConfigOptions & {
    options: ValidationOptions;
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // apply custom validator functions
      if (config.options.extends && config.options.extends.length) {
        for (const e of config.options.extends) {
          indicative.validations[e.name] = e.fn;
        }
      }

      const data =
        type === 'headers'
          ? req.headers
          : type === 'query' ? req.query : type === 'body' ? req.body : {};
      const sanitizeRules = config.sanitizes ? { ...config.sanitizes } : {};
      const messages = { ...config.options.messages, ...config.messages };
      const rules = config.rules ? { ...config.rules } : {};

      const sanitizedData = await indicative.sanitize(data, sanitizeRules);
      log('sanitizedData', sanitizedData);
      await indicative[config.options.abortEarly ? 'validate' : 'validateAll'](
        sanitizedData,
        rules,
        messages
      );

      // return sanitized data
      if (type === 'headers') req.headers = sanitizedData;
      else if (type === 'query') req.query = sanitizedData;
      else req.body = sanitizedData;
      next();
    } catch (errors) {
      res.status(422).json({
        message: 'Validation Failed',
        errors
      });
    }
  };
}

function addMissingForwardSlash(value: string) {
  return value.charAt(0) !== '/' ? `/${value}` : value;
}
