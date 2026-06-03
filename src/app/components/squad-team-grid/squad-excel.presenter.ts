import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { Squad, TeamMember } from '../../model/current-user.model';
import { CURRENT_USER_REPOSITORY } from '../../tokens/repository.tokens';
import { ExcelConfigurationPresenter } from '../excel-settings/presenters/excel-configuration.presenter';
import { ExcelReaderPresenter } from '../excel-settings/presenters/excel-reader.presenter';
import { LoadedDataPresenter } from '../excel-settings/presenters/loaded-data.presenter';
import { ExcelColumnMapping } from '../excel-settings/models/excel-settings.models';
import { DataValidationEntry } from '../excel-settings/utils/excel-validation.util';
import { buildStyledWorkbook, triggerDownload } from '../excel-settings/utils/excel-writer.util';

@Injectable()
export class SquadExcelPresenter {
  private readonly currentUserRepo = inject(CURRENT_USER_REPOSITORY);
  private readonly configPresenter = inject(ExcelConfigurationPresenter);
  private readonly readerPresenter = inject(ExcelReaderPresenter);
  readonly loadedData = inject(LoadedDataPresenter);

  // Upload (file selector) modal state
  showUploadModal = false;
  uploadSquad: Squad | null = null;
  uploadFileError = '';
  isProcessing = false;

  // Grid upload modal state
  showUploadGridModal = false;
  uploadGridFileError = '';
  isGridProcessing = false;

  // Import result modal state
  showResultModal = false;
  uploadMappings: ExcelColumnMapping[] = [];

  getExpectedFileName(squad: Squad): string {
    const currentUser = this.currentUserRepo.get()();
    if (!squad || !currentUser) return '';
    return `${squad.name.replaceAll(' ', '_')}_${currentUser.directManager.registration}.xlsx`;
  }

  openUploadForSquad(squad: Squad): void {
    this.uploadSquad = squad;
    this.uploadFileError = '';
    this.isProcessing = false;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadSquad = null;
    this.uploadFileError = '';
    this.isProcessing = false;
  }

  getExpectedGridFileName(): string {
    const currentUser = this.currentUserRepo.get()();
    if (!currentUser) return '';
    return `Todos_los_Squads_${currentUser.directManager.registration}.xlsx`;
  }

  openUploadForGrid(): void {
    this.uploadGridFileError = '';
    this.isGridProcessing = false;
    this.showUploadGridModal = true;
  }

  closeUploadGridModal(): void {
    this.showUploadGridModal = false;
    this.uploadGridFileError = '';
    this.isGridProcessing = false;
  }

  async handleUploadGridFile(file: File): Promise<void> {
    const expectedName = this.getExpectedGridFileName();
    if (file.name !== expectedName) {
      this.uploadGridFileError = `Se esperaba "${expectedName}" pero se seleccionó "${file.name}".`;
      return;
    }

    this.uploadGridFileError = '';
    this.isGridProcessing = true;

    try {
      const { config, fields } = this.configPresenter.loadConfiguration();
      this.uploadMappings = fields;
      const result = await this.readerPresenter.readExcelFile(file, config);
      this.loadedData.setImportResult(result);
      this.showUploadGridModal = false;
      this.isGridProcessing = false;
      this.showResultModal = true;
    } catch (error) {
      this.uploadGridFileError = error instanceof Error ? error.message : 'Error desconocido al leer el archivo.';
      this.isGridProcessing = false;
    }
  }

  async handleUploadFile(file: File): Promise<void> {
    if (!this.uploadSquad) return;

    const expectedName = this.getExpectedFileName(this.uploadSquad);
    if (file.name !== expectedName) {
      this.uploadFileError = `Se esperaba "${expectedName}" pero se seleccionó "${file.name}".`;
      return;
    }

    this.uploadFileError = '';
    this.isProcessing = true;

    try {
      const { config, fields } = this.configPresenter.loadConfiguration();
      this.uploadMappings = fields;
      const result = await this.readerPresenter.readExcelFile(file, config);
      this.loadedData.setImportResult(result);
      this.showUploadModal = false;
      this.isProcessing = false;
      this.showResultModal = true;
    } catch (error) {
      this.uploadFileError = error instanceof Error ? error.message : 'Error desconocido al leer el archivo.';
      this.isProcessing = false;
    }
  }

  closeResultModal(): void {
    this.showResultModal = false;
    this.loadedData.clear();
    this.uploadMappings = [];
  }

