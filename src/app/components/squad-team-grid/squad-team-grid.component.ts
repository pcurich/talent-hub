import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CURRENT_USER_REPOSITORY } from '../../tokens/repository.tokens';
import { CurrentUser, Squad, TeamMember } from '../../model/current-user.model';
import { SquadExcelPresenter } from './squad-excel.presenter';
import { ExcelImportResultService } from '../../services/excel-import-result.service';
import { FeedbackIndexeddbRepository } from '../../repository/feedback.indexeddb.repository';
import { ExcelReaderService } from '../../services/excel-reader.service';

interface TeamMemberRow {
  squad: Squad;
  teamMember: TeamMember;
}

@Component({
  selector: 'app-squad-team-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [SquadExcelPresenter, ExcelReaderService, ExcelImportResultService],
  templateUrl: './squad-team-grid.component.html',
  styleUrl: './squad-team-grid.component.scss'
})
export class SquadTeamGridComponent implements OnInit {
  @ViewChild('uploadFileInput') uploadFileInput!: ElementRef<HTMLInputElement>;

  private currentUserRepo = inject(CURRENT_USER_REPOSITORY);
  private router = inject(Router);
  private feedbackRepo = inject(FeedbackIndexeddbRepository);
  readonly squadExcel = inject(SquadExcelPresenter);

  currentUser: CurrentUser = {} as CurrentUser;
  rowActionMap: Record<string, string> = new Proxy({} as Record<string, string>, {
    get: (target, prop: string) => target[prop] ?? '',
    set: (target, prop: string, value: string) => { target[prop] = value; return true; }
  });

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

  goToShowFeedback(row: TeamMemberRow): void {
    this.router.navigate(['/show-feedback', row.teamMember.registration], {
      state: {
        squad: row.squad,
        teamMember: row.teamMember
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  downloadTemplate(row: TeamMemberRow): void {
    this.squadExcel.downloadTemplateForTeamMember(row.squad, row.teamMember);
  }

  onRowAction(action: string, row: TeamMemberRow): void {
    this.rowActionMap[row.teamMember.registration] = '';

    switch (action) {
      case 'create':   this.goToCreateFeedback(row); break;
      case 'view':     this.goToShowFeedback(row); break;
      case 'upload':   this.squadExcel.openUploadForSquad(row.squad); break;
      case 'download': this.downloadTemplate(row); break;
    }
  }

  downloadGridTemplate(): void {
    this.squadExcel.downloadTemplateForRows(this.filteredTeamMembers());
  }

  uploadGridTemplate(): void {
    this.squadExcel.openUploadForGrid();
  }

  onUploadGridFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.squadExcel.handleUploadGridFile(file).finally(() => {
      input.value = '';
    });
  }

  onUploadFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.squadExcel.handleUploadFile(file).finally(() => {
      input.value = '';
    });
  }

  triggerUploadInput(): void {
    this.uploadFileInput?.nativeElement.click();
  }

  trackByRegistration(index: number, row: TeamMemberRow): string {
    return row.teamMember.registration;
  }

  async saveLoadedFeedbacks(): Promise<void> {
    const entities = this.squadExcel.loadedData.importState.result?.entities ?? [];
    let saved = 0;
    for (const entity of entities) {
      const ok = await this.feedbackRepo.create(entity);
      if (ok) saved++;
    }
    alert(`${saved} feedback(s) guardado(s) correctamente.`);
    this.squadExcel.closeResultModal();
  }

  removeLoadedRow(index: number): void {
    this.squadExcel.loadedData.removeRow(index);
  }
}
