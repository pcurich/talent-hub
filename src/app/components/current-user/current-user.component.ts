import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CURRENT_USER_REPOSITORY } from '../../tokens/repository.tokens';
import { CurrentUser, Person, Squad, TeamMember } from '../../model/current-user.model';

@Component({
  selector: 'app-current-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './current-user.component.html',
  styleUrl: './current-user.component.scss'
})
export class CurrentUserComponent implements OnInit {
  private currentUserRepo = inject(CURRENT_USER_REPOSITORY);

  currentUser : CurrentUser = this.currentUserRepo.get()();
  isEditing = false;

  // Campos editables
  editableUser: Person = { name: '', registration: '', email: '' };
  editableManager: Person = { name: '', registration: '', email: '' };
  editableSquads: Squad[] = [];

  constructor() {
    this.currentUserRepo.initService();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.currentUser = this.currentUserRepo.get()();
    this.resetEditableFields();
  }

  resetEditableFields(): void {
    if (this.currentUser?.user) {
      this.editableUser = { ...this.currentUser.user };
    }
    if (this.currentUser?.directManager) {
      this.editableManager = { ...this.currentUser.directManager };
    }
    if (this.currentUser?.squads) {
      this.editableSquads = this.currentUser.squads.map(squad => ({
        ...squad,
        productOwner: { ...squad.productOwner },
        teamMembers: squad.teamMembers?.map(tm => ({ ...tm })) || []
      }));
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.resetEditableFields();
    }
  }

  // Squad management
  addSquad(): void {
    this.editableSquads.push({
      name: '',
      productOwner: { name: '', registration: '', email: '' },
      teamMembers: []
    });
  }

  removeSquad(index: number): void {
    this.editableSquads.splice(index, 1);
  }

  // Team member management
  addTeamMember(squadIndex: number): void {
    this.editableSquads[squadIndex].teamMembers.push({
      name: '',
      registration: '',
      email: ''
    });
  }

  removeTeamMember(squadIndex: number, memberIndex: number): void {
    this.editableSquads[squadIndex].teamMembers.splice(memberIndex, 1);
  }

  async saveChanges(): Promise<void> {
    try {
      const updatedUser: CurrentUser = {
        ...this.currentUser,
        user: { ...this.editableUser },
        directManager: { ...this.editableManager },
        squads: this.editableSquads.map(squad => ({
          ...squad,
          productOwner: { ...squad.productOwner },
          teamMembers: squad.teamMembers.map(tm => ({ ...tm }))
        })),
        updatedAt: new Date(),
        updateTimestamp: () => { this.currentUser.updatedAt = new Date(); }
      };

      await this.currentUserRepo.update(updatedUser);
      this.isEditing = false;
      this.loadCurrentUser();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  }

  getSquadMembersCount(squad: Squad): number {
    return squad.teamMembers?.length || 0;
  }
}