  downloadTemplateForSquad(squad: Squad): void {
    const currentUser = this.currentUserRepo.get()();
    if (!currentUser) return;

    const fileName = `${squad.name.replaceAll(' ', '_')}_${currentUser.directManager.registration}.xlsx`;
    const sheetName = this.configPresenter.loadConfiguration().config.sheetName || 'BCP';

    const fields = this.configPresenter.getDefaultFields().sort((a, b) => {
      const colA = a.excelCell.replace(/\d+/, '');
      const colB = b.excelCell.replace(/\d+/, '');
      return colA < colB ? -1 : colA > colB ? 1 : 0;
    });

    const headers = fields.map(f => f.label);

    const rows = squad.teamMembers.map((member, idx) => {
      const row: Record<string, any> = {};
      fields.forEach(f => {
        switch (f.entityField) {
          case 'number':                   row[f.label] = idx + 1; break;
          case 'teamMember.registration':  row[f.label] = member.registration ?? ''; break;
          case 'teamMember.name':          row[f.label] = member.name ?? ''; break;
          case 'teamMember.companyKey':    row[f.label] = member.companyValue ?? ''; break;
          case 'squad.name':              row[f.label] = squad.name ?? ''; break;
          case 'squad.productOwner.name': row[f.label] = squad.productOwner?.name ?? ''; break;
          default:                         row[f.label] = '';
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const dvEntries: DataValidationEntry[] = [];
    fields.forEach(f => {
      if (f.fieldType === 'select' && f.options && f.options.length > 0) {
        const col = f.excelCell.replace(/\d+$/, '');
        const labels = f.options
          .filter(o => o.value !== 'blank')
          .map(o => o.label)
          .join(',');
        if (labels && labels.length <= 253) {
          dvEntries.push({ sqref: `${col}2:${col}1048576`, formula1: `"${labels}"` });
        }
      }
    });

    const blob = buildStyledWorkbook({ wb, fields, dvEntries });
    triggerDownload(blob, fileName);
  }

  downloadTemplateForTeamMember(squad: Squad, teamMember: TeamMember): void {
    this.downloadTemplateForSquad({ ...squad, teamMembers: [teamMember] });
  }

  downloadTemplateForRows(rows: Array<{ squad: Squad; teamMember: TeamMember }>): void {
    if (rows.length === 0) return;

    const currentUser = this.currentUserRepo.get()();
    if (!currentUser) return;

    const uniqueSquadNames = [...new Set(rows.map(r => r.squad.name))];
    const baseName = uniqueSquadNames.length === 1 ? uniqueSquadNames[0].replaceAll(' ', '_') : 'Todos_los_Squads';
    const fileName = `${baseName}_${currentUser.directManager.registration}.xlsx`;
    const sheetName = this.configPresenter.loadConfiguration().config.sheetName || 'BCP';

    const fields = this.configPresenter.getDefaultFields().sort((a, b) => {
      const colA = a.excelCell.replace(/\d+/, '');
      const colB = b.excelCell.replace(/\d+/, '');
      return colA < colB ? -1 : colA > colB ? 1 : 0;
    });

    const headers = fields.map(f => f.label);

    const excelRows = rows.map(({ squad, teamMember }, idx) => {
      const row: Record<string, any> = {};
      fields.forEach(f => {
        switch (f.entityField) {
          case 'number':                  row[f.label] = idx + 1; break;
          case 'teamMember.registration': row[f.label] = teamMember.registration ?? ''; break;
          case 'teamMember.name':         row[f.label] = teamMember.name ?? ''; break;
          case 'teamMember.companyKey':   row[f.label] = teamMember.companyValue ?? ''; break;
          case 'squad.name':              row[f.label] = squad.name ?? ''; break;
          case 'squad.productOwner.name': row[f.label] = squad.productOwner?.name ?? ''; break;
          default:                        row[f.label] = '';
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(excelRows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const dvEntries: DataValidationEntry[] = [];
    fields.forEach(f => {
      if (f.fieldType === 'select' && f.options && f.options.length > 0) {
        const col = f.excelCell.replace(/\d+$/, '');
        const labels = f.options
          .filter(o => o.value !== 'blank')
          .map(o => o.label)
          .join(',');
        if (labels && labels.length <= 253) {
          dvEntries.push({ sqref: `${col}2:${col}1048576`, formula1: `"${labels}"` });
        }
      }
    });

    const blob = buildStyledWorkbook({ wb, fields, dvEntries });
    triggerDownload(blob, fileName);
  }
}
