import { DiscrepancyType } from '@enum';
import { logger } from '../utils';
import {
  Customer,
  FraudAlert,
  InvestigationLog,
  PatternMemory,
  ReconciliationDiscrepancy,
  ReconciliationRun,
  TransactionEntity,
} from '@models';
import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { ERRORS } from '@constant';

export class TransactionDao {
  public static instance: TransactionDao;

  static getInstance = (): TransactionDao => {
    if (!this.instance) {
      this.instance = new TransactionDao();
    }
    return this.instance;
  };

  async seedPatternMemory(): Promise<void> {
    const defaultPatterns = [
      { type: 'MISSING_DEPOSIT', source: 'PSP-X' },
      { type: 'FX_MISMATCH', source: 'PSP-X' },
      { type: 'VELOCITY_SPIKE', source: null },
      { type: 'STRUCTURING_PATTERN', source: null },
    ];

    for (const pattern of defaultPatterns) {
      await PatternMemory.findOrCreate({
        where: {
          discrepancyType: pattern.type,
          sourceName: pattern.source,
        },
        defaults: {
          weight: 1.0,
          historicalFrequency: 0,
          resolutionMethod: null,
        },
      });
    }

    logger.info('Pattern memory initialized.');
  }

  async seedInitialData(): Promise<void> {
    logger.info('Seeding customers + 1000 clean transactions...');

    try {
      const BASE_CURRENCY = 'USD';
      const baseTime = dayjs();

      const customers: string[] = [];

      // 1️⃣ Create 100 customers
      for (let i = 1; i <= 100; i++) {
        const customerId = `CUST-${i}`;
        customers.push(customerId);

        await Customer.create({
          customerId,
          country: 'US',
          accountStatus: 'ACTIVE',
          historicalAvgAmount: 300,
          riskLevel: 'LOW',
          cumulativeRiskScore: 0,
        });
      }

      // 2️⃣ Create 1000 clean transactions across 2 PSPs
      for (let i = 1; i <= 1000; i++) {
        const txId = `TX-${i}`;
        const amount = Number((Math.random() * 800 + 100).toFixed(2));
        const timestamp = baseTime.subtract(i, 'minute').toDate();

        const customerId = customers[Math.floor(Math.random() * customers.length)];

        const pspName = i % 2 === 0 ? 'PSP-X' : 'PSP-Y';

        // PSP
        await TransactionEntity.create({
          sourceType: 'PSP',
          sourceName: pspName,
          transactionId: txId,
          referenceId: txId,
          customerId,
          originalAmount: amount,
          originalCurrency: BASE_CURRENCY,
          normalizedAmount: amount,
          normalizedCurrency: BASE_CURRENCY,
          transactionType: 'DEPOSIT',
          transactionTimestamp: timestamp,
          reconciled: false,
        });

        // INTERNAL
        await TransactionEntity.create({
          sourceType: 'INTERNAL',
          sourceName: 'Ledger-A',
          transactionId: txId,
          referenceId: txId,
          customerId,
          originalAmount: amount,
          originalCurrency: BASE_CURRENCY,
          normalizedAmount: amount,
          normalizedCurrency: BASE_CURRENCY,
          transactionType: 'DEPOSIT',
          transactionTimestamp: timestamp,
          reconciled: false,
        });

        // ERP
        await TransactionEntity.create({
          sourceType: 'ERP',
          sourceName: 'ERP-System',
          transactionId: txId,
          referenceId: txId,
          customerId,
          originalAmount: amount,
          originalCurrency: BASE_CURRENCY,
          normalizedAmount: amount,
          normalizedCurrency: BASE_CURRENCY,
          transactionType: 'DEPOSIT',
          transactionTimestamp: timestamp,
          reconciled: false,
        });
      }

      // 3️⃣ Inject 10 missing deposits
      const missingInternal = await TransactionEntity.findAll({
        where: { sourceType: 'INTERNAL' },
        limit: 10,
      });

      for (const tx of missingInternal) {
        await tx.destroy();
      }

      // 4️⃣ Inject 3 FX mismatches
      const fxMismatch = await TransactionEntity.findAll({
        where: { sourceType: 'INTERNAL' },
        limit: 3,
        offset: 20,
      });

      for (const tx of fxMismatch) {
        tx.normalizedAmount = Number((Number(tx.normalizedAmount) * 0.96).toFixed(2));
        await tx.save();
      }

      logger.info('Seed complete.');
    } catch (error) {
      logger.error('Error Seeding', error);
      throw error;
    }
  }

