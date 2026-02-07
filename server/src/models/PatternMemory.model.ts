import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: PatternMemory.TABLE_NAME,
  timestamps: true,
})
export class PatternMemory extends Model {
  public static TABLE_NAME: string = 'pattern_memory';

  public static ID: string = 'id';
  public static ANOMALY_TYPE: string = 'anomaly_type';
  public static REVENUE_Z: string = 'revenue_z';
  public static PAYMENT_Z: string = 'payment_z';
  public static CHURN_Z: string = 'churn_z';
  public static AGENT_Z: string = 'agent_z';

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: PatternMemory.ID,
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: PatternMemory.ANOMALY_TYPE,
  })
  anomalyType: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: PatternMemory.REVENUE_Z,
  })
  revenueZ: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: PatternMemory.PAYMENT_Z,
  })
  paymentZ: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: PatternMemory.CHURN_Z,
  })
  churnZ: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: PatternMemory.AGENT_Z,
  })
  agentZ: number;
}
