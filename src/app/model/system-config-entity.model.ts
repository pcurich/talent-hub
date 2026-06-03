import { BaseEntity } from "@pcurich/client-storage-indexeddb";
import { SYSTEM_CONFIG_KEYS } from "../constants/general.constants";

export type FieldType = 'select' | 'multi-select' | 'text' | 'number' | 'boolean' | 'date' | 'color';

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  order?: number;
  color?: string;
}
export interface ConfigField {
  key: string;
  label: string;
  description: string;
  type: FieldType;
  defaultValue: FieldOption;
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  pattern?: string;
  group?: string;
  order?: number;
  visible?: boolean;
  enabled?: boolean;
}

export interface ConfigGroup {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  order?: number;
  fields: ConfigField[];
}

export interface SystemConfigEntity extends BaseEntity {
  groups: ConfigGroup[];
  version: string;
}

export const BLANK = 'blank';

export function blankOption(description: string): FieldOption {
  return { value: BLANK, label: '---------------', description, color: '#ffffff', order: 1 };
}

export const TEAM_MEMBERS_COMPANY_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado una empresa'),
  { value: 'company_internal', label: 'Bcp', description: 'Colaborador interno del BCP', order: 2 },
  { value: 'company_external', label: 'Proveedor', description: 'Colaborador externo que trabaja por contrato de servicio', order: 3 }
]

export const TEAM_MEMBERS_SENIORITY_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado un nivel de seniority'),
  { value: '1', label: 'Novato', description: 'Nuevo en el trabajo. Constantemente acompañado y mentoreado. Realiza tareas asignadas. La expectativa principal es su potencial e impulso para aprender', color: '#6c757d', order: 2 },
  { value: '2', label: 'Principiante Avanzado', description: 'Independiente en la entrega de valor. Solo mentoreado en situaciones desafiantes. Nivel medio con varios años de experiencia', color: '#17a2b8', order: 3 },
  { value: '3', label: 'Competente', description: 'Senior, toma decisiones y orienta a juniors. Estructura el trabajo del equipo y delega tareas. Mentorea novatos y principiantes avanzados', color: '#007bff', order: 4 },
  { value: '4', label: 'Proficiente', description: 'Ejecutor y fuerza visionaria de la solución técnica. Referente del departamento/organización. Imparte cursos y establece estándares', color: '#28a745', order: 5 },
  { value: '5', label: 'Master', description: 'Experto que guía el futuro de las prácticas. Reconocido fuera de la organización. Habla en conferencias y marca tendencia en su campo', color: '#ffc107', order: 6 },
];

export const FEEDBACK_PROVIDER_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado quién brinda el feedback'),
  { value: 'CL', label: 'Chapter Lead', description: 'Líder técnico responsable del desarrollo profesional del equipo', icon: 'school', color: '#007bff', order: 2 },
  { value: 'PO', label: 'Product Owner', description: 'Responsable de maximizar el valor del producto y gestionar el backlog', icon: 'inventory', color: '#28a745', order: 3 },
  { value: 'FP', label: 'Focal Point', description: 'Punto de contacto principal entre el equipo y stakeholders', icon: 'support_agent', color: '#17a2b8', order: 4 },
  { value: 'AC', label: 'Agile Coach', description: 'Facilitador de prácticas ágiles y mejora continua del equipo', icon: 'psychology', color: '#ffc107', order: 5 },
];

export const FEEDBACK_GENERAL_RATING_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado una calificación general'),
  { value: 'exceeds', label: 'Excede expectativas', description: 'El colaborador supera consistentemente lo esperado en su rol', icon: 'arrow_upward', color: '#28a745', order: 2 },
  { value: 'meets', label: 'Cumple expectativas', description: 'El colaborador cumple satisfactoriamente con lo esperado en su rol', icon: 'check_circle', color: '#007bff', order: 3 },
  { value: 'below', label: 'Por debajo de las expectativas', description: 'El colaborador no alcanza lo esperado y requiere mejoras', icon: 'arrow_downward', color: '#dc3545', order: 4 },
];

