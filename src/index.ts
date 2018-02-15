import { NextFunction, Request, Response, Router } from 'express';

const PromiseRouter = require('express-promise-router');

export function createRouter(config: RouterConfig): Router {
  const r = PromiseRouter();
  const prefix = addMissingForwardSlash(config.prefix);
  for (const route of config.routes) {
    const path = addMissingForwardSlash(route.path);
    const mds = route.middleware || [];
    r[route.method.toLowerCase()](prefix + path, ...mds, route.handler);
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

export interface RouterConfig {
  prefix: string;
  routes: RouteConfig[];
}

export interface RouteConfig {
  path: string;
  method: string;
  middleware?: Middleware[];
  handler: Handler;
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;

export type Handler = (req: Request, res: Response) => any;

function addMissingForwardSlash(value: string) {
  return value.charAt(0) !== '/' ? `/${value}` : value;
}
