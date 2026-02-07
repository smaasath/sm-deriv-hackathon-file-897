import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: DailyMetric.TABLE_NAME,
  timestamps: false,
})
export class DailyMetric extends Model {
  public static TABLE_NAME: string = 'daily_metrics';

  public static ID: string = 'id';
  public static DATE: string = 'date';
  public static REGION: string = 'region';
  public static TOTAL_REVENUE: string = 'total_revenue';
  public static RENEWAL_RATE: string = 'renewal_rate';
  public static CHURN_RATE: string = 'churn_rate';
  public static PAYMENT_SUCCESS_RATE: string = 'payment_success_rate';
  public static AGENT_TRAFFIC: string = 'agent_traffic';
  public static AGENT_CHURN_RATE: string = 'agent_churn_rate';

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: DailyMetric.ID,
  })
  id: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: DailyMetric.DATE,
  })
  date: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: DailyMetric.REGION,
  })
  region: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: DailyMetric.TOTAL_REVENUE,
  })
  totalRevenue: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: DailyMetric.RENEWAL_RATE,
  })
  renewalRate: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: DailyMetric.CHURN_RATE,
  })
  churnRate: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: DailyMetric.PAYMENT_SUCCESS_RATE,
  })
  paymentSuccessRate: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: DailyMetric.AGENT_TRAFFIC,
  })
  agentTraffic: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: DailyMetric.AGENT_CHURN_RATE,
  })
  agentChurnRate: number;
}