export const FEEDBACK_STATUS_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado el estado del feedback'),
  { value: 'draft', label: 'Borrador', description: 'Feedback en preparación, no visible para el destinatario', color: '#6c757d', order: 2 },
  { value: 'pending', label: 'Pendiente', description: 'Esperando revisión o acción', color: '#ffc107', order: 3 },
  { value: 'sent', label: 'Enviado', description: 'Feedback enviado al destinatario', color: '#17a2b8', order: 4 },
  { value: 'acknowledged', label: 'Recibido', description: 'El destinatario ha confirmado recepción', color: '#28a745', order: 5 },
  { value: 'completed', label: 'Completado', description: 'Proceso de feedback finalizado', color: '#007bff', order: 6 },
  { value: 'cancelled', label: 'Cancelado', description: 'Feedback cancelado', color: '#dc3545', order: 7 }
];

export const FEEDBACK_ACTIONABLE_PROVIDER_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado quién brinda el feedback'),
  { value: 'CL', label: 'Chapter Lead', description: 'Líder técnico responsable del desarrollo profesional del equipo', icon: 'school', color: '#007bff', order: 2 },
  { value: 'PO', label: 'Product Owner', description: 'Responsable de maximizar el valor del producto y gestionar el backlog', icon: 'inventory', color: '#28a745', order: 3 },
  { value: 'FP', label: 'Focal Point', description: 'Punto de contacto principal entre el equipo y stakeholders', icon: 'support_agent', color: '#17a2b8', order: 4 },
  { value: 'AC', label: 'Agile Coach', description: 'Facilitador de prácticas ágiles y mejora continua del equipo', icon: 'psychology', color: '#ffc107', order: 5 },
];

export const FEEDBACK_ACTIONABLE_STATUS_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado quién brinda el feedback'),
  { value: 'Pendiente', label: 'Pendiente', description: 'Acción planificada pero aún no iniciada', color: '#ffc107', order: 2 },
  { value: 'En Progreso', label: 'En Progreso', description: 'Acción actualmente en ejecución', color: '#17a2b8', order: 3 },
  { value: 'Completado', label: 'Completado', description: 'Acción finalizada exitosamente', color: '#28a745', order: 4 },
  { value: 'Cancelado', label: 'Cancelado', description: 'Acción que ha sido cancelada y no se realizará', color: '#dc3545', order: 5 }
];

export const FEEDBACK_TYPE_OPTIONS: FieldOption[] = [
  blankOption('Seleccione un tipo de feedback'),
  { value: 'appreciative', label: 'Apreciativo', description: 'Reconocer logros y buen desempeño', icon: 'star', color: '#ffc107', order: 2 },
  { value: 'constructive', label: 'Constructivo', description: 'Identificar oportunidades de crecimiento', icon: 'trending_up', color: '#17a2b8', order: 3 },
  { value: 'neutral', label: 'Neutro', description: 'Sin connotación positiva ni negativa.', icon: 'flag', color: '#6c757d', order: 4 },
];

export const PRIORITY_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado una prioridad'),
  { value: 'low', label: 'Baja', description: 'Sin urgencia, puede esperar', color: '#28a745', order: 2 },
  { value: 'medium', label: 'Media', description: 'Importancia moderada', color: '#ffc107', order: 3 },
  { value: 'high', label: 'Alta', description: 'Requiere atención pronta', color: '#fd7e14', order: 4 },
  { value: 'critical', label: 'Crítica', description: 'Acción inmediata requerida', color: '#dc3545', order: 5 }
];

export const FREQUENCY_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado una frecuencia'),
  { value: 'once', label: 'Una vez', description: 'Evento único', order: 2 },
  { value: 'daily', label: 'Diario', description: 'Todos los días', order: 3 },
  { value: 'weekly', label: 'Semanal', description: 'Una vez por semana', order: 4 },
  { value: 'biweekly', label: 'Quincenal', description: 'Cada dos semanas', order: 5 },
  { value: 'monthly', label: 'Mensual', description: 'Una vez al mes', order: 6 },
  { value: 'quarterly', label: 'Trimestral', description: 'Cada tres meses', order: 7 },
  { value: 'yearly', label: 'Anual', description: 'Una vez al año', order: 8 }
];

export const ROLE_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado un rol'),
  { value: 'member', label: 'Miembro', description: 'Miembro del equipo', order: 2 },
  { value: 'lead', label: 'Líder', description: 'Líder de equipo', order: 3 },
  { value: 'manager', label: 'Manager', description: 'Gerente directo', order: 4 },
  { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema', order: 5 }
];

