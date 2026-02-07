import { TransactionDao } from '@dao';
import { HTTPSTATUS } from '@enum';
import { AgentService, AiService } from '@services';
import { cb, handleKnownErrors, logger } from '@utils';
import { Request, Response } from 'express';

export class AgentController {
  private agentService: AgentService;
  private transactionDao: TransactionDao;

  constructor() {
    this.agentService = AgentService.getInstance();
    this.transactionDao = TransactionDao.getInstance();
  }

  public test = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - test()');
    try {
      const data = await this.agentService.runAutonomousScript();
      cb(HTTPSTATUS.OK, res, data);
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };

  public addTestData = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - addTestData()');
    try {
      // const data = await this.aiService.([]);
      // cb(HTTPSTATUS.OK, res, data);
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };

  public getDashboard = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - getDashboard()');
    try {
      const data = await this.transactionDao.getDashboard();
      cb(HTTPSTATUS.OK, res, data);
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };

  public getBeliefs = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - getBeliefs()');
    try {
      const data = await this.transactionDao.getBeliefs();
      cb(HTTPSTATUS.OK, res, data);
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };

  public getInvestigationLogs = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - getInvestigationLogs()');
    try {
      const data = await this.transactionDao.getInvestigationLogs();
      cb(HTTPSTATUS.OK, res, data);
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };

  public getExecutiveReport = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - getExecutiveReport()');
    try {
      const data = await this.transactionDao.getExecutiveReport();
      cb(HTTPSTATUS.OK, res, data);
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };

  public getAllExecutiveReport = async (req: Request, res: Response): Promise<void> => {
    logger.info('AgentController - getAllExecutiveReport()');
    try {
      const data = await this.transactionDao.getAllExecutiveReport();
      cb(HTTPSTATUS.OK, res, data);
    } catch (error: any) {
      handleKnownErrors(res, error);
    }
  };
}
