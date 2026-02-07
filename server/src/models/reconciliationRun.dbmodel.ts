import { Column, DataType, Index, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: ReconciliationRun.TABLE_NAME,
  timestamps: false,
})
export class ReconciliationRun extends Model {
  public static TABLE_NAME = 'reconciliation_runs';

  public static ID = 'id';
  public static RUN_DATE = 'run_date';
  public static PSP_TOTAL = 'psp_total';
  public static INTERNAL_TOTAL = 'internal_total';
  public static ERP_TOTAL = 'erp_total';
  public static VARIANCE_AMOUNT = 'variance_amount';
  public static AUTO_RATE = 'auto_reconciled_rate';
  public static DISCREPANCY_COUNT = 'discrepancy_count';
  public static FRAUD_ALERT_COUNT = 'fraud_alert_count';
  public static STATUS = 'status';
  public static CREATED_AT = 'created_at';

  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    field: ReconciliationRun.ID,
  })
  id: string;

  @Column({ type: DataType.DATE, allowNull: false, field: ReconciliationRun.RUN_DATE })
  runDate: Date;

  @Column({ type: DataType.DECIMAL(18, 4), allowNull: false, field: ReconciliationRun.PSP_TOTAL })
  pspTotal: number;

  @Column({
    type: DataType.DECIMAL(18, 4),
    allowNull: false,
    field: ReconciliationRun.INTERNAL_TOTAL,
  })
  internalTotal: number;

  @Column({ type: DataType.DECIMAL(18, 4), allowNull: false, field: ReconciliationRun.ERP_TOTAL })
  erpTotal: number;

  @Column({
    type: DataType.DECIMAL(18, 4),
    allowNull: false,
    field: ReconciliationRun.VARIANCE_AMOUNT,
  })
  varianceAmount: number;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false, field: ReconciliationRun.AUTO_RATE })
  autoReconciledRate: number;

  @Column({ type: DataType.INTEGER, allowNull: false, field: ReconciliationRun.DISCREPANCY_COUNT })
  discrepancyCount: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: ReconciliationRun.FRAUD_ALERT_COUNT })
  fraudAlertCount: number;

  @Column({ type: DataType.STRING(50), allowNull: false, field: ReconciliationRun.STATUS })
  status: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: ReconciliationRun.CREATED_AT })
  createdAt: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  executiveReport!: any;
}