export const VISIBILITY_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado una visibilidad'),
  { value: 'private', label: 'Privado', description: 'Solo visible para ti', icon: 'lock', order: 2 },
  { value: 'team', label: 'Equipo', description: 'Visible para tu equipo', icon: 'group', order: 3 },
  { value: 'squad', label: 'Squad', description: 'Visible para todo el squad', icon: 'groups', order: 4 },
  { value: 'public', label: 'Público', description: 'Visible para todos', icon: 'public', order: 5 }
];

export const EVALUATION_PERIOD_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado un período de evaluación'),
  { value: 'q1', label: 'Q1', description: 'Primer trimestre (Enero - Marzo)', order: 2 },
  { value: 'q2', label: 'Q2', description: 'Segundo trimestre (Abril - Junio)', order: 3 },
  { value: 'q3', label: 'Q3', description: 'Tercer trimestre (Julio - Septiembre)', order: 4 },
  { value: 'q4', label: 'Q4', description: 'Cuarto trimestre (Octubre - Diciembre)', order: 5 },
  { value: 'h1', label: 'H1', description: 'Primer semestre', order: 6 },
  { value: 'h2', label: 'H2', description: 'Segundo semestre', order: 6 },
  { value: 'annual', label: 'Anual', description: 'Evaluación del año completo', order: 7 }
];

export const PERFORMANCE_LEVEL_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado un nivel de desempeño'),
  { value: '5', label: 'Sobresaliente', description: 'El colaborador excede clara y sostenidamente los objetivos, expectativas y comportamientos esperados', color: '#28a745', order: 2 },
  { value: '4', label: 'Destacado', description: 'El colaborador excede varios de los objetivos, expectativas y comportamientos esperados', color: '#17a2b8', order: 3 },
  { value: '3', label: 'Muy bueno', description: 'El colaborador cumple con los objetivos, expectativas y comportamientos esperados', color: '#007bff', order: 4 },
  { value: '2', label: 'Necesita mejorar', description: 'El colaborador cumple con algunos objetivos, expectativas y comportamientos esperados', color: '#ffc107', order: 5 },
  { value: '1', label: 'Bajo desempeño', description: 'El colaborador no cumple con la mayoría de los objetivos, expectativas y comportamientos esperados', color: '#dc3545', order: 6 },
];

export const BOOLEAN_OPTIONS: FieldOption[] = [
  blankOption('No se ha especificado una opción'),
  { value: 'true', label: 'Sí', description: 'Habilitado', order: 2 },
  { value: 'false', label: 'No', description: 'Deshabilitado', order: 3 }
];

export const TEAM_MEMBERS_CONFIG_GROUP: ConfigGroup = {
  key: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_CONFIG_GROUP_KEY,
  label: 'Team Members',
  description: 'Configuración relacionada con los miembros del equipo de trabajo',
  icon: 'people',
  order: 2,
  fields: [
    {
      key: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_COMPANY_FIELD_KEY,
      label: 'Empresa donde trabajan',
      description: 'Empresa donde están registrados los miembros del equipo',
      type: 'select',
      defaultValue: TEAM_MEMBERS_COMPANY_OPTIONS.find(o => o.value === BLANK)!,
      options: TEAM_MEMBERS_COMPANY_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_CONFIG_GROUP_KEY,
      order: 1
    },
    {
      key: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_SENIORITY_FIELD_KEY,
      label: 'Nivel de Seniority',
      description: 'Nivel de experiencia y madurez profesional del colaborador',
      type: 'select',
      defaultValue: TEAM_MEMBERS_SENIORITY_OPTIONS.find(o => o.value === BLANK)!,
      options: TEAM_MEMBERS_SENIORITY_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_CONFIG_GROUP_KEY,
      order: 2
    },
  ]
};

