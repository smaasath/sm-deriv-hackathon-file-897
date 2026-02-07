import { DBConfig } from '@config';
import {
  InvestigationLog,
  PatternMemory,
  ReconciliationDiscrepancy,
  TransactionEntity,
  ReconciliationRun,
  Customer,
  FraudAlert
} from '@models';
import { logger } from '@utils';
import { Sequelize } from 'sequelize-typescript';

export class SQLLoader {
  private static instance: SQLLoader | null = null;
  private sequelize: Sequelize | null = null;
  private DB_NAME = DBConfig.DB_NAME;
  private DB_HOST = DBConfig.DB_HOST;
  private DB_PORT = DBConfig.DB_PORT;
  private DB_USER = DBConfig.DB_USER;
  private DB_PASSWORD = DBConfig.DB_PASSWORD;

  private constructor() {
    this.connectToSQL();
  }

  public static getInstance(): SQLLoader {
    if (!SQLLoader.instance) {
      SQLLoader.instance = new SQLLoader();
    }

    return SQLLoader.instance;
  }

  private async connectToSQL() {
    this.sequelize = new Sequelize({
      database: this.DB_NAME,
      username: this.DB_USER,
      password: this.DB_PASSWORD,
      host: this.DB_HOST,
      port: this.DB_PORT,
      dialect: 'postgres',
      logQueryParameters: false,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      models: [
        InvestigationLog,
        PatternMemory,
        ReconciliationDiscrepancy,
        TransactionEntity,
        ReconciliationRun,
        Customer,
        FraudAlert
      ],
      dialectOptions: {
        connectTimeout: 30000,
        ssl: {
          require: true,
          rejectUnauthorized: true, // or false in development
          ca: DBConfig.DB_CA,
        },
      },
    });

    await this.sequelize
      .authenticate()
      .then(() => {
        logger.info('✅ SQL Connection has been established successfully.');
        return this.sequelize!.sync({ alter: false });
      })
      .then(() => {
        logger.info('✅ Models synced with the database.');
      })
      .catch((err) => {
        logger.error('❌ Unable to connect to the SQL database:', err);
      });
  }

  public getSequelizeInstance(): Sequelize | null {
    return this.sequelize;
  }
}
