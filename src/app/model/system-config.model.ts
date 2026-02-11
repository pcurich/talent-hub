/**
 * Modelo de Configuración del Sistema
 * Define campos tipificados con opciones, valores por defecto y metadatos.
 */

import { BaseEntity } from "@pcurich/client-storage-indexeddb";

// ============================================================
// Tipos base para configuración
// ============================================================

/**
 * Tipos de campo soportados en la configuración
 */
export type FieldType = 'select' | 'multi-select' | 'text' | 'number' | 'boolean' | 'date' | 'color';

/**
 * Opción individual para campos select/multi-select
 */
export interface FieldOption {
  /** Valor interno usado en el código */
  value: string;
  /** Etiqueta visible para el usuario */
  label: string;
  /** Descripción para tooltip */
  description?: string;
  /** Icono opcional (nombre de clase o SVG path) */
  icon?: string;
  /** Si la opción está deshabilitada */
  disabled?: boolean;
  /** Orden de visualización */
  order?: number;
  /** Color asociado (para badges, indicadores, etc.) */
  color?: string;
}

/**
 * Definición de un campo configurable
 */
export interface ConfigField {
  /** Identificador único del campo */
  key: string;
  /** Nombre visible del campo */
  label: string;
  /** Descripción detallada para helpers/tooltips */
  description: string;
  /** Tipo de campo */
  type: FieldType;
  /** Valor por defecto */
  defaultValue: string | number | boolean | string[] | null;
  /** Opciones disponibles (para select/multi-select) */
  options?: FieldOption[];
  /** Si el campo es requerido */
  required?: boolean;
  /** Placeholder para campos de texto */
  placeholder?: string;
  /** Validación: valor mínimo (para number) */
  min?: number;
  /** Validación: valor máximo (para number) */
  max?: number;
  /** Validación: patrón regex (para text) */
  pattern?: string;
  /** Grupo al que pertenece el campo */
  group?: string;
  /** Orden de visualización dentro del grupo */
  order?: number;
  /** Si el campo está visible */
  visible?: boolean;
  /** Si el campo está habilitado */
  enabled?: boolean;
}

/**
 * Grupo de campos relacionados
 */
export interface ConfigGroup {
  /** Identificador del grupo */
  key: string;
  /** Nombre visible del grupo */
  label: string;
  /** Descripción del grupo */
  description?: string;
  /** Icono del grupo */
  icon?: string;
  /** Orden de visualización */
  order?: number;
  /** Campos del grupo */
  fields: ConfigField[];
}

// ============================================================
// Configuración del Sistema
// ============================================================

/**
 * Valor de configuración almacenado
 */
export interface ConfigValue {
  /** Key del campo */
  fieldKey: string;
  /** Valor actual */
  value: string | number | boolean | string[] | null;
  /** Última actualización */
  updatedAt?: Date;
  /** Usuario que actualizó */
  updatedBy?: string;
}

/**
 * Configuración completa del sistema
 */
export interface SystemConfig extends BaseEntity {
  /** Valores de configuración */
  values: ConfigValue[];
  /** Versión de la configuración */
  version: string;
}

// ============================================================
// Definiciones de configuración predeterminadas
// ============================================================

/**
 * Opciones predefinidas para empresas de miembros del equipo
 */

export const TEAM_MEMBERS_COMPANY_OPTIONS: FieldOption[] = [
  { value: 'blank', label: 'Sin empresa', description: 'No se ha especificado una empresa', order: 1 },
  { value: 'company_internal', label: 'Bcp', description: 'Colaborador interno del BCP', order: 2 },
  { value: 'company_external', label: 'Proveedor', description: 'Colaborador externo que trabaja por contrato de servicio', order: 3 }
]

/**
 * Opciones predefinidas para estados de feedback
 */
export const FEEDBACK_STATUS_OPTIONS: FieldOption[] = [
  { value: 'draft', label: 'Borrador', description: 'Feedback en preparación, no visible para el destinatario', color: '#6c757d', order: 1 },
  { value: 'pending', label: 'Pendiente', description: 'Esperando revisión o acción', color: '#ffc107', order: 2 },
  { value: 'sent', label: 'Enviado', description: 'Feedback enviado al destinatario', color: '#17a2b8', order: 3 },
  { value: 'acknowledged', label: 'Recibido', description: 'El destinatario ha confirmado recepción', color: '#28a745', order: 4 },
  { value: 'completed', label: 'Completado', description: 'Proceso de feedback finalizado', color: '#007bff', order: 5 },
  { value: 'cancelled', label: 'Cancelado', description: 'Feedback cancelado', color: '#dc3545', order: 6 }
];

