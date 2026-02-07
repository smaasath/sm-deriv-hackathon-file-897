import { Model, Table, Column, DataType, Index } from 'sequelize-typescript';

@Table({
  tableName: InvestigationLog.TABLE_NAME,
  timestamps: false,
})
export class InvestigationLog extends Model {
  public static TABLE_NAME = 'investigation_logs';

  public static ID = 'id';
  public static RUN_ID = 'run_id';
  public static ITERATION = 'iteration';
  public static TOOL_CALLED = 'tool_called';
  public static BELIEF_SNAPSHOT = 'belief_snapshot';
  public static EVIDENCE_SUMMARY = 'evidence_summary';
  public static CREATED_AT = 'created_at';

  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4, field: InvestigationLog.ID })
  id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: InvestigationLog.RUN_ID })
  runId: string;

  @Column({ type: DataType.INTEGER, allowNull: false, field: InvestigationLog.ITERATION })
  iteration: number;

  @Column({ type: DataType.STRING(100), allowNull: false, field: InvestigationLog.TOOL_CALLED })
  toolCalled: string;

  @Column({ type: DataType.JSONB, allowNull: false, field: InvestigationLog.BELIEF_SNAPSHOT })
  beliefSnapshot: object;

  @Column({ type: DataType.TEXT, allowNull: false, field: InvestigationLog.EVIDENCE_SUMMARY })
  evidenceSummary: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: InvestigationLog.CREATED_AT })
  createdAt: Date;
}

