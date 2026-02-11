export const STORAGE_KEYS = {
  CURRENT_REGISTRATION: 'CURRENT_REGISTRATION',
  CURRENT_EMAIL: 'CURRENT_EMAIL'
} as const;

export const API_ENDPOINTS = {
  // tus endpoints aquí

} as const;

export const APP_CONFIG = {
  // configuraciones generales aquí
  APP_MOCK_NAME: 'TALENT-HUB',
} as const;

export const SERVICE_CODES = {
  SC_GET_CURRENT_USER: 'CURRENT_USER',
  SC_GET_SYSTEM_CONFIG: 'SYSTEM_CONFIG',

} as const;

export const ERROR_MESSAGES = {
  LOGIN_VALIDATION_FAILED: 'Completa matrícula y correo.',
  INVALID_INPUT: 'Entrada inválida. Por favor, verifica los datos.',
  DB_INIT_FAILED: (error: unknown) => `Error al inicializar la base de datos. Intenta nuevamente. ${error instanceof Error ? error.message : String(error)}`,
  USER_NOT_FOUND: 'Usuario no encontrado. Por favor, regístrate primero.'
} as const;
