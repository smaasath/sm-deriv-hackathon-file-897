import { Column, DataType, Index, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: TransactionEntity.TABLE_NAME,
  timestamps: false,
})
export class TransactionEntity extends Model {
  public static TABLE_NAME = 'transactions';

  public static ID = 'id';
  public static SOURCE_TYPE = 'source_type';
  public static SOURCE_NAME = 'source_name';
  public static TRANSACTION_ID = 'transaction_id';
  public static REFERENCE_ID = 'reference_id';
  public static CUSTOMER_ID = 'customer_id';
  public static ORIGINAL_AMOUNT = 'original_amount';
  public static ORIGINAL_CURRENCY = 'original_currency';
  public static NORMALIZED_AMOUNT = 'normalized_amount';
  public static NORMALIZED_CURRENCY = 'normalized_currency';
  public static TRANSACTION_TYPE = 'transaction_type';
  public static TRANSACTION_TIMESTAMP = 'transaction_timestamp';
  public static RECONCILED = 'reconciled';
  public static FRAUD_FLAG = 'fraud_flag';
  public static FRAUD_RISK_SCORE = 'fraud_risk_score';
  public static CREATED_AT = 'created_at';

  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    field: TransactionEntity.ID,
  })
  id: string;

  @Column({ type: DataType.STRING(20), allowNull: false, field: TransactionEntity.SOURCE_TYPE })
  sourceType: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: TransactionEntity.SOURCE_NAME })
  sourceName: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: TransactionEntity.TRANSACTION_ID })
  transactionId: string;

  @Column({ type: DataType.STRING(100), field: TransactionEntity.REFERENCE_ID })
  referenceId: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: TransactionEntity.CUSTOMER_ID })
  customerId: string;

  @Column({
    type: DataType.DECIMAL(18, 4),
    allowNull: false,
    field: TransactionEntity.ORIGINAL_AMOUNT,
  })
  originalAmount: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    field: TransactionEntity.ORIGINAL_CURRENCY,
  })
  originalCurrency: string;

  @Column({
    type: DataType.DECIMAL(18, 4),
    allowNull: false,
    field: TransactionEntity.NORMALIZED_AMOUNT,
  })
  normalizedAmount: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    defaultValue: 'USD',
    field: TransactionEntity.NORMALIZED_CURRENCY,
  })
  normalizedCurrency: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: TransactionEntity.TRANSACTION_TYPE,
  })
  transactionType: string;

  @Column({ type: DataType.DATE, allowNull: false, field: TransactionEntity.TRANSACTION_TIMESTAMP })
  transactionTimestamp: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: TransactionEntity.RECONCILED })
  reconciled: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: TransactionEntity.FRAUD_FLAG })
  fraudFlag: boolean;

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0,
    field: TransactionEntity.FRAUD_RISK_SCORE,
  })
  fraudRiskScore: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: TransactionEntity.CREATED_AT })
  createdAt: Date;
}
