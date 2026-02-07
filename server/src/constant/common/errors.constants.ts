export const ERRORS = {
  BAD_REQUEST: {
    key: 'BAD_REQUEST',
    message: 'Invalid syntax for this request was provided',
  },
  UNAUTHORIZED: {
    key: 'UNAUTHORIZED',
    message: 'You are unauthorized to access the requested resource',
  },
  INCORRECT_CREDENTIALS: {
    key: 'INCORRECT_CREDENTIALS',
    message: 'The email or password you entered is incorrect',
  },
  INVALID_USER_KEY: {
    key: 'INVALID_USER_KEY',
    message: 'The provided user key is invalid',
  },
  INVALID_REFRESH_TOKEN: {
    key: 'INVALID_REFRESH_TOKEN',
    message: 'The provided refresh token is invalid',
  },
  FORBIDDEN: {
    key: 'FORBIDDEN',
    message: 'You are not allowed to access the requested resource',
  },
  NOT_FOUND: {
    key: 'NOT_FOUND',
    message: 'We could not find the resource you requested',
  },
  CONFLICT: {
    key: 'CONFLICT',
    message:
      'The request could not be completed due to a conflict with the current state of the resource',
  },
  INTERNAL_SERVER_ERROR: {
    key: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected Internal Server Error',
  },
  INVALID_TOKEN: {
    key: 'INVALID_TOKEN',
    message: 'The provided auth token is not found or invalid',
  },
  API_NOT_FOUND: {
    key: 'API_NOT_FOUND',
    message: 'The requested API is not found',
  },
  PARAMETER_MISSING: {
    key: 'PARAMETER_MISSING',
    message: 'Required parameters are missing',
  },
  INVALID_PARAMETERS: {
    key: 'INVALID_PARAMETERS',
    message: 'The provided parameters are invalid',
  },
  INVALID_ID: {
    key: 'INVALID_ID',
    message: 'The provided resource id is invalid',
  },
  CREATE_FAILED: {
    key: 'CREATE_FAILED',
    message: 'Failed to create the requested resouce',
  },
  UPDATE_FAILED: {
    key: 'UPDATE_FAILED',
    message: 'Failed to update the requested resouce',
  },
  DELETE_FAILED: {
    key: 'DELETE_FAILED',
    message: 'Failed to delete the requested resouce',
  },
  ALREADY_EXISTS: {
    key: 'ALREADY_EXISTS',
    message: 'The resouce already exists [*]',
  },
  USER_NOT_FOUND: {
    key: 'USER_NOT_FOUND',
    message: 'The user not found',
  },
  LOGIN_FAIL: {
    key: 'LOGIN_FAIL',
    message: 'Provided credentials Have No Access to use this login',
  },
  INVALID_OTP: {
    key: 'INVALID_OTP',
    message: 'The OTP entered is invalid',
  },
  EXPIRED_OTP: {
    key: 'EXPIRED_OTP',
    message: 'The OTP has expired',
  },
  ALREADY_VERIFIED: {
    key: 'ALREADY_VERIFIED',
    message: 'The OTP is already verified',
  },
};
