import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { Notification } from '../../model/notification.model';
import { deleteDatabase } from '@pcurich/client-storage-indexeddb';
import { getIndexedDbConfigWithRegistration } from '../../util/indexeddb-config.util';
import { STORAGE_KEYS } from '../../constants/general.constants';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, NavbarComponent, ToastComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {
  private router = inject(Router);

  title = 'Talent Hub';
  showNotificationsDropdown = false;

  // Mock de notificaciones - conectar con servicio real
  notifications: Notification[] = [
    { id: '1', title: 'Nuevo feedback recibido', message: 'Tu manager ha enviado un nuevo feedback', type: 'info', read: false, createdAt: new Date() },
    { id: '2', title: 'Evaluación completada', message: 'La evaluación trimestral ha sido completada', type: 'success', read: false, createdAt: new Date(Date.now() - 3600000) },
    { id: '3', title: 'Fecha límite próxima', message: 'Tienes 3 días para completar tu auto-evaluación', type: 'warning', read: false, createdAt: new Date(Date.now() - 7200000) },
    { id: '4', title: 'Nuevo miembro en squad', message: 'Juan Pérez se ha unido al equipo', type: 'info', read: true, createdAt: new Date(Date.now() - 86400000) },
    { id: '5', title: 'Objetivo cumplido', message: 'Has alcanzado el 100% de tu objetivo', type: 'success', read: true, createdAt: new Date(Date.now() - 172800000) },
    { id: '6', title: 'Reunión programada', message: 'Se ha agendado una reunión 1:1', type: 'info', read: false, createdAt: new Date(Date.now() - 259200000) },
    { id: '7', title: 'Actualización del sistema', message: 'El sistema estará en mantenimiento', type: 'warning', read: true, createdAt: new Date(Date.now() - 345600000) },
    { id: '8', title: 'Reconocimiento recibido', message: 'María García te ha dado un reconocimiento', type: 'success', read: false, createdAt: new Date(Date.now() - 432000000) },
    { id: '9', title: 'Error en sincronización', message: 'No se pudo sincronizar con el servidor', type: 'error', read: true, createdAt: new Date(Date.now() - 518400000) },
    { id: '10', title: 'Nuevo proyecto asignado', message: 'Has sido asignado al proyecto Innovation', type: 'info', read: true, createdAt: new Date(Date.now() - 604800000) },
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get displayedNotifications(): Notification[] {
    return this.notifications.slice(0, 10);
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  closeNotifications(): void {
    this.showNotificationsDropdown = false;
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'info': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
      'success': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      'warning': 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
      'error': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
    };
    return icons[type] || icons['info'];
  }

  /**
   * Restaura el sistema: elimina la base de datos IndexedDB,
   * limpia localStorage y redirecciona al inicio.
   */
  async restoreSystem(): Promise<void> {
    if (!confirm('¿Estás seguro de restaurar el sistema? Se eliminarán todos los datos.')) {
      return;
    }

    try {
      // Obtener el registration actual
      const registration = localStorage.getItem(STORAGE_KEYS.CURRENT_REGISTRATION) || '';

      // Obtener configuración y eliminar la base de datos
      const config = getIndexedDbConfigWithRegistration(registration);
      await deleteDatabase(config);
      console.log('[MainLayout] Base de datos eliminada correctamente');

      // Limpiar localStorage
      localStorage.clear();
      console.log('[MainLayout] localStorage limpiado');

      // Redireccionar al root
      // this.router.navigate(['/auth/login']);
      window.location.reload();
    } catch (error) {
      console.error('[MainLayout] Error al restaurar sistema:', error);
      alert('Error al restaurar el sistema. Por favor, inténtalo de nuevo.');
    }
  }
}
