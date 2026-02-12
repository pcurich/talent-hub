/**
 * Tipos de toast disponibles
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Configuración de un mensaje toast
 */
export interface ToastMessage {
  /** Identificador único del toast */
  id: string;
  /** Tipo de toast (determina el estilo) */
  type: ToastType;
  /** Texto del mensaje */
  text: string;
  /** Duración en milisegundos (0 = no auto-cerrar) */
  duration: number;
  /** Timestamp de creación */
  createdAt: Date;
}

/**
 * Opciones para crear un toast
 */
export interface ToastOptions {
  /** Duración en ms (default: 4000, 0 = no auto-cerrar) */
  duration?: number;
}

/**
 * Configuración por defecto para toasts
 */
export const TOAST_DEFAULTS = {
  duration: 4000,
  maxToasts: 5
} as const;
