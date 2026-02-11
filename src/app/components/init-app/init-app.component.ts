import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Person, Squad, TeamMember, CurrentUser } from '../../model/current-user.model';
import { Router } from '@angular/router';
import { CURRENT_USER_REPOSITORY } from '../../tokens/repository.tokens';

@Component({
  selector: 'app-init-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './init-app.component.html',
  styleUrl: './init-app.component.scss'
})
export class InitAppComponent {

  // ✅ Inyección a nivel de clase (contexto de inyección válido)
  private currentUserRepo = inject(CURRENT_USER_REPOSITORY);
  private router = inject(Router);

  currentStep = signal(1);
  isCreatingSquad = true;

  wizardData: CurrentUser = {
    user: { name: 'Pedro Curich', registration: 'T10541', email: 'pedrocurich@example.com' },
    directManager: { name: 'Brayan', registration: 'T10542', email: 'brayan@example.com' },
    squads: [],
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    updateTimestamp: function (): void {
      throw new Error('Function not implemented.');
    }
  };

  newSquad: Squad = this.createEmptySquad();
  newTeamMember: TeamMember = this.createEmptyPerson();


  // ============ NAVIGATION ============
  nextStep(): void {
    if (this.canProceed()) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep(): void {
    this.currentStep.update(step => step - 1);
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1:
        return true; // Fase 1 siempre puede avanzar
      case 2:
        return this.isStep2Valid();
      case 3:
        return true;
      default:
        return false;
    }
  }

  // ============ VALIDATION ============
  isStep2Valid(): boolean {
    const userValid = this.isPersonValid(this.wizardData.user);
    const managerValid = this.isPersonValid(this.wizardData.directManager);
    const squadsValid = this.wizardData.squads.length > 0;

    return userValid && managerValid && squadsValid;
  }

  isPersonValid(person: Person): boolean {
    return !!(person.name && person.registration && person.email);
  }

  isSquadValid(squad: Squad): boolean {
    return !!(
      squad.name &&
      this.isPersonValid(squad.productOwner) &&
      squad.teamMembers.length > 0
    );
  }

  // ============ SQUAD MANAGEMENT ============
  startNewSquad(): void {
    this.isCreatingSquad = true;
    this.newSquad = this.createEmptySquad();
    this.newTeamMember = this.createEmptyPerson();
  }

  saveSquad(): void {
    if (this.isSquadValid(this.newSquad)) {
      if (!this.wizardData.squads) {
        this.wizardData.squads = [];
      }
      this.wizardData.squads.push({ ...this.newSquad });
      this.isCreatingSquad = false;
      this.newSquad = this.createEmptySquad();
      this.newTeamMember = this.createEmptyPerson();
    }
  }

  cancelNewSquad(): void {
    this.isCreatingSquad = false;
    this.newSquad = this.createEmptySquad();
    this.newTeamMember = this.createEmptyPerson();
  }

  removeSquad(index: number): void {
    this.wizardData.squads.splice(index, 1);
  }

  // ============ TEAM MEMBER MANAGEMENT ============
  addTeamMember(): void {
    if (this.isPersonValid(this.newTeamMember)) {
      this.newSquad.teamMembers.push({ ...this.newTeamMember });
      this.newTeamMember = this.createEmptyPerson();
    }
  }

  removeTeamMember(index: number): void {
    this.newSquad.teamMembers.splice(index, 1);
  }

  // ============ HELPERS ============
  createEmptyPerson(): Person {
    return { name: 'Carlos Montes de Oca', registration: 'X9999999', email: 'carlosmontes@example.com' };
  }

  createEmptySquad(): Squad {
    return {
      name: 'SQ TRANSFORM II',
      productOwner: this.createEmptyPerson(),
      teamMembers: []
    };
  }

  async finish(): Promise<void> {
    try {
      delete (this.wizardData as any).id;
      await this.currentUserRepo.create(this.wizardData);
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al inicializar el sistema:', error);
      alert('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  }
}
