import { Injectable, signal, computed } from '@angular/core';
import { ToastMessage, ToastOptions, ToastType, TOAST_DEFAULTS } from './toast.model';

/**
 * Servicio singleton para gestionar toasts en toda la aplicación.
 * Permite mostrar mensajes de éxito, error, advertencia e información.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);

  /** Lista de toasts activos (solo lectura) */
  readonly toasts = this.toastsSignal.asReadonly();

  /** Indica si hay toasts visibles */
  readonly hasToasts = computed(() => this.toastsSignal().length > 0);

  /**
   * Muestra un toast de éxito
   */
  success(text: string, options?: ToastOptions): void {
    this.show('success', text, options);
  }

  /**
   * Muestra un toast de error
   */
  error(text: string, options?: ToastOptions): void {
    this.show('error', text, options);
  }

  /**
   * Muestra un toast de advertencia
   */
  warning(text: string, options?: ToastOptions): void {
    this.show('warning', text, options);
  }

  /**
   * Muestra un toast informativo
   */
  info(text: string, options?: ToastOptions): void {
    this.show('info', text, options);
  }

  /**
   * Muestra un toast con tipo y mensaje personalizados
   */
  show(type: ToastType, text: string, options?: ToastOptions): void {
    const duration = options?.duration ?? TOAST_DEFAULTS.duration;

    const toast: ToastMessage = {
      id: this.generateId(),
      type,
      text,
      duration,
      createdAt: new Date()
    };

    // Agregar toast y limitar cantidad máxima
    this.toastsSignal.update(toasts => {
      const updated = [...toasts, toast];
      // Mantener solo los últimos N toasts
      if (updated.length > TOAST_DEFAULTS.maxToasts) {
        return updated.slice(-TOAST_DEFAULTS.maxToasts);
      }
      return updated;
    });

    // Auto-cerrar si tiene duración
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, duration);
    }
  }

  /**
   * Cierra un toast específico por su ID
   */
  dismiss(id: string): void {
    this.toastsSignal.update(toasts =>
      toasts.filter(t => t.id !== id)
    );
  }

  /**
   * Cierra todos los toasts
   */
  dismissAll(): void {
    this.toastsSignal.set([]);
  }

  /**
   * Genera un ID único para el toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
