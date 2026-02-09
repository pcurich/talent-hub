import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CURRENT_USER_REPOSITORY, INIT_APP_REPOSITORY } from '../../tokens/repository.tokens';
import { STORAGE_KEYS } from '../../constants/general.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {

  // ✅ Inyección a nivel de clase (contexto de inyección válido)
  private initRepo = inject(INIT_APP_REPOSITORY);
  private currentUserRepo = inject(CURRENT_USER_REPOSITORY);
  private router = inject(Router);

  registration = '';
  email = '';
  errorMessage = '';

  async save(): Promise<void> {
    this.errorMessage = '';
    const registration = this.registration.trim();
    const email = this.email.trim();

    if (!registration || !email) {
      this.errorMessage = 'Completa matrícula y correo.';
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_REGISTRATION, registration);
      localStorage.setItem(STORAGE_KEYS.CURRENT_EMAIL, email);


      await this.initRepo.initializeDatabase(registration);
      let existingUser = await this.currentUserRepo.exists(registration);

      if (!existingUser) {
        this.router.navigate(['/init']);
        return Promise.resolve();
      }

      console.log('Base de datos inicializada, navegando a home...');
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Error al inicializar la base de datos:', err);
      this.errorMessage = 'Error al inicializar la base de datos. Intenta nuevamente.';
    }
  }
}
