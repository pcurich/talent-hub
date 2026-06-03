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
  SC_GET_FEEDBACKS: 'FEEDBACKS',

} as const;

export const SYSTEM_CONFIG_KEYS = {
  // Grupos
  TEAM_MEMBERS_CONFIG_GROUP_KEY: 'team_members',
  FEEDBACK_CONFIG_GROUP_KEY: 'feedback',

  // team_members → campos
  TEAM_MEMBERS_CONFIG_FIELD_KEY: 'team_members_company',
  TEAM_MEMBERS_COMPANY_FIELD_KEY: 'team_members_company',
  TEAM_MEMBERS_SENIORITY_FIELD_KEY: 'team_members_seniority',

  // feedback → campos
  FEEDBACK_PROVIDER_FIELD_KEY: 'feedback_provider',
  FEEDBACK_TYPE_FIELD_KEY: 'feedback_default_type',
  FEEDBACK_PERFORMANCE_LEVEL_FIELD_KEY: 'feedback_performance_level',
  FEEDBACK_GENERAL_RATING_FIELD_KEY: 'feedback_general_rating',
  FEEDBACK_DEFAULT_STATUS_FIELD_KEY: 'feedback_default_status',
  FEEDBACK_DEFAULT_VISIBILITY_FIELD_KEY: 'feedback_default_visibility',
  FEEDBACK_ACTION_RESPONSIBLE_FIELD_KEY: 'feedback_action_responsible',
  FEEDBACK_ACTION_STATUS_FIELD_KEY: 'feedback_action_status',
  FEEDBACK_REQUIRE_ACKNOWLEDGMENT_FIELD_KEY: 'feedback_require_acknowledgment',

  //notifications → campos
  NOTIFICATIONS_REMINDER_DAYS_FIELD_KEY: 'notifications_reminder_days',
  NOTIFICATIONS_ENABLED_FIELD_KEY: 'notifications_enabled',

} as const

export const ERROR_MESSAGES = {
  LOGIN_VALIDATION_FAILED: 'Completa matrícula y correo.',
  INVALID_INPUT: 'Entrada inválida. Por favor, verifica los datos.',
  DB_INIT_FAILED: (error: unknown) => `Error al inicializar la base de datos. Intenta nuevamente. ${error instanceof Error ? error.message : String(error)}`,
  USER_NOT_FOUND: 'Usuario no encontrado. Por favor, regístrate primero.'
} as const;
