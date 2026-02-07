import { logger } from '@utils';
import { TransactionDao } from '@dao';
import { AiService } from '@services';

export class AgentService {
  public static instance: AgentService;
  private transactionDao = TransactionDao.getInstance();
  private aiService = AiService.getInstance();

  public static getInstance = (): AgentService => {
    if (!this.instance) {
      this.instance = new AgentService();
    }

    return this.instance;
  };

  public async runAutonomousScript(): Promise<void> {
    logger.info('AgentService - runAutonomousScript()');

    try {
      // 1️⃣ Run Reconciliation
      const reconciliation = await this.transactionDao.runReconciliationCycle();

      // No new transactions
      if (!reconciliation) {
        logger.info('No reconciliation cycle executed.');
        return;
      }

      const { runId, status, variance } = reconciliation;

      logger.info(`Reconciliation run ${runId} completed with status: ${status}`);

      // 2️⃣ Run Fraud Risk Engine
      const fraudAlertCount = await this.transactionDao.runFraudRiskEngine(runId);

      logger.info(`Fraud alerts generated: ${fraudAlertCount}`);

      // 3️⃣ Determine if investigation required
      const investigationRequired = status === 'INVESTIGATION_REQUIRED' || fraudAlertCount > 0;

      if (!investigationRequired) {
        logger.info('No investigation required. Agent cycle completed.');
        return;
      }

      // 4️⃣ Generate Belief Distribution
      const beliefs = await this.transactionDao.generateBeliefDistribution(runId);

      if (!beliefs || beliefs.length === 0) {
        logger.warn('No beliefs generated. Skipping investigation.');
        return;
      }

      logger.info(`Beliefs generated: ${JSON.stringify(beliefs)}`);

      const topBelief = beliefs[0];

      //   // 5️⃣ High confidence shortcut (optional optimization)
      //   if (topBelief.belief >= 0.75) {
      //     logger.info('High confidence root cause detected. Generating executive report directly.');

      //     await this.aiService.generateExecutiveReport(runId, beliefs);

      //     logger.info('Executive report generated (high-confidence path).');
      //     return;
      //   }

      // 6️⃣ Run AI Investigation Loop
      logger.info('Starting AI investigation loop...');

      const data = await this.aiService.runInvestigation(runId, beliefs);
        logger.info('AI investigation completed.');
      return data;
     
    } catch (error) {
      logger.error('Error in autonomous agent cycle', error);
    }
  }

  public async addTestData(): Promise<void> {
    logger.info('AgentService - addTestData()');

    try {
      // 1️⃣ Run Reconciliation
      const data = await this.transactionDao.startTransactionStream();
      logger.info('data added completed.');
    } catch (error) {
      logger.error('Error in data adding', error);
    }
  }
}
