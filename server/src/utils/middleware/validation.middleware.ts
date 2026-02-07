/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import { ERRORS } from '@constant';
import { HTTPSTATUS } from '@enum';
import { cbError } from '@utils';

export function ValidateRequest(
  schema: object,
): (req: Request, res: Response, next: NextFunction) => void {
  const ajv = new Ajv({ $data: true });
  ajvFormats(ajv);

  ajv.addFormat('date', {
    type: 'string',
    validate: /^\d{4}-\d{2}-\d{2}$/,
  });

  ajv.addFormat('time', {
    type: 'string',
    validate: /^\d{2}:\d{2}$/,
  });

  ajv.addFormat('year', {
    type: 'string',
    validate: /^(19|20)\d{2}$/,
  });

  ajv.addFormat('month', {
    type: 'string',
    validate: /^(0[1-9]|1[0-2])$/,
  });

  ajv.addFormat('iso-timestamp', {
    type: 'string',
    validate: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z?$/,
  });

  ajv.addFormat('string', {
    type: 'string',
    validate: (value: string) => typeof value === 'string' && value.trim().length > 0,
  });

  ajv.addFormat('password', {
    type: 'string',
    // Example: minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
    validate: (password: string) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password),
  });

  ajv.addFormat('email', {
    type: 'string',
    validate: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const isValid = ajv.validate(schema, req.body);

    if (!isValid || Object.keys(req.body).length === 0) {
      return cbError(
        res,
        HTTPSTATUS.BAD_REQUEST,
        ERRORS.BAD_REQUEST,
        ajv.errorsText(ajv.errors, { separator: '\n' }),
      );
    }

    next();
  };
}

export function ValidateRequestCustom(
  schema: object,
): (req: Request, res: Response, next: NextFunction) => void {
  const ajv = new Ajv();
  return (req: Request, res: Response, next: NextFunction) => {
    const isValid = ajv.validate(schema, req.body);

    if (!isValid || Object.keys(req.body).length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({ message: 'The request is invalid.' });
    }

    next();
  };
}

export function ValidateQueryParams(
  schema: any,
): (req: Request, res: Response, next: NextFunction) => void {
  const ajv = new Ajv();
  return (req: Request, res: Response, next: NextFunction) => {
    const queryParams: any = req.query;
    for (const query in queryParams) {
      if (schema.properties[query].type == 'number') {
        queryParams[query] = parseInt(queryParams[query]);
      }
    }
    const isValid = ajv.validate(schema, queryParams);

    if (!isValid) {
      return cbError(
        res,
        HTTPSTATUS.BAD_REQUEST,
        ERRORS.BAD_REQUEST,
        ajv.errorsText(ajv.errors, { separator: '\n' }),
      );
    }
    next();
  };
}

export function ValidateParamsId(
  paramName: string = 'id',
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramValue = req.params[paramName];

    const parsedId = parseInt(paramValue, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      return cbError(
        res,
        HTTPSTATUS.BAD_REQUEST,
        ERRORS.BAD_REQUEST,
        `Invalid '${paramName}' parameter. Must be a positive number.`,
      );
    }
    next();
  };
}
