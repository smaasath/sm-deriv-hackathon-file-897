import { HTTPSTATUS } from '@enum';
import { cb, handleKnownErrors, logger } from '@utils';
import { Request, Response } from 'express';

export class AgentController {


  constructor() {
 
  }

  public test = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - test()');
    try {
      cb(HTTPSTATUS.OK, res, "tets");
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };
}
