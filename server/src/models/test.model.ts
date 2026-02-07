import { Model, Table, Column, DataType, ForeignKey } from 'sequelize-typescript';

@Table({
  tableName: 'test_table',
  timestamps: false,
})
export class TestModel extends Model {
  public static TEST: string = 'test';
  @Column({
    type: DataType.STRING(100),
    field: TestModel.TEST,
    allowNull: false,
  })
  test: string;
}
