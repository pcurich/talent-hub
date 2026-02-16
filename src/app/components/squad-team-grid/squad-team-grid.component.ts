import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CURRENT_USER_REPOSITORY } from '../../tokens/repository.tokens';
import { CurrentUser, Squad, TeamMember } from '../../model/current-user.model';

interface TeamMemberRow {
  squad: Squad;
  teamMember: TeamMember;
}

@Component({
  selector: 'app-squad-team-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './squad-team-grid.component.html',
  styleUrl: './squad-team-grid.component.scss'
})
export class SquadTeamGridComponent implements OnInit {
  private currentUserRepo = inject(CURRENT_USER_REPOSITORY);
  private router = inject(Router);

  currentUser: CurrentUser = {} as CurrentUser;

  // Filters
  selectedSquadName = signal<string>('');
  selectedProductOwnerName = signal<string>('');

  // Computed lists for filters
  squads = computed<Squad[]>(() => {
    return this.currentUser?.squads || [];
  });

  productOwners = computed<string[]>(() => {
    const selectedSquad = this.selectedSquadName();
    const squadsToFilter = selectedSquad
      ? this.squads().filter(s => s.name === selectedSquad)
      : this.squads();

    const uniquePOs = new Set<string>();
    squadsToFilter.forEach(squad => {
      if (squad.productOwner?.name) {
        uniquePOs.add(squad.productOwner.name);
      }
    });
    return Array.from(uniquePOs).sort();
  });

  // Filtered team members
  filteredTeamMembers = computed<TeamMemberRow[]>(() => {
    const rows: TeamMemberRow[] = [];
    const selectedSquad = this.selectedSquadName();
    const selectedPO = this.selectedProductOwnerName();

    let squadsToProcess = this.squads();

    // Filter by squad
    if (selectedSquad) {
      squadsToProcess = squadsToProcess.filter(s => s.name === selectedSquad);
    }

    // Filter by product owner
    if (selectedPO) {
      squadsToProcess = squadsToProcess.filter(s => s.productOwner?.name === selectedPO);
    }

    // Build rows
    squadsToProcess.forEach(squad => {
      squad.teamMembers?.forEach(teamMember => {
        rows.push({ squad, teamMember });
      });
    });

    return rows;
  });

  ngOnInit(): void {
    this.currentUser = this.currentUserRepo.get()();
  }

  onSquadFilterChange(squadName: string): void {
    this.selectedSquadName.set(squadName);
    // Reset product owner filter when squad changes
    this.selectedProductOwnerName.set('');
  }

  onProductOwnerFilterChange(poName: string): void {
    this.selectedProductOwnerName.set(poName);
  }

  clearFilters(): void {
    this.selectedSquadName.set('');
    this.selectedProductOwnerName.set('');
  }

  goToCreateFeedback(row: TeamMemberRow): void {
    // Navigate to create feedback with state containing squad and teamMember
    this.router.navigate(['/create-feedback'], {
      state: {
        squad: row.squad,
        teamMember: row.teamMember
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByRegistration(index: number, row: TeamMemberRow): string {
    return row.teamMember.registration;
  }
}