export const FEEDBACK_CONFIG_GROUP: ConfigGroup = {
  key: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
  label: 'Feedback',
  description: 'Configuración relacionada con el sistema de feedback',
  icon: 'feedback',
  order: 1,
  fields: [
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_PERFORMANCE_LEVEL_FIELD_KEY,
      label: 'Nivel de Desempeño',
      description: 'Configuración de los niveles de evaluación de desempeño',
      type: 'select',
      defaultValue: PERFORMANCE_LEVEL_OPTIONS.find(o => o.value === BLANK)!,
      options: PERFORMANCE_LEVEL_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 1
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_PROVIDER_FIELD_KEY,
      label: 'Quién brinda el feedback',
      description: 'Rol de la persona que proporciona el feedback',
      type: 'select',
      defaultValue: FEEDBACK_PROVIDER_OPTIONS.find(o => o.value === BLANK)!,
      options: FEEDBACK_PROVIDER_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 2
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_GENERAL_RATING_FIELD_KEY,
      label: 'Calificación General',
      description: 'Evaluación global del desempeño del colaborador',
      type: 'select',
      defaultValue: FEEDBACK_GENERAL_RATING_OPTIONS.find(o => o.value === BLANK)!,
      options: FEEDBACK_GENERAL_RATING_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 3
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_DEFAULT_STATUS_FIELD_KEY,
      label: 'Estado por defecto',
      description: 'Estado inicial asignado a nuevos feedbacks',
      type: 'select',
      defaultValue: FEEDBACK_STATUS_OPTIONS.find(o => o.value === BLANK)!,
      options: FEEDBACK_STATUS_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 4
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_ACTION_STATUS_FIELD_KEY,
      label: 'Estado del plan de acción',
      description: 'Configuración del estado del plan de acción asociado a los feedbacks',
      type: 'select',
      defaultValue: FEEDBACK_ACTIONABLE_STATUS_OPTIONS.find(o => o.value === BLANK)!,
      options: FEEDBACK_ACTIONABLE_STATUS_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 5
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_ACTION_RESPONSIBLE_FIELD_KEY,
      label: 'Responsable del plan de acción',
      description: 'Configuración del responsable del plan de acción asociado a los feedbacks',
      type: 'select',
      defaultValue: FEEDBACK_ACTIONABLE_PROVIDER_OPTIONS.find(o => o.value === BLANK)!,
      options: FEEDBACK_ACTIONABLE_PROVIDER_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 6
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_TYPE_FIELD_KEY,
      label: 'Tipo por defecto',
      description: 'Tipo inicial sugerido para nuevos feedbacks',
      type: 'select',
      defaultValue: FEEDBACK_TYPE_OPTIONS.find(o => o.value === BLANK)!,
      options: FEEDBACK_TYPE_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 2
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_DEFAULT_VISIBILITY_FIELD_KEY,
      label: 'Visibilidad por defecto',
      description: 'Quién puede ver los feedbacks por defecto',
      type: 'select',
      defaultValue: VISIBILITY_OPTIONS.find(o => o.value === BLANK)!,
      options: VISIBILITY_OPTIONS,
      required: true,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 3
    },
    {
      key: SYSTEM_CONFIG_KEYS.FEEDBACK_REQUIRE_ACKNOWLEDGMENT_FIELD_KEY,
      label: 'Requerir confirmación',
      description: 'El destinatario debe confirmar que recibió el feedback',
      type: 'boolean',
      defaultValue: BOOLEAN_OPTIONS.find(o => o.value === BLANK)!,
      options: BOOLEAN_OPTIONS,
      group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,
      order: 4
    },
  ]
};

export const NOTIFICATIONS_CONFIG_GROUP: ConfigGroup = {
  key: SYSTEM_CONFIG_KEYS.NOTIFICATIONS_REMINDER_DAYS_FIELD_KEY,
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
      defaultValue: BOOLEAN_OPTIONS.find(o => o.value === BLANK)!,
      options: BOOLEAN_OPTIONS,
      group: 'notifications',
      order: 1
    },
    {
      key: 'notifications_email',
      label: 'Notificaciones por email',
      description: 'Recibir notificaciones también por correo electrónico',
      type: 'boolean',
      defaultValue: BOOLEAN_OPTIONS.find(o => o.value === BLANK)!,
      options: BOOLEAN_OPTIONS,
      group: 'notifications',
      order: 2
    },
    {
      key: 'notifications_frequency',
      label: 'Frecuencia de resumen',
      description: 'Con qué frecuencia recibir resumen de actividad',
      type: 'select',
      defaultValue: FREQUENCY_OPTIONS.find(o => o.value === BLANK)!,
      options: FREQUENCY_OPTIONS.filter(o => [BLANK, 'daily', 'weekly', 'monthly'].includes(o.value)),
      group: 'notifications',
      order: 3
    }
  ]
};

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
      defaultValue: EVALUATION_PERIOD_OPTIONS.find(o => o.value === BLANK)!,
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
      defaultValue: PRIORITY_OPTIONS.find(o => o.value === BLANK)!,
      options: PRIORITY_OPTIONS,
      group: 'evaluations',
      order: 2
    },
    {
      key: 'evaluation_self_assessment',
      label: 'Auto-evaluación habilitada',
      description: 'Permitir que los usuarios se auto-evalúen',
      type: 'boolean',
      defaultValue: BOOLEAN_OPTIONS.find(o => o.value === BLANK)!,
      options: BOOLEAN_OPTIONS,
      group: 'evaluations',
      order: 3
    },
    {
      key: 'evaluation_peer_review',
      label: 'Revisión de pares',
      description: 'Habilitar evaluaciones entre compañeros del mismo nivel',
      type: 'boolean',
      defaultValue: BOOLEAN_OPTIONS.find(o => o.value === BLANK)!,
      options: BOOLEAN_OPTIONS,
      group: 'evaluations',
      order: 4
    }
  ]
};

