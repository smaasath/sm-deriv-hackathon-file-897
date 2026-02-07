import Ajv from 'ajv';
import dotenv from 'dotenv';
import addFormats from 'ajv-formats';
import { ENVIRONMENTS } from '@constant';

dotenv.config();

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const configSchema = {
  type: 'object',
  properties: {
    APP_ENV: {
      type: 'string',
      enum: [ENVIRONMENTS.LOCAL, ENVIRONMENTS.DEV, ENVIRONMENTS.DEMO, ENVIRONMENTS.PRODUCTION],
    },
    APP_PORT: { type: 'integer', minimum: 1 }
  },
  required: [
    'APP_ENV',
  ],
};

const defaultConfig = {
  APP_ENV: ENVIRONMENTS.LOCAL,
  APP_PORT: 3999,
};

const validate = ajv.compile(configSchema);

const ALLOWED_ORIGINS: string[] = ['http://localhost:3000', 'https://dev.gemtradehub.com'];

const PROD_ALLOWED_ORIGINS: string[] = ['http://localhost:3000'];

export const AppConfig = {
  APP_ENV: process.env.APP_ENV || defaultConfig.APP_ENV,
  APP_PORT: process.env.PORT || 3999,
  APP_ALLOWED_ORIGINS:
    process.env.APP_ENV == ENVIRONMENTS.PRODUCTION ? PROD_ALLOWED_ORIGINS : ALLOWED_ORIGINS,
};

if (!validate(AppConfig)) {
  throw validate?.errors;
}
