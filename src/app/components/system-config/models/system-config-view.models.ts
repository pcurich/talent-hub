/**
 * Modelos para la vista de configuración del sistema
 */

import { ConfigField, ConfigGroup, FieldOption } from '../../../model/system-config.model';

/**
 * Estado de un campo en la vista
 */
export interface FieldViewState {
  /** Campo de configuración */
  field: ConfigField;
  /** Si está expandido para ver opciones */
  isExpanded: boolean;
  /** Si se está editando actualmente */
  isEditing: boolean;
  /** Opciones del campo con estado de edición */
  optionsState: OptionViewState[];
}

/**
 * Estado de una opción en la vista
 */
export interface OptionViewState {
  /** Opción original */
  option: FieldOption;
  /** Si está siendo editada */
  isEditing: boolean;
  /** Valores temporales durante edición */
  editValues?: OptionEditValues;
}

/**
 * Valores temporales durante la edición de una opción
 */
export interface OptionEditValues {
  value: string;
  label: string;
  description?: string;
  color?: string;
  disabled?: boolean;
}

/**
 * Datos para crear/editar una opción
 */
export interface OptionFormData {
  value: string;
  label: string;
  description?: string;
  color?: string;
  order?: number;
  disabled?: boolean;
}

/**
 * Resultado de una operación CRUD
 */
export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Estado del modal de edición
 */
export interface FieldEditorModalState {
  isOpen: boolean;
  field: ConfigField | null;
  groupKey: string | null;
  /** Modo del modal */
  mode: 'view' | 'add' | 'edit';
  /** Índice de la opción siendo editada (si aplica) */
  editingOptionIndex: number | null;
  /** Formulario de opción actual */
  optionForm: OptionFormData;
  /** Opciones modificadas (copia de trabajo) */
  workingOptions: FieldOption[];
  /** Si hay cambios sin guardar */
  hasUnsavedChanges: boolean;
}

/**
 * Acciones del modal de edición
 */
export type FieldEditorAction =
  | { type: 'OPEN_MODAL'; payload: { field: ConfigField; groupKey: string } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_MODE'; payload: 'view' | 'add' | 'edit' }
  | { type: 'START_ADD_OPTION' }
  | { type: 'START_EDIT_OPTION'; payload: number }
  | { type: 'CANCEL_EDIT' }
  | { type: 'UPDATE_FORM'; payload: Partial<OptionFormData> }
  | { type: 'SAVE_OPTION' }
  | { type: 'DELETE_OPTION'; payload: number }
  | { type: 'TOGGLE_OPTION_DISABLED'; payload: number }
  | { type: 'REORDER_OPTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SAVE_ALL_CHANGES' }
  | { type: 'RESET_CHANGES' };

/**
 * Estado inicial del modal de edición
 */
export const INITIAL_EDITOR_MODAL_STATE: FieldEditorModalState = {
  isOpen: false,
  field: null,
  groupKey: null,
  mode: 'view',
  editingOptionIndex: null,
  optionForm: {
    value: '',
    label: '',
    description: '',
    color: '',
    disabled: false
  },
  workingOptions: [],
  hasUnsavedChanges: false
};

/**
 * Formulario inicial vacío
 */
export const EMPTY_OPTION_FORM: OptionFormData = {
  value: '',
  label: '',
  description: '',
  color: '',
  order: 0,
  disabled: false
};