/**
 * Opciones predefinidas para tipos de feedback
 */
export const FEEDBACK_TYPE_OPTIONS: FieldOption[] = [
  { value: 'recognition', label: 'Reconocimiento', description: 'Reconocer logros y buen desempeño', icon: 'star', color: '#ffc107', order: 1 },
  { value: 'improvement', label: 'Área de Mejora', description: 'Identificar oportunidades de crecimiento', icon: 'trending_up', color: '#17a2b8', order: 2 },
  { value: 'goal', label: 'Objetivo', description: 'Definir metas y expectativas', icon: 'flag', color: '#28a745', order: 3 },
  { value: 'general', label: 'General', description: 'Comentarios generales', icon: 'comment', color: '#6c757d', order: 4 }
];

/**
 * Opciones predefinidas para prioridad
 */
export const PRIORITY_OPTIONS: FieldOption[] = [
  { value: 'low', label: 'Baja', description: 'Sin urgencia, puede esperar', color: '#28a745', order: 1 },
  { value: 'medium', label: 'Media', description: 'Importancia moderada', color: '#ffc107', order: 2 },
  { value: 'high', label: 'Alta', description: 'Requiere atención pronta', color: '#fd7e14', order: 3 },
  { value: 'critical', label: 'Crítica', description: 'Acción inmediata requerida', color: '#dc3545', order: 4 }
];

/**
 * Opciones predefinidas para frecuencia
 */
export const FREQUENCY_OPTIONS: FieldOption[] = [
  { value: 'once', label: 'Una vez', description: 'Evento único', order: 1 },
  { value: 'daily', label: 'Diario', description: 'Todos los días', order: 2 },
  { value: 'weekly', label: 'Semanal', description: 'Una vez por semana', order: 3 },
  { value: 'biweekly', label: 'Quincenal', description: 'Cada dos semanas', order: 4 },
  { value: 'monthly', label: 'Mensual', description: 'Una vez al mes', order: 5 },
  { value: 'quarterly', label: 'Trimestral', description: 'Cada tres meses', order: 6 },
  { value: 'yearly', label: 'Anual', description: 'Una vez al año', order: 7 }
];

/**
 * Opciones predefinidas para roles
 */
