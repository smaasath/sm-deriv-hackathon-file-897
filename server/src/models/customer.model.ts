import { Model, Table, Column, DataType, Index } from 'sequelize-typescript';

@Table({
  tableName: Customer.TABLE_NAME,
  timestamps: false,
})
export class Customer extends Model {
  public static TABLE_NAME = 'customers';

  public static CUSTOMER_ID = 'customer_id';
  public static COUNTRY = 'country';
  public static ACCOUNT_STATUS = 'account_status';
  public static HISTORICAL_AVG_AMOUNT = 'historical_avg_amount';
  public static RISK_LEVEL = 'risk_level';
  public static CUMULATIVE_RISK_SCORE = 'cumulative_risk_score';
  public static CREATED_AT = 'created_at';
  public static UPDATED_AT = 'updated_at';

  @Column({ type: DataType.STRING(100), primaryKey: true, field: Customer.CUSTOMER_ID })
  customerId: string;

  @Column({ type: DataType.STRING(50), field: Customer.COUNTRY })
  country: string;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'ACTIVE',
    field: Customer.ACCOUNT_STATUS,
  })
  accountStatus: string;

  @Column({
    type: DataType.DECIMAL(18,4),
    defaultValue: 0,
    field: Customer.HISTORICAL_AVG_AMOUNT,
  })
  historicalAvgAmount: number;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'LOW',
    field: Customer.RISK_LEVEL,
  })
  riskLevel: string;

  @Column({
    type: DataType.DECIMAL(5,2),
    defaultValue: 0,
    field: Customer.CUMULATIVE_RISK_SCORE,
  })
  cumulativeRiskScore: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: Customer.CREATED_AT })
  createdAt: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: Customer.UPDATED_AT })
  updatedAt: Date;
}
