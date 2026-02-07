import { logger } from '@utils';
import { SQLLoader } from '@loaders';
import { Transaction } from 'sequelize';
import { ERRORS } from '@constant';
import { TransactionDao } from '@dao';
import {
  FraudAlert,
  InvestigationLog,
  ReconciliationDiscrepancy,
  ReconciliationRun,
  TransactionEntity,
} from '@models';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export class AiService {
  public static instance: AiService;
  private transactionDao = TransactionDao.getInstance();
  private bedrock = new BedrockRuntimeClient({
    region: 'ap-south-1', // or your region
  });
  // 🔥 TOOL MAPPING LAYER
  private toolMap: Record<string, string> = {
    VELOCITY_SPIKE: 'analyzeVelocityRisk',
    STRUCTURING_PATTERN: 'analyzeStructuringPattern',
    MISSING_DEPOSIT: 'analyzeMissingDeposits',
    FX_MISMATCH: 'analyzeFxMismatch',
    AMOUNT_ANOMALY: 'analyzeAmountAnomaly',
  };

  public static getInstance = (): AiService => {
    if (!this.instance) {
      this.instance = new AiService();
    }

    return this.instance;
  };

  async runInvestigation(runId: string, beliefs: any[]) {
    let currentBeliefs = beliefs;
    let iteration = 1;
    const MAX_ITERATIONS = 2;
    const CONFIDENCE_THRESHOLD = 0.8;

    while (iteration <= MAX_ITERATIONS && currentBeliefs[0].belief < CONFIDENCE_THRESHOLD) {
      const highestType = this.selectHighestBelief(currentBeliefs);

      let selectedTool = this.toolMap[highestType];

      if (!selectedTool) {
        console.warn(`No tool mapped for ${highestType}, using generic analysis.`);
        selectedTool = 'genericInvestigation';
      }

      const evidence = await this.executeTool(runId, selectedTool);

      currentBeliefs = await this.updateBeliefs(currentBeliefs, evidence);

      await InvestigationLog.create({
        runId,
        iteration,
        toolCalled: selectedTool,
        beliefSnapshot: currentBeliefs,
        evidenceSummary: JSON.stringify(evidence),
      });

      iteration++;
    }

    return await this.generateExecutiveReport(runId, currentBeliefs);
  }

  selectHighestBelief(beliefs: { type: string; belief: number }[]) {
    if (!beliefs || beliefs.length === 0) {
      throw new Error('No beliefs provided');
    }

    return beliefs.reduce((highest, current) =>
      current.belief > highest.belief ? current : highest,
    ).type;
  }

  async executeTool(runId: string, tool: string) {
    switch (tool) {
      case 'analyzeVelocityRisk':
        return await this.analyzeVelocityRisk(runId);

      case 'analyzeStructuringPattern':
        return await this.analyzeStructuringPattern(runId);

      case 'analyzeMissingDeposits':
        return await this.analyzeMissingDeposits(runId);

      case 'analyzeFxMismatch':
        return await this.analyzeFxMismatch(runId);
      case 'analyzeAmountAnomaly':
        return await this.analyzeAmountAnomaly(runId);

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  async genericInvestigation(runId: string) {
    return {
      type: 'GENERIC',
      message: 'No specific investigation tool available',
      evidenceStrength: 0.5,
    };
  }

  async analyzeAmountAnomaly(runId: string) {
    // 1️⃣ Get amount anomaly fraud alerts
    const alerts = await FraudAlert.findAll({
      where: {
        runId,
        alertType: 'AMOUNT_ANOMALY',
      },
    });

    if (!alerts || alerts.length === 0) {
      return {
        type: 'AMOUNT_ANOMALY',
        alertCount: 0,
        affectedCustomers: [],
        totalExposure: 0,
        avgDeviationPercent: 0,
        evidenceStrength: 0,
      };
    }

    const affectedCustomers = [...new Set(alerts.map((a) => a.customerId))];

    let totalExposure = 0;
    let totalDeviation = 0;

    for (const alert of alerts) {
      // 2️⃣ Get recent historical transactions for that customer
      const historicalTx = await TransactionEntity.findAll({
        where: {
          customerId: alert.customerId,
          sourceType: 'PSP',
        },
        limit: 20,
        order: [['transactionTimestamp', 'DESC']],
      });

      if (!historicalTx || historicalTx.length === 0) continue;

      const avgAmount =
        historicalTx.reduce((sum, t) => sum + Number(t.normalizedAmount), 0) / historicalTx.length;

      const deviation = Math.abs(Number(alert.totalAmount || 0) - avgAmount) / avgAmount;

      totalExposure += Number(alert.totalAmount || 0);
      totalDeviation += deviation;
    }

    const avgDeviationPercent =
      alerts.length > 0 ? Number(((totalDeviation / alerts.length) * 100).toFixed(2)) : 0;

    // 3️⃣ Compute evidence strength
    const evidenceStrength = alerts.length * 2 + avgDeviationPercent / 20;

    return {
      type: 'AMOUNT_ANOMALY',
      alertCount: alerts.length,
      affectedCustomers,
      totalExposure: Number(totalExposure.toFixed(2)),
      avgDeviationPercent,
      evidenceStrength: Number(evidenceStrength.toFixed(2)),
    };
  }

  async updateBeliefs(currentBeliefs: any[], evidence: any) {
    const updated = currentBeliefs.map((b) => {
      if (b.type === evidence.type) {
        return {
          ...b,
          belief: Math.min(b.belief + 0.15, 1),
        };
      }

      return b;
    });

    // Normalize
    const total = updated.reduce((sum, b) => sum + b.belief, 0);

    return updated
      .map((b) => ({
        ...b,
        belief: Number((b.belief / total).toFixed(2)),
      }))
      .sort((a, b) => b.belief - a.belief);
  }

  async analyzeStructuringPattern(runId: string) {
    const alerts = await FraudAlert.findAll({
      where: { runId, alertType: 'STRUCTURING_PATTERN' },
    });

    return {
      type: 'STRUCTURING_PATTERN',
      alertCount: alerts.length,
      affectedCustomers: alerts.map((a) => a.customerId),
      evidenceStrength: alerts.length * 2,
    };
  }

  async generateExecutiveReport(runId: string, beliefs: any[]) {
    // ================================
    // 1️⃣ Fetch Evidence
    // ================================

    const run = await ReconciliationRun.findByPk(runId);

    const fraudAlerts = await FraudAlert.findAll({
      where: { runId },
    });

    const discrepancies = await ReconciliationDiscrepancy.findAll({
      where: { runId },
    });

    const totalFraudExposure = fraudAlerts.reduce((sum, a) => sum + Number(a.totalAmount || 0), 0);

    const totalDiscrepancyExposure = discrepancies.reduce(
      (sum, d) => sum + Number(d.varianceAmount || 0),
      0,
    );

    // ================================
    // 2️⃣ Extract Affected Customers (DETERMINISTIC)
    // ================================

    const affectedCustomerSet = new Set<string>();

    // From fraud alerts
    fraudAlerts.forEach((a) => {
      if (a.customerId) {
        affectedCustomerSet.add(a.customerId);
      }
    });

    // From discrepancies via transactions
    for (const d of discrepancies) {
      if (d.transactionIds) {
        const txs = await TransactionEntity.findAll({
          where: { transactionId: d.transactionIds },
        });

        txs.forEach((tx) => {
          if (tx.customerId) {
            affectedCustomerSet.add(tx.customerId);
          }
        });
      }
    }

    const affectedCustomers = Array.from(affectedCustomerSet);

    const evidence = {
      variance: run?.varianceAmount || 0,
      fraudExposure: totalFraudExposure,
      discrepancyExposure: totalDiscrepancyExposure,
      fraudAlertCount: fraudAlerts.length,
      discrepancyCount: discrepancies.length,
      affectedCustomers,
    };

    // ================================
    // 3️⃣ Build LLM Prompt
    // ================================

    const prompt = `
You are an AI financial reconciliation assistant.

Belief distribution:
${JSON.stringify(beliefs)}

Structured Evidence:
${JSON.stringify(evidence)}

Generate a concise executive investigation report.

Return STRICT valid JSON only:

{
  "primaryCause": "",
  "secondaryFactor": "",
  "financialImpact": number,
  "affectedCustomers": [],
  "recommendedActions": [],
  "confidence": number
}

Rules:
- financialImpact must reflect fraudExposure or discrepancyExposure.
- affectedCustomers MUST use only provided values.
- Do NOT invent customers.
- confidence must be between 0.6 and 0.98.
- No explanations.
- Only JSON.
`;

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 800,
        temperature: 0,
        top_p: 1,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    try {
      const response = await this.safeInvoke(command);

      const decoded = new TextDecoder().decode(response.body);
      const parsed = JSON.parse(decoded);
      const outputText = parsed.content[0].text.trim();

      let report = JSON.parse(outputText);

      // ================================
      // 4️⃣ Validate Structure
      // ================================

      if (
        typeof report.primaryCause !== 'string' ||
        typeof report.financialImpact !== 'number' ||
        typeof report.confidence !== 'number'
      ) {
        throw new Error('Invalid LLM response structure');
      }

      // Clamp confidence
      report.confidence = Math.min(Math.max(report.confidence, 0.6), 0.98);

      // Force deterministic affected customers
      report.affectedCustomers = affectedCustomers;

      // ================================
      // 5️⃣ Store Report
      // ================================

      await ReconciliationRun.update({ executiveReport: report }, { where: { id: runId } });

      return report;
    } catch (error) {
      console.error('Executive report generation failed:', error);

      const fallbackReport = {
        primaryCause: beliefs[0]?.type || 'UNKNOWN',
        secondaryFactor: beliefs[1]?.type || null,
        financialImpact: totalFraudExposure || totalDiscrepancyExposure || run?.varianceAmount || 0,
        affectedCustomers,
        recommendedActions: ['Manual review required'],
        confidence: Math.min(Math.max(beliefs[0]?.belief || 0.7, 0.6), 0.95),
      };

      await ReconciliationRun.update({ executiveReport: fallbackReport }, { where: { id: runId } });

      return fallbackReport;
    }
  }

  async analyzeVelocityRisk(runId: string) {
    const fraudAlerts = await FraudAlert.findAll({
      where: {
        runId,
        alertType: 'VELOCITY_SPIKE',
      },
    });

    if (fraudAlerts.length === 0) {
      return {
        type: 'VELOCITY_SPIKE',
        evidenceStrength: 0,
        message: 'No velocity alerts found.',
      };
    }

    const customerIds = fraudAlerts.map((f) => f.customerId);

    const transactions = await TransactionEntity.findAll({
      where: {
        customerId: customerIds,
      },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.normalizedAmount), 0);

    return {
      type: 'VELOCITY_SPIKE',
      alertCount: fraudAlerts.length,
      affectedCustomers: [...new Set(customerIds)],
      transactionCount: transactions.length,
      totalExposure: totalAmount,
      totalRiskScore: fraudAlerts.reduce((sum, f) => sum + Number(f.riskScore), 0),
      evidenceStrength: fraudAlerts.length * 2,
    };
  }

  async analyzeMissingDeposits(runId: string) {
    const discrepancy = await ReconciliationDiscrepancy.findOne({
      where: {
        runId,
        discrepancyType: 'MISSING_DEPOSIT',
      },
    });

    if (!discrepancy) {
      return {
        type: 'MISSING_DEPOSIT',
        evidenceStrength: 0,
        message: 'No missing deposits found.',
      };
    }

    const txIds = discrepancy.transactionIds || [];

    const transactions = await TransactionEntity.findAll({
      where: {
        transactionId: txIds,
      },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.normalizedAmount), 0);
    const txIdsLength = Array.isArray(txIds) && txIds.length > 0 ? txIds.length : 1;
    return {
      type: 'MISSING_DEPOSIT',
      transactionCount: txIdsLength,
      affectedCustomers: [...new Set(transactions.map((t) => t.customerId))],
      totalExposure: totalAmount,
      evidenceStrength: txIdsLength + totalAmount / 1000,
    };
  }

  async analyzeFxMismatch(runId: string) {
    const discrepancy = await ReconciliationDiscrepancy.findOne({
      where: {
        runId,
        discrepancyType: 'FX_MISMATCH',
      },
    });

    if (!discrepancy) {
      return {
        type: 'FX_MISMATCH',
        evidenceStrength: 0,
        message: 'No FX mismatches detected.',
      };
    }

    const txIds = discrepancy.transactionIds || [];

    const transactions = await TransactionEntity.findAll({
      where: {
        transactionId: txIds,
      },
    });

    const totalVariance = Number(discrepancy.varianceAmount);
    const txIdsLength = Array.isArray(txIds) && txIds.length > 0 ? txIds.length : 1;
    return {
      type: 'FX_MISMATCH',
      transactionCount: txIdsLength,
      affectedCustomers: [...new Set(transactions.map((t) => t.customerId))],
      totalVariance,
      evidenceStrength: txIdsLength + totalVariance / 1000,
    };
  }

  private async safeInvoke(command: InvokeModelCommand) {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await this.bedrock.send(command);

        // small spacing after successful call
        await delay(1200);

        return response;
      } catch (err: any) {
        if (err.name === 'ThrottlingException') {
          const backoff = 2000 * (attempt + 1);
          await delay(backoff);
        } else {
          throw err;
        }
      }
    }

    throw new Error('Bedrock throttled after retries');
  }
}
