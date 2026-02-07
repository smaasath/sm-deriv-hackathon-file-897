import { HTTPSTATUS } from '@enum';
import { Response } from 'express';
import { IError } from '@interfaces';
import { logger } from '@utils';

export const cb = (
  code: HTTPSTATUS,
  res: Response,
  responseData: any,
  isWrapWithData: boolean = true,
) => {
  let response;
  if (responseData) {
    if (isWrapWithData) {
      response = { data: responseData };
    } else {
      response = responseData;
    }
  }
  return res.status(code).json(response);
};
export const cbError = (res: Response, code: HTTPSTATUS, type: IError, error: any = '') => {
  const errorContent = {
    code,
    key: type.key,
    message: type.message,
    error: error ?? '',
  };

  logger.error(errorContent);
  return res.status(code).json({ error: errorContent });
};
