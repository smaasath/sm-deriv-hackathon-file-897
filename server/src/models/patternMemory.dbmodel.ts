import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: PatternMemory.TABLE_NAME,
  timestamps: false,
})
export class PatternMemory extends Model {
  public static TABLE_NAME = 'pattern_memory';

  public static ID = 'id';
  public static DISCREPANCY_TYPE = 'discrepancy_type';
  public static SOURCE_NAME = 'source_name';
  public static WEIGHT = 'weight';
  public static HISTORICAL_FREQUENCY = 'historical_frequency';
  public static RESOLUTION_METHOD = 'resolution_method';
  public static UPDATED_AT = 'updated_at';

  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4, field: PatternMemory.ID })
  id: string;

  @Column({ type: DataType.STRING(50), allowNull: false, field: PatternMemory.DISCREPANCY_TYPE })
  discrepancyType: string;

  @Column({ type: DataType.STRING(100), field: PatternMemory.SOURCE_NAME })
  sourceName: string;

  @Column({ type: DataType.DECIMAL(5,2), defaultValue: 1.00, field: PatternMemory.WEIGHT })
  weight: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: PatternMemory.HISTORICAL_FREQUENCY })
  historicalFrequency: number;

  @Column({ type: DataType.TEXT, field: PatternMemory.RESOLUTION_METHOD })
  resolutionMethod: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: PatternMemory.UPDATED_AT })
  updatedAt: Date;
}

