import Ajv from 'ajv';
import dotenv from 'dotenv';
import addFormats from 'ajv-formats';

dotenv.config();

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const configSchema = {
  type: 'object',
  properties: {
    DB_HOST: { type: 'string' },
    DB_NAME: { type: 'string' },
    DB_PORT: { type: 'integer' },
    DB_USER: { type: 'string' },
    DB_PASSWORD: { type: 'string' },
    DB_CA: { type: 'string' },
  },
  required: ['DB_NAME', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'],
};

const validate = ajv.compile(configSchema);

export const DBConfig = {
  DB_HOST: process.env.DB_HOST as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as unknown as string,
  DB_PORT: (process.env.DB_PORT && parseInt(process.env.DB_PORT, 10)) as unknown as number,
  DB_CA: process.env.DB_CA,
};

if (!validate(DBConfig)) {
  throw validate.errors;
}