export const ROLE_OPTIONS: FieldOption[] = [
  { value: 'member', label: 'Miembro', description: 'Miembro del equipo', order: 1 },
  { value: 'lead', label: 'Líder', description: 'Líder de equipo', order: 2 },
  { value: 'manager', label: 'Manager', description: 'Gerente directo', order: 3 },
  { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema', order: 4 }
];

/**
 * Opciones predefinidas para visibilidad
 */
export const VISIBILITY_OPTIONS: FieldOption[] = [
  { value: 'private', label: 'Privado', description: 'Solo visible para ti', icon: 'lock', order: 1 },
  { value: 'team', label: 'Equipo', description: 'Visible para tu equipo', icon: 'group', order: 2 },
  { value: 'squad', label: 'Squad', description: 'Visible para todo el squad', icon: 'groups', order: 3 },
  { value: 'public', label: 'Público', description: 'Visible para todos', icon: 'public', order: 4 }
];

/**
 * Opciones para período de evaluación
 */
export const EVALUATION_PERIOD_OPTIONS: FieldOption[] = [
  { value: 'q1', label: 'Q1', description: 'Primer trimestre (Enero - Marzo)', order: 1 },
  { value: 'q2', label: 'Q2', description: 'Segundo trimestre (Abril - Junio)', order: 2 },
  { value: 'q3', label: 'Q3', description: 'Tercer trimestre (Julio - Septiembre)', order: 3 },
  { value: 'q4', label: 'Q4', description: 'Cuarto trimestre (Octubre - Diciembre)', order: 4 },
  { value: 'h1', label: 'H1', description: 'Primer semestre', order: 5 },
  { value: 'h2', label: 'H2', description: 'Segundo semestre', order: 6 },
  { value: 'annual', label: 'Anual', description: 'Evaluación del año completo', order: 7 }
];

// ============================================================
// Definición de grupos de configuración
// ============================================================

/**
 *  Configuracion de TeamMembers
 */
export const TEAM_MEMBERS_CONFIG_GROUP: ConfigGroup = {
  key: 'team_members',
  label: 'Team Members',
  description: 'Configuración relacionada con los miembros del equipo de trabajo',
  icon: 'people',
  order: 2,
  fields: [
    {
      key: 'team_members_company',
      label: 'Empresa donde trabajan',
      description: 'Empresa donde están registrados los miembros del equipo',
      type: 'select',
      defaultValue: 'blank',
      options: TEAM_MEMBERS_COMPANY_OPTIONS,
      required: true,
      group: 'team_members',
      order: 1
    },
  ]
}

/**
 * Configuración de Feedback
 */
export const FEEDBACK_CONFIG_GROUP: ConfigGroup = {
  key: 'feedback',
  label: 'Feedback',
  description: 'Configuración relacionada con el sistema de feedback',
  icon: 'feedback',
  order: 1,
  fields: [
    {
      key: 'feedback_default_status',
      label: 'Estado por defecto',
      description: 'Estado inicial asignado a nuevos feedbacks',
      type: 'select',
      defaultValue: 'draft',
      options: FEEDBACK_STATUS_OPTIONS,
      required: true,
      group: 'feedback',
      order: 1
    },
    {
      key: 'feedback_default_type',
      label: 'Tipo por defecto',
      description: 'Tipo inicial sugerido para nuevos feedbacks',
      type: 'select',
      defaultValue: 'general',
      options: FEEDBACK_TYPE_OPTIONS,
      required: true,
      group: 'feedback',
      order: 2
    },
    {
      key: 'feedback_default_visibility',
      label: 'Visibilidad por defecto',
      description: 'Quién puede ver los feedbacks por defecto',
      type: 'select',
      defaultValue: 'private',
      options: VISIBILITY_OPTIONS,
      required: true,
      group: 'feedback',
      order: 3
    },
    {
      key: 'feedback_require_acknowledgment',
      label: 'Requerir confirmación',
      description: 'El destinatario debe confirmar que recibió el feedback',
      type: 'boolean',
      defaultValue: true,
      group: 'feedback',
      order: 4
    },
    {
      key: 'feedback_reminder_days',
      label: 'Días para recordatorio',
      description: 'Días después de los cuales enviar un recordatorio si no hay respuesta',
      type: 'number',
      defaultValue: 7,
      min: 1,
      max: 30,
      group: 'feedback',
      order: 5
    }
  ]
};

/**
 * Configuración de Notificaciones
 */
export const NOTIFICATIONS_CONFIG_GROUP: ConfigGroup = {
  key: 'notifications',
  label: 'Notificaciones',
  description: 'Preferencias de notificaciones del sistema',
  icon: 'notifications',
  order: 3,
  fields: [
    {
      key: 'notifications_enabled',
      label: 'Habilitar notificaciones',
      description: 'Recibir notificaciones del sistema',
      type: 'boolean',
      defaultValue: true,
      group: 'notifications',
      order: 1
    },
    {
      key: 'notifications_email',
      label: 'Notificaciones por email',
      description: 'Recibir notificaciones también por correo electrónico',
      type: 'boolean',
      defaultValue: false,
      group: 'notifications',
      order: 2
    },
    {
      key: 'notifications_frequency',
      label: 'Frecuencia de resumen',
      description: 'Con qué frecuencia recibir resumen de actividad',
      type: 'select',
      defaultValue: 'daily',
      options: FREQUENCY_OPTIONS.filter(o => ['daily', 'weekly', 'monthly'].includes(o.value)),
      group: 'notifications',
      order: 3
    }
  ]
};

/**
 * Configuración de Evaluaciones
 */
export const EVALUATIONS_CONFIG_GROUP: ConfigGroup = {
  key: 'evaluations',
  label: 'Evaluaciones',
  description: 'Configuración del ciclo de evaluaciones',
  icon: 'assessment',
  order: 4,
  fields: [
    {
      key: 'evaluation_current_period',
      label: 'Período actual',
      description: 'Período de evaluación activo',
      type: 'select',
      defaultValue: 'q1',
      options: EVALUATION_PERIOD_OPTIONS,
      required: true,
      group: 'evaluations',
      order: 1
    },
    {
      key: 'evaluation_default_priority',
      label: 'Prioridad por defecto',
      description: 'Prioridad inicial para nuevas evaluaciones',
      type: 'select',
      defaultValue: 'medium',
      options: PRIORITY_OPTIONS,
      group: 'evaluations',
      order: 2
    },
    {
      key: 'evaluation_self_assessment',
      label: 'Auto-evaluación habilitada',
      description: 'Permitir que los usuarios se auto-evalúen',
      type: 'boolean',
      defaultValue: true,
      group: 'evaluations',
      order: 3
    },
    {
      key: 'evaluation_peer_review',
      label: 'Revisión de pares',
      description: 'Habilitar evaluaciones entre compañeros del mismo nivel',
      type: 'boolean',
      defaultValue: true,
      group: 'evaluations',
      order: 4
    }
  ]
};

/**
 * Configuración de Apariencia
 */
export const APPEARANCE_CONFIG_GROUP: ConfigGroup = {
  key: 'appearance',
  label: 'Apariencia',
  description: 'Personalización visual del sistema',
  icon: 'palette',
  order: 5,
  fields: [
    {
      key: 'appearance_theme',
      label: 'Tema',
      description: 'Esquema de colores de la interfaz',
      type: 'select',
      defaultValue: 'light',
      options: [
        { value: 'light', label: 'Claro', description: 'Fondo claro con texto oscuro', order: 1 },
        { value: 'dark', label: 'Oscuro', description: 'Fondo oscuro con texto claro', order: 2 },
        { value: 'system', label: 'Sistema', description: 'Seguir preferencia del sistema operativo', order: 3 }
      ],
      group: 'appearance',
      order: 1
    },
    {
      key: 'appearance_compact_mode',
      label: 'Modo compacto',
      description: 'Reducir espaciado para mostrar más contenido',
      type: 'boolean',
      defaultValue: false,
      group: 'appearance',
      order: 2
    },
    {
      key: 'appearance_primary_color',
      label: 'Color primario',
      description: 'Color principal de la interfaz',
      type: 'color',
      defaultValue: '#002a8d',
      group: 'appearance',
      order: 3
    }
  ]
};

export const ALL_CONFIG_GROUPS: ConfigGroup[] = [
  FEEDBACK_CONFIG_GROUP,
  TEAM_MEMBERS_CONFIG_GROUP,
  NOTIFICATIONS_CONFIG_GROUP,
  EVALUATIONS_CONFIG_GROUP,
  APPEARANCE_CONFIG_GROUP
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// ============================================================
// Utilidades
// ============================================================

/**
 * Obtiene el valor por defecto de un campo
 */
export function getFieldDefaultValue(fieldKey: string): any {
  for (const group of ALL_CONFIG_GROUPS) {
    const field = group.fields.find(f => f.key === fieldKey);
    if (field) {
      return field.defaultValue;
    }
  }
  return null;
}

/**
 * Obtiene la definición de un campo
 */
export function getFieldDefinition(fieldKey: string): ConfigField | undefined {
  for (const group of ALL_CONFIG_GROUPS) {
    const field = group.fields.find(f => f.key === fieldKey);
    if (field) {
      return field;
    }
  }
  return undefined;
}

/**
 * Obtiene la etiqueta de una opción dado su valor
 */
export function getOptionLabel(options: FieldOption[], value: string): string {
  const option = options.find(o => o.value === value);
  return option?.label || value;
}

/**
 * Obtiene el color de una opción dado su valor
 */
export function getOptionColor(options: FieldOption[], value: string): string | undefined {
  const option = options.find(o => o.value === value);
  return option?.color;
}

/**
 * Crea una configuración del sistema con valores por defecto
 */
export function createDefaultSystemConfig(): SystemConfig {
  const values: ConfigValue[] = [];

  for (const group of ALL_CONFIG_GROUPS) {
    for (const field of group.fields) {
      values.push({
        fieldKey: field.key,
        value: field.defaultValue,
        updatedAt: new Date()
      });
    }
  }

  return {
    id: 1,
    values,
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    updateTimestamp: function() { this.updatedAt = new Date(); }
  };
}