  async startTransactionStream(): Promise<void> {
    logger.info('Autonomous stream started...');

    try {
      let counter = 5000;
      let cycle = 0;

      const customers = await Customer.findAll();
      const customerIds = customers.map((c) => c.customerId);

      setInterval(
        async () => {
          cycle++;
          logger.info(`Stream cycle ${cycle} started`);

          const now = new Date();

          // -------------------------
          // 1️⃣ NORMAL TRAFFIC (80 tx)
          // -------------------------
          for (let i = 0; i < 80; i++) {
            const txId = `LIVE-${counter++}`;
            const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];

            const amount = Number((Math.random() * 800 + 100).toFixed(2));
            const pspName = Math.random() > 0.5 ? 'PSP-X' : 'PSP-Y';

            await TransactionEntity.create({
              sourceType: 'PSP',
              sourceName: pspName,
              transactionId: txId,
              referenceId: txId,
              customerId,
              originalAmount: amount,
              originalCurrency: 'USD',
              normalizedAmount: amount,
              normalizedCurrency: 'USD',
              transactionType: 'DEPOSIT',
              transactionTimestamp: now,
              reconciled: false,
            });

            // 95% normal match
            if (Math.random() > 0.05) {
              await TransactionEntity.create({
                sourceType: 'INTERNAL',
                sourceName: 'Ledger-A',
                transactionId: txId,
                referenceId: txId,
                customerId,
                originalAmount: amount,
                originalCurrency: 'USD',
                normalizedAmount: amount,
                normalizedCurrency: 'USD',
                transactionType: 'DEPOSIT',
                transactionTimestamp: now,
                reconciled: false,
              });
            }

            await TransactionEntity.create({
              sourceType: 'ERP',
              sourceName: 'ERP-System',
              transactionId: txId,
              referenceId: txId,
              customerId,
              originalAmount: amount,
              originalCurrency: 'USD',
              normalizedAmount: amount,
              normalizedCurrency: 'USD',
              transactionType: 'DEPOSIT',
              transactionTimestamp: now,
              reconciled: false,
            });
          }

          // -------------------------
          // 2️⃣ VELOCITY FRAUD (every 3 cycles)
          // -------------------------
          if (cycle % 3 === 0) {
            const riskyCustomer = customerIds[Math.floor(Math.random() * customerIds.length)];

            logger.info(`Injecting velocity spike for ${riskyCustomer}`);

            for (let j = 0; j < 15; j++) {
              await TransactionEntity.create({
                sourceType: 'PSP',
                sourceName: 'PSP-X',
                transactionId: `VEL-${counter++}`,
                referenceId: `VEL-${counter}`,
                customerId: riskyCustomer,
                originalAmount: 1200,
                originalCurrency: 'USD',
                normalizedAmount: 1200,
                normalizedCurrency: 'USD',
                transactionType: 'DEPOSIT',
                transactionTimestamp: new Date(),
                reconciled: false,
              });
            }
          }

          // -------------------------
          // 3️⃣ STRUCTURING (every 5 cycles)
          // -------------------------
          if (cycle % 5 === 0) {
            const riskyCustomer = customerIds[Math.floor(Math.random() * customerIds.length)];

            logger.info(`Injecting structuring pattern for ${riskyCustomer}`);

            for (let j = 0; j < 3; j++) {
              await TransactionEntity.create({
                sourceType: 'PSP',
                sourceName: 'PSP-Y',
                transactionId: `STRUCT-${counter++}`,
                referenceId: `STRUCT-${counter}`,
                customerId: riskyCustomer,
                originalAmount: 9800,
                originalCurrency: 'USD',
                normalizedAmount: 9800,
                normalizedCurrency: 'USD',
                transactionType: 'DEPOSIT',
                transactionTimestamp: new Date(),
                reconciled: false,
              });
            }
          }

          // -------------------------
          // 4️⃣ MISSING INTERNAL (every 4 cycles)
          // -------------------------
          if (cycle % 4 === 0) {
            logger.info('Injecting missing deposit scenario');

            const txId = `MISS-${counter++}`;
            const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];

            const amount = 3000;

            await TransactionEntity.create({
              sourceType: 'PSP',
              sourceName: 'PSP-X',
              transactionId: txId,
              referenceId: txId,
              customerId,
              originalAmount: amount,
              originalCurrency: 'USD',
              normalizedAmount: amount,
              normalizedCurrency: 'USD',
              transactionType: 'DEPOSIT',
              transactionTimestamp: new Date(),
              reconciled: false,
            });

            // ❌ No INTERNAL inserted
          }

          // -------------------------
          // 5️⃣ FX MISMATCH (every 6 cycles)
          // -------------------------
          if (cycle % 6 === 0) {
            logger.info('Injecting FX mismatch');

            const txId = `FX-${counter++}`;
            const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];

            await TransactionEntity.create({
              sourceType: 'PSP',
              sourceName: 'PSP-Y',
              transactionId: txId,
              referenceId: txId,
              customerId,
              originalAmount: 5000,
              originalCurrency: 'USD',
              normalizedAmount: 5000,
              normalizedCurrency: 'USD',
              transactionType: 'DEPOSIT',
              transactionTimestamp: new Date(),
              reconciled: false,
            });

            await TransactionEntity.create({
              sourceType: 'INTERNAL',
              sourceName: 'Ledger-A',
              transactionId: txId,
              referenceId: txId,
              customerId,
              originalAmount: 5000,
              originalCurrency: 'USD',
              normalizedAmount: 4700, // 6% diff
              normalizedCurrency: 'USD',
              transactionType: 'DEPOSIT',
              transactionTimestamp: new Date(),
              reconciled: false,
            });
          }

          logger.info(`Stream cycle ${cycle} completed.`);
        },
        0.4 * 60 * 1000,
      );
    } catch (error) {
      logger.error('Error in stream', error);
      throw error;
    }
  }

  async runReconciliationCycle() {
    logger.info('Running deterministic reconciliation...');

    const FX_TOLERANCE = 0.03;
    const TIME_TOLERANCE_MS = 48 * 60 * 60 * 1000;
    const MATERIALITY_THRESHOLD = 5000;
    const DISCREPANCY_THRESHOLD = 5;

    // 1️⃣ Load only unreconciled PSP transactions
    const psp = await TransactionEntity.findAll({
      where: { sourceType: 'PSP', reconciled: false },
    });

    if (psp.length === 0) {
      logger.info('No new PSP transactions.');
      return null;
    }

    const internal = await TransactionEntity.findAll({
      where: { sourceType: 'INTERNAL', reconciled: false },
    });

    const erp = await TransactionEntity.findAll({
      where: { sourceType: 'ERP', reconciled: false },
    });

    // 2️⃣ Build lookup maps
    const internalMap = new Map<string, any>();
    internal.forEach((tx) => internalMap.set(tx.transactionId, tx));

    const erpMap = new Map<string, any>();
    erp.forEach((tx) => erpMap.set(tx.transactionId, tx));

    let matchedCount = 0;

    const fxMismatches: any[] = [];
    const missingDeposits: any[] = [];

    // 3️⃣ Matching Loop
    for (const p of psp) {
      const i = internalMap.get(p.transactionId);

      if (!i) {
        missingDeposits.push(p);
        continue;
      }

      const pAmount = Number(p.normalizedAmount);
      const iAmount = Number(i.normalizedAmount);

      const timeDiff = Math.abs(
        new Date(p.transactionTimestamp).getTime() - new Date(i.transactionTimestamp).getTime(),
      );

      // ✅ Exact match
      if (pAmount === iAmount && timeDiff <= TIME_TOLERANCE_MS) {
        p.reconciled = true;
        i.reconciled = true;

        const e = erpMap.get(p.transactionId);
        if (e) e.reconciled = true;

        await Promise.all([p.save(), i.save(), e ? e.save() : Promise.resolve()]);

        matchedCount++;
        continue;
      }

      // ✅ FX tolerance match
      const percentDiff = Math.abs(pAmount - iAmount) / pAmount;

      if (percentDiff <= FX_TOLERANCE) {
        p.reconciled = true;
        i.reconciled = true;

        await Promise.all([p.save(), i.save()]);

        fxMismatches.push({
          transactionId: p.transactionId,
          customerId: p.customerId,
          pspAmount: pAmount,
          internalAmount: iAmount,
          variance: Math.abs(pAmount - iAmount),
          sourceName: p.sourceName,
        });

        matchedCount++;
        continue;
      }

      // If neither matched → treat as missing
      missingDeposits.push(p);
    }

    // 4️⃣ Compute totals
    const pspTotal = psp.reduce((sum, t) => sum + Number(t.normalizedAmount), 0);
    const internalTotal = internal.reduce((sum, t) => sum + Number(t.normalizedAmount), 0);
    const erpTotal = erp.reduce((sum, t) => sum + Number(t.normalizedAmount), 0);

    const variance = pspTotal - internalTotal;
    const varianceDirection = variance > 0 ? 'PSP_HIGHER' : 'INTERNAL_HIGHER';

    const autoRate = (matchedCount / psp.length) * 100;
    const discrepancyCount = missingDeposits.length + fxMismatches.length;

    // 5️⃣ Create reconciliation run
    const run = await ReconciliationRun.create({
      runDate: new Date(),
      pspTotal,
      internalTotal,
      erpTotal,
      varianceAmount: variance,
      autoReconciledRate: autoRate,
      discrepancyCount,
      status:
        Math.abs(variance) > MATERIALITY_THRESHOLD || discrepancyCount > DISCREPANCY_THRESHOLD
          ? 'INVESTIGATION_REQUIRED'
          : 'COMPLETED',
    });

    // 6️⃣ Insert Missing Deposit Discrepancy
    if (missingDeposits.length > 0) {
      await ReconciliationDiscrepancy.create({
        runId: run.id,
        discrepancyType: 'MISSING_DEPOSIT',
        transactionIds: missingDeposits.map((t) => t.transactionId), // FIXED
        associatedCustomerIds: missingDeposits.map((t) => t.customerId),
        varianceAmount: missingDeposits.reduce((sum, t) => sum + Number(t.normalizedAmount), 0),
        status: 'OPEN',
      });
    }

    // 7️⃣ Insert FX Discrepancy
    if (fxMismatches.length > 0) {
      await ReconciliationDiscrepancy.create({
        runId: run.id,
        discrepancyType: 'FX_MISMATCH',
        transactionIds: fxMismatches.map((t) => t.transactionId),
        associatedCustomerIds: fxMismatches.map((t) => t.customerId),
        varianceAmount: fxMismatches.reduce((sum, t) => sum + t.variance, 0),
        status: 'OPEN',
      });
    }

    logger.info(
      `Reconciliation completed. Variance: ${variance}, Discrepancies: ${discrepancyCount}`,
    );

    return {
      runId: run.id,
      variance,
      varianceDirection,
      discrepancyCount,
      autoRate,
      status: run.status,
    };
  }

  async runFraudRiskEngine(runId: string) {
    const VELOCITY_THRESHOLD = 10;
    const VELOCITY_WINDOW_MINUTES = 5;

    const AMOUNT_MULTIPLIER = 5;
    const AMOUNT_WINDOW_MINUTES = 10;

    const STRUCTURING_MIN = 9000;
    const STRUCTURING_MAX = 10000;
    const STRUCTURING_COUNT = 3;
    const STRUCTURING_WINDOW_MINUTES = 15;

    logger.info('Running fraud risk engine...');

    const customers = await Customer.findAll();
    let totalFraudAlerts = 0;

    for (const customer of customers) {
      let riskScore = 0;
      const customerId = customer.customerId;

      // ===============================
      // 1️⃣ VELOCITY SPIKE
      // ===============================

      const velocityWindowStart = dayjs().subtract(VELOCITY_WINDOW_MINUTES, 'minute').toDate();

      const recentVelocityTx = await TransactionEntity.findAll({
        where: {
          customerId,
          sourceType: 'PSP',
          transactionTimestamp: {
            [Op.gte]: velocityWindowStart,
          },
        },
      });

      if (recentVelocityTx.length > VELOCITY_THRESHOLD) {
        riskScore += 30;

        const relatedTransactionIds = recentVelocityTx.map((tx) => tx.transactionId);

        const totalAmount = recentVelocityTx.reduce(
          (sum, tx) => sum + Number(tx.normalizedAmount),
          0,
        );

        await FraudAlert.create({
          runId,
          customerId,
          alertType: 'VELOCITY_SPIKE',
          riskScore: 30,
          relatedTransactionIds,
          totalAmount,
          transactionCount: recentVelocityTx.length,
          status: 'OPEN',
        });

        totalFraudAlerts++;
      }

      // ===============================
      // 2️⃣ AMOUNT ANOMALY
      // ===============================

      const amountWindowStart = dayjs().subtract(AMOUNT_WINDOW_MINUTES, 'minute').toDate();

      const recentLargeTx = await TransactionEntity.findAll({
        where: {
          customerId,
          sourceType: 'PSP',
          transactionTimestamp: {
            [Op.gte]: amountWindowStart,
          },
          normalizedAmount: {
            [Op.gt]: customer.historicalAvgAmount * AMOUNT_MULTIPLIER,
          },
        },
      });

      if (recentLargeTx.length > 0) {
        riskScore += 40;

        const relatedTransactionIds = recentLargeTx.map((tx) => tx.transactionId);

        const totalAmount = recentLargeTx.reduce((sum, tx) => sum + Number(tx.normalizedAmount), 0);

        await FraudAlert.create({
          runId,
          customerId,
          alertType: 'AMOUNT_ANOMALY',
          riskScore: 40,
          relatedTransactionIds,
          totalAmount,
          transactionCount: recentLargeTx.length,
          status: 'OPEN',
        });

        totalFraudAlerts++;

        // mark fraud flag
        for (const tx of recentLargeTx) {
          tx.fraudFlag = true;
          await tx.save();
        }
      }

      // ===============================
      // 3️⃣ STRUCTURING PATTERN
      // ===============================

      const structuringWindowStart = dayjs()
        .subtract(STRUCTURING_WINDOW_MINUTES, 'minute')
        .toDate();

      const structuringTx = await TransactionEntity.findAll({
        where: {
          customerId,
          sourceType: 'PSP',
          transactionTimestamp: {
            [Op.gte]: structuringWindowStart,
          },
          normalizedAmount: {
            [Op.between]: [STRUCTURING_MIN, STRUCTURING_MAX],
          },
        },
      });

      if (structuringTx.length >= STRUCTURING_COUNT) {
        riskScore += 30;

        const relatedTransactionIds = structuringTx.map((tx) => tx.transactionId);

        const totalAmount = structuringTx.reduce((sum, tx) => sum + Number(tx.normalizedAmount), 0);

        await FraudAlert.create({
          runId,
          customerId,
          alertType: 'STRUCTURING_PATTERN',
          riskScore: 30,
          relatedTransactionIds,
          totalAmount,
          transactionCount: structuringTx.length,
          status: 'OPEN',
        });

        totalFraudAlerts++;

        for (const tx of structuringTx) {
          tx.fraudFlag = true;
          await tx.save();
        }
      }

      // ===============================
      // 4️⃣ UPDATE CUSTOMER RISK PROFILE
      // ===============================

      if (riskScore > 0) {
        customer.cumulativeRiskScore += riskScore;

        if (customer.cumulativeRiskScore > 100) {
          customer.riskLevel = 'HIGH';
          customer.accountStatus = 'REVIEW';
        } else if (customer.cumulativeRiskScore > 50) {
          customer.riskLevel = 'MEDIUM';
        }

        await customer.save();
      }
    }

    logger.info(`Fraud engine complete. Alerts: ${totalFraudAlerts}`);

    return totalFraudAlerts;
  }

  async generateBeliefDistribution(runId: string) {
    const discrepancies = await ReconciliationDiscrepancy.findAll({
      where: { runId },
    });

    const fraudAlerts = await FraudAlert.findAll({
      where: { runId },
    });

    const patternWeights = await PatternMemory.findAll();

    const weightMap = new Map<string, number>();
    patternWeights.forEach((p) => {
      weightMap.set(p.discrepancyType, Number(p.weight));
    });

    const hypothesisScores: Record<string, number> = {};

    // 1️⃣ Reconciliation-based hypotheses
    for (const d of discrepancies) {
      const type = d.discrepancyType;

      const baseScore =
        Array.isArray(d.transactionIds) && d.transactionIds.length > 0
          ? d.transactionIds.length
          : 1;

      const weight = weightMap.get(type) || 1;

      hypothesisScores[type] = (hypothesisScores[type] || 0) + baseScore * weight;
    }

    // 2️⃣ Fraud-based hypotheses
    for (const alert of fraudAlerts) {
      const type = alert.alertType;

      const baseScore = Number(alert.riskScore);

      const weight = weightMap.get(type) || 1;

      hypothesisScores[type] = (hypothesisScores[type] || 0) + baseScore * weight;
    }

    // 3️⃣ Normalize
    const totalScore = Object.values(hypothesisScores).reduce((sum, val) => sum + val, 0);

    const beliefs = Object.entries(hypothesisScores).map(([type, score]) => ({
      type,
      belief: totalScore > 0 ? Number((score / totalScore).toFixed(2)) : 0,
    }));

    // 4️⃣ Sort descending
    beliefs.sort((a, b) => b.belief - a.belief);

    return beliefs;
  }

  async getDashboard() {
    try {
      const latestRun = await ReconciliationRun.findOne({
        order: [['createdAt', 'DESC']],
      });

      if (!latestRun) {
        return ERRORS.NOT_FOUND;
      }

      const fraudAlerts = await FraudAlert.count({
        where: { runId: latestRun.id },
      });

      return {
        agentStatus: 'ACTIVE',
        lastRunId: latestRun.id,
        variance: latestRun.varianceAmount,
        autoReconciledRate: latestRun.autoReconciledRate,
        discrepancyCount: latestRun.discrepancyCount,
        fraudAlerts,
        status: latestRun.status,
        riskLevel: fraudAlerts > 0 ? 'HIGH' : latestRun.discrepancyCount > 0 ? 'MEDIUM' : 'LOW',
      };
    } catch (error) {
      console.error(error);
      return ERRORS.INTERNAL_SERVER_ERROR;
    }
  }

  async getBeliefs() {
    try {
      const latestLog = await InvestigationLog.findOne({
        order: [['createdAt', 'DESC']],
      });

      if (!latestLog) {
        return [];
      }

      return latestLog.beliefSnapshot || [];
    } catch (error) {
      console.error(error);
      return ERRORS.INTERNAL_SERVER_ERROR;
    }
  }

  async getInvestigationLogs() {
    try {
      const latestRun = await ReconciliationRun.findOne({
        order: [['createdAt', 'DESC']],
      });

      if (!latestRun) {
        return [];
      }

      const logs = await InvestigationLog.findAll({
        where: { runId: latestRun.id },
        order: [['iteration', 'ASC']],
      });

      return logs.map((log) => ({
        iteration: log.iteration,
        toolCalled: log.toolCalled,
        beliefSnapshot: log.beliefSnapshot,
      }));
    } catch (error) {
      console.error(error);
      return ERRORS.INTERNAL_SERVER_ERROR;
    }
  }

  async getExecutiveReport() {
    try {
      const latestRun = await ReconciliationRun.findOne({
        order: [['createdAt', 'DESC']],
      });

      if (!latestRun || !latestRun.executiveReport) {
        return null;
      }

      return latestRun.executiveReport;
    } catch (error) {
      console.error(error);
      return ERRORS.INTERNAL_SERVER_ERROR;
    }
  }

  async getAllExecutiveReport() {
    try {
      const latestRun = await ReconciliationRun.findAll({
        order: [['createdAt', 'DESC']],
      });

      return latestRun;
    } catch (error) {
      console.error(error);
      return ERRORS.INTERNAL_SERVER_ERROR;
    }
  }
}
