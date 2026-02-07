import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: DomainWeight.TABLE_NAME,
  timestamps: false,
})
export class DomainWeight extends Model {
  public static TABLE_NAME: string = 'domain_weights';

  public static ID: string = 'id';
  public static PAYMENT_WEIGHT: string = 'payment_weight';
  public static SUBSCRIPTION_WEIGHT: string = 'subscription_weight';
  public static AGENT_WEIGHT: string = 'agent_weight';

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: DomainWeight.ID,
  })
  id: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 1,
    field: DomainWeight.PAYMENT_WEIGHT,
  })
  paymentWeight: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 1,
    field: DomainWeight.SUBSCRIPTION_WEIGHT,
  })
  subscriptionWeight: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 1,
    field: DomainWeight.AGENT_WEIGHT,
  })
  agentWeight: number;
}
