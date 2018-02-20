import { NextFunction, Request, Response } from 'express';

export interface RouterConfig {
  prefix: string;
  routes: RouteConfig[];
}

export interface RouteConfig {
  path: string;
  method: string;
  middleware?: Middleware[];
  validation?: ValidationConfig;
  handler: Handler;
}

export interface ValidationConfig {
  body?: ValidationConfigOptions;
  headers?: ValidationConfigOptions;
  query?: ValidationConfigOptions;
  options?: ValidationOptions;
}

export interface ValidationOptions {
  abortEarly?: boolean;
  extends?: ValidationExtend[];
  messages?: ValidationMessages;
}

export interface ValidationConfigOptions {
  rules?: ValidationRules;
  messages?: ValidationMessages;
  sanitizes?: ValidationSanitizes;
}

export interface ValidationRules {
  [x: string]: string;
}

export interface ValidationMessages {
  [x: string]: string;
}

export interface ValidationSanitizes {
  [x: string]: string;
}

export interface ValidationExtend {
  name: string;
  fn: (
    data: any,
    field: string,
    message: string,
    args: any[],
    get: (data: any, field: string) => any
  ) => Promise<string>;
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;

export type Handler = (req: Request, res: Response) => any;
