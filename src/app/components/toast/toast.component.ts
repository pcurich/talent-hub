import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { ToastMessage } from './toast.model';

/**
 * Componente de Toast reutilizable.
 * Muestra mensajes de notificación en la esquina superior derecha.
 *
 * Uso: Agregar <app-toast></app-toast> en el layout principal (app.component o main-layout).
 * Luego inyectar ToastService en cualquier componente y usar sus métodos.
 *
 * @example
 * // En el componente que quiere mostrar un toast:
 * private toast = inject(ToastService);
 *
 * this.toast.success('Guardado correctamente');
 * this.toast.error('Error al guardar');
 * this.toast.warning('Atención: datos incompletos');
 * this.toast.info('Procesando...');
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  /**
   * Obtiene el path SVG del icono según el tipo de toast
   */
  getIconPath(type: string): string {
    const icons: Record<string, string> = {
      success: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
      warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
      info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
    };
    return icons[type] || icons['info'];
  }

  /**
   * Cierra un toast específico
   */
  dismiss(toast: ToastMessage): void {
    this.toastService.dismiss(toast.id);
  }
}
