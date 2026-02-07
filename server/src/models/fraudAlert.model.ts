import { Model, Table, Column, DataType, Index } from 'sequelize-typescript';

@Table({
  tableName: FraudAlert.TABLE_NAME,
  timestamps: false,
})
export class FraudAlert extends Model {
  public static TABLE_NAME = 'fraud_alerts';

  public static ID = 'id';
  public static RUN_ID = 'run_id';
  public static CUSTOMER_ID = 'customer_id';
  public static ALERT_TYPE = 'alert_type';
  public static RISK_SCORE = 'risk_score';
  public static RELATED_TX = 'related_transaction_ids';
  public static STATUS = 'status';
  public static CREATED_AT = 'created_at';

  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    field: FraudAlert.ID,
  })
  id: string;

  @Column({ type: DataType.UUID, field: FraudAlert.RUN_ID })
  runId: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: FraudAlert.CUSTOMER_ID })
  customerId: string;

  @Column({ type: DataType.STRING(50), allowNull: false, field: FraudAlert.ALERT_TYPE })
  alertType: string;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false, field: FraudAlert.RISK_SCORE })
  riskScore: number;

  @Column({ type: DataType.JSONB, field: FraudAlert.RELATED_TX })
  relatedTransactionIds: object;

  @Column({ type: DataType.STRING(20), defaultValue: 'OPEN', field: FraudAlert.STATUS })
  status: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  totalAmount!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  transactionCount!: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: FraudAlert.CREATED_AT })
  createdAt: Date;
}
