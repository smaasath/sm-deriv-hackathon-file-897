import { Column, DataType, Index, Table,Model } from "sequelize-typescript";

@Table({
  tableName: ReconciliationDiscrepancy.TABLE_NAME,
  timestamps: false,
})
export class ReconciliationDiscrepancy extends Model {
  public static TABLE_NAME = 'reconciliation_discrepancies';

  public static ID = 'id';
  public static RUN_ID = 'run_id';
  public static DISCREPANCY_TYPE = 'discrepancy_type';
  public static TRANSACTION_IDS = 'transaction_ids';
  public static VARIANCE_AMOUNT = 'variance_amount';
  public static ASSOCIATED_CUSTOMERS = 'associated_customer_ids';
  public static STATUS = 'status';
  public static CREATED_AT = 'created_at';

  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4, field: ReconciliationDiscrepancy.ID })
  id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: ReconciliationDiscrepancy.RUN_ID })
  runId: string;

  @Column({ type: DataType.STRING(50), allowNull: false, field: ReconciliationDiscrepancy.DISCREPANCY_TYPE })
  discrepancyType: string;

  @Column({ type: DataType.JSONB, allowNull: false, field: ReconciliationDiscrepancy.TRANSACTION_IDS })
  transactionIds: object;

  @Column({ type: DataType.DECIMAL(18,4), allowNull: false, field: ReconciliationDiscrepancy.VARIANCE_AMOUNT })
  varianceAmount: number;

  @Column({ type: DataType.JSONB, field: ReconciliationDiscrepancy.ASSOCIATED_CUSTOMERS })
  associatedCustomerIds: object;

  @Column({ type: DataType.STRING(20), defaultValue: 'OPEN', field: ReconciliationDiscrepancy.STATUS })
  status: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: ReconciliationDiscrepancy.CREATED_AT })
  createdAt: Date;
}

