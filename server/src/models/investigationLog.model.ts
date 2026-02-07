import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: InvestigationLog.TABLE_NAME,
  timestamps: true,
})
export class InvestigationLog extends Model {
  public static TABLE_NAME: string = 'investigation_logs';

  public static ID: string = 'id';
  public static REGION: string = 'region';
  public static ITERATION: string = 'iteration';
  public static TOOL_CALLED: string = 'tool_called';
  public static UPDATED_BELIEF: string = 'updated_belief';
  public static EVIDENCE: string = 'evidence';

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: InvestigationLog.ID,
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: InvestigationLog.REGION,
  })
  region: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: InvestigationLog.ITERATION,
  })
  iteration: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: InvestigationLog.TOOL_CALLED,
  })
  toolCalled: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: InvestigationLog.UPDATED_BELIEF,
  })
  updatedBelief: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: InvestigationLog.EVIDENCE,
  })
  evidence: string;
}