// export const APPEARANCE_CONFIG_GROUP: ConfigGroup = {
//   key: 'appearance',
//   label: 'Apariencia',
//   description: 'Personalización visual del sistema',
//   icon: 'palette',
//   order: 5,
//   fields: [
//     {
//       key: 'appearance_theme',
//       label: 'Tema',
//       description: 'Esquema de colores de la interfaz',
//       type: 'select',
//       defaultValue: { value: 'light', label: 'Claro', description: 'Fondo claro con texto oscuro', order: 1 },
//       options: [
//         { value: 'light', label: 'Claro', description: 'Fondo claro con texto oscuro', order: 1 },
//         { value: 'dark', label: 'Oscuro', description: 'Fondo oscuro con texto claro', order: 2 },
//         { value: 'system', label: 'Sistema', description: 'Seguir preferencia del sistema operativo', order: 3 }
//       ],
//       group: 'appearance',
//       order: 1
//     },
//     {
//       key: 'appearance_compact_mode',
//       label: 'Modo compacto',
//       description: 'Reducir espaciado para mostrar más contenido',
//       type: 'boolean',
//       defaultValue: BOOLEAN_OPTIONS.find(o => o.value === BLANK)!,
//       options: BOOLEAN_OPTIONS,
//       group: 'appearance',
//       order: 2
//     },
//     {
//       key: 'appearance_primary_color',
//       label: 'Color primario',
//       description: 'Color principal de la interfaz',
//       type: 'color',
//       defaultValue: { value: '#002a8d', label: '#002a8d', description: 'Color principal de la interfaz' },
//       group: 'appearance',
//       order: 3
//     }
//   ]
// };

export const ALL_CONFIG_GROUPS: ConfigGroup[] = [
  FEEDBACK_CONFIG_GROUP,
  TEAM_MEMBERS_CONFIG_GROUP,
  NOTIFICATIONS_CONFIG_GROUP,
  EVALUATIONS_CONFIG_GROUP,
  // APPEARANCE_CONFIG_GROUP
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export function isFieldOption(value: unknown): value is FieldOption {
  return value !== null && typeof value === 'object' && 'value' in (value as any) && 'label' in (value as any);
}

export function resolveFieldValue(field: ConfigField): string {
  return field.defaultValue.value;
}

export function getDefaultFieldOption(fieldKey: string): FieldOption | null {
  for (const group of ALL_CONFIG_GROUPS) {
    const field = group.fields.find(f => f.key === fieldKey);
    if (field) {
      return field.defaultValue;
    }
  }
  return null;
}

export function getFieldDefaultValue(fieldKey: string): FieldOption | null {
  for (const group of ALL_CONFIG_GROUPS) {
    const field = group.fields.find(f => f.key === fieldKey);
    if (field) {
      return field.defaultValue;
    }
  }
  return null;
}

export function getFieldDefinition(fieldKey: string): ConfigField | undefined {
  for (const group of ALL_CONFIG_GROUPS) {
    const field = group.fields.find(f => f.key === fieldKey);
    if (field) {
      return field;
    }
  }
  return undefined;
}

export function getOptionLabel(options: FieldOption[], value: string): string {
  const option = options.find(o => o.value === value);
  return option?.label || value;
}

export function getOptionColor(options: FieldOption[], value: string): string | undefined {
  const option = options.find(o => o.value === value);
  return option?.color;
}

export function createDefaultSystemConfig(): SystemConfigEntity {
  return {
    id: 1,
    groups: structuredClone(ALL_CONFIG_GROUPS),
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    updateTimestamp: function () { this.updatedAt = new Date(); }
  };
}
