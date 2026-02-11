import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../model/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedFilter: 'all' | 'unread' | 'read' = 'all';

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    // Mock data - esto se conectaría a un servicio real
    this.notifications = this.getMockNotifications();
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.selectedFilter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.read);
        break;
      case 'read':
        this.filteredNotifications = this.notifications.filter(n => n.read);
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  setFilter(filter: 'all' | 'unread' | 'read'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.applyFilter();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
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

  private getMockNotifications(): Notification[] {
    return [
      { id: '1', title: 'Nuevo feedback recibido', message: 'Tu manager ha enviado un nuevo feedback sobre tu desempeño', type: 'info', read: false, createdAt: new Date() },
      { id: '2', title: 'Evaluación completada', message: 'La evaluación trimestral ha sido completada exitosamente', type: 'success', read: false, createdAt: new Date(Date.now() - 3600000) },
      { id: '3', title: 'Fecha límite próxima', message: 'Tienes 3 días para completar tu auto-evaluación', type: 'warning', read: false, createdAt: new Date(Date.now() - 7200000) },
      { id: '4', title: 'Nuevo miembro en squad', message: 'Juan Pérez se ha unido al equipo Alpha', type: 'info', read: true, createdAt: new Date(Date.now() - 86400000) },
      { id: '5', title: 'Objetivo cumplido', message: 'Has alcanzado el 100% de tu objetivo mensual', type: 'success', read: true, createdAt: new Date(Date.now() - 172800000) },
      { id: '6', title: 'Reunión programada', message: 'Se ha agendado una reunión 1:1 para mañana', type: 'info', read: false, createdAt: new Date(Date.now() - 259200000) },
      { id: '7', title: 'Actualización del sistema', message: 'El sistema estará en mantenimiento el domingo', type: 'warning', read: true, createdAt: new Date(Date.now() - 345600000) },
      { id: '8', title: 'Reconocimiento recibido', message: 'María García te ha dado un reconocimiento', type: 'success', read: false, createdAt: new Date(Date.now() - 432000000) },
      { id: '9', title: 'Error en sincronización', message: 'No se pudo sincronizar con el servidor', type: 'error', read: true, createdAt: new Date(Date.now() - 518400000) },
      { id: '10', title: 'Nuevo proyecto asignado', message: 'Has sido asignado al proyecto Innovation', type: 'info', read: true, createdAt: new Date(Date.now() - 604800000) },
      { id: '11', title: 'Capacitación disponible', message: 'Nueva capacitación de liderazgo disponible', type: 'info', read: false, createdAt: new Date(Date.now() - 691200000) },
      { id: '12', title: 'Feedback pendiente', message: 'Tienes 2 feedbacks pendientes por completar', type: 'warning', read: false, createdAt: new Date(Date.now() - 777600000) },
    ];
  }
}
