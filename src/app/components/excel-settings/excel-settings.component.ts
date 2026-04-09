import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExcelConfigurationPresenter } from './presenters/excel-configuration.presenter';
import { ExcelFilePresenter } from './presenters/excel-file.presenter';
import { ExcelColumnMapping, ExcelRowError, ExcelRowResult, ExcelSettingsConfig, FilterCriteria, ImportOptions, ImportState } from './models/excel-settings.models';
import { ExcelReaderPresenter } from './presenters/excel-reader.presenter';
import { CURRENT_USER_REPOSITORY, SYSTEM_CONFIG_REPOSITORY } from '../../tokens/repository.tokens';
import { Squad } from '../../model/current-user.model';

@Component({
  selector: 'app-excel-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ExcelConfigurationPresenter, ExcelFilePresenter, ExcelReaderPresenter],
  templateUrl: './excel-settings.component.html',
  styleUrl: './excel-settings.component.scss'
})
export class ExcelSettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private router = inject(Router);
  private configPresenter = inject(ExcelConfigurationPresenter);
  private filePresenter = inject(ExcelFilePresenter);
  private readerPresenter = inject(ExcelReaderPresenter);

  private systemConfigRepo = inject(SYSTEM_CONFIG_REPOSITORY);
  private currentUserRepo = inject(CURRENT_USER_REPOSITORY);

  activeTab: 'general' | 'mapping' | 'example' | 'loaded-data' = 'general';
  importType: 'excel' | 'json' | '' = '';
  fileName: string = '';

  config: ExcelSettingsConfig;
  availableFields: ExcelColumnMapping[] = [];
  filteredFields: ExcelColumnMapping[] = [];

  searchTerm: string = '';
  showOnlyRequired: boolean = false;
  showOnlyMapped: boolean = false;

  // Estado de importación de datos Excel
  importState: ImportState = {
    status: 'idle',
    progress: 0,
    currentRow: 0,
    totalRows: 0
  };

  // Datos cargados para edición
  loadedRowResults: ExcelRowResult[] = [];

  // Filtro para datos cargados
  dataSearchTerm: string = '';
  showOnlyValidRows: boolean = true;

  // Modal de selección de squad
  showSquadModal = false;
  modalStep: 1 | 2 = 1;
  selectedSquadIndex: number | null = null;
  modalFileError: string = '';
  private currentUser = this.currentUserRepo.get();

  get availableSquads(): Squad[] {
    return this.currentUser()?.squads ?? [];
  }

  get selectedSquad(): Squad | null {
    if (this.selectedSquadIndex === null) return null;
    return this.availableSquads[this.selectedSquadIndex] ?? null;
  }

  get expectedFileName(): string {
    const squad = this.selectedSquad;
    const user = this.currentUser();
    if (!squad || !user) return '';
    this.fileName = `${squad.name.replaceAll(' ', '_')}_${user.directManager.registration}.xlsx`;
    return this.fileName;
  }

  constructor() {
    this.config = this.configPresenter.getDefaultConfig();
  }

  ngOnInit(): void {
    this.loadConfiguration();
    this.applyFilters();
  }

  loadConfiguration(): void {
    const { config, fields } = this.configPresenter.loadConfiguration();
    this.config = config;
    this.availableFields = fields;
  }

  applyFilters(): void {
    const criteria: FilterCriteria = {
      searchTerm: this.searchTerm,
      showOnlyRequired: this.showOnlyRequired,
      showOnlyMapped: this.showOnlyMapped
    };
    this.filteredFields = this.configPresenter.applyFilters(this.availableFields, criteria);
  }

  saveConfiguration(): void {
    const success = this.configPresenter.saveConfiguration(this.config, this.availableFields);
    if (success) {
      alert('Configuración guardada exitosamente');
    } else {
      alert('Error al guardar la configuración');
    }
  }

  resetConfiguration(): void {
    if (confirm('¿Está seguro de restablecer toda la configuración? Se perderán todos los mapeos.')) {
      const { config, fields } = this.configPresenter.resetConfiguration();
      this.config = config;
      this.availableFields = fields;
      this.applyFilters();
      alert('Configuración restablecida');
    }
  }

  exportConfiguration(): void {
    const result = this.filePresenter.exportConfiguration(this.config);
    if (!result.success) {
      alert(`Error al exportar: ${result.error}`);
    }
  }

  triggerFileInput(): void {
    if (this.importType === 'excel') {
      this.selectedSquadIndex = null;
      this.showSquadModal = true;
    } else if (this.importType) {
      setTimeout(() => {
        this.fileInput.nativeElement.click();
      }, 100);
    }
  }

  confirmSquadSelection(): void {
    if (this.selectedSquadIndex === null) return;
    this.modalStep = 2;
    this.modalFileError = '';
  }

  handleModalFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.name !== this.fileName) {
      this.modalFileError = `Se esperaba "${this.fileName}" pero se seleccionó "${file.name}".`;
      input.value = '';
      return;
    }

    this.modalFileError = '';
    this.showSquadModal = false;
    this.modalStep = 1;
    // Re-emit via the hidden file input so handleImport flow is preserved
    const dt = new DataTransfer();
    dt.items.add(file);
    this.fileInput.nativeElement.files = dt.files;
    this.fileInput.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  closeSquadModal(): void {
    this.showSquadModal = false;
    this.modalStep = 1;
    this.importType = '';
    this.selectedSquadIndex = null;
    this.modalFileError = '';
  }

  async handleImport(event: Event): Promise<void> {
    if (this.importType === 'excel') {
      await this.importExcelData(event);
    } else {
      await this.importConfiguration(event);
    }
  }

  async importConfiguration(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const result = await this.filePresenter.importConfiguration(file);

    if (result.success && result.config) {
      this.config = result.config;
      this.availableFields = this.configPresenter.applyImportedConfig(
        this.availableFields,
        result.config
      );
      this.applyFilters();
      alert('Configuración importada exitosamente');
    } else {
      alert(`Error al importar: ${result.error}`);
    }

    input.value = '';
  }

  async importExcelData(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;


    const options: ImportOptions = {
      skipInvalidRows: true,
      validateBeforeImport: true,
      clearExistingData: false
    };

    this.importState.status = 'reading';

    try {
      const result = await this.readerPresenter.readExcelFile(file, this.config, options);

      this.importState = {
        status: 'completed',
        progress: 100,
        currentRow: result.totalRows,
        totalRows: result.totalRows,
        result
      };
      debugger;

      if (result.success && result.validRows > 0) {
        // Cargar los resultados completos para pre-visualización y edición
        this.loadedRowResults = result.rows;
        // .filter(row => this.showOnlyValidRows ? row.isValid : true)
        // .map(row => row.data);

        // Cambiar automáticamente al tab de datos cargados
        this.activeTab = 'loaded-data';

        alert(`Datos cargados exitosamente:\n${result.validRows} filas válidas\n${result.invalidRows} filas con errores\n\nPuede revisar y editar los datos antes de guardarlos.`);

      } else {
        alert(`Error en la importación:\n${result.errors.join('\n')}`);
      }

    } catch (error) {
      this.importState = {
        status: 'error',
        progress: 0,
        currentRow: 0,
        totalRows: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      alert(`Error: ${this.importState.error}`);
    }

    input.value = '';
    this.importType = '';
  }

  /**
 * Obtiene los valores únicos de una columna para el select del bulk edit
 */
  getColumnUniqueValues(column: any): string[] {
    const values = new Set<string>();
    this.getFilteredLoadedEntities().forEach(row => {
      const val = this.getNestedValue(row.data, column.field);
      if (val !== null && val !== undefined && val !== '') {
        values.add(String(val));
      }
    });
    return Array.from(values).sort();
  }

  /**
   * Aplica un valor a todas las filas de una columna
   */
  applyBulkValue(column: any, value: string): void {
    if (!value) return;
    this.getFilteredLoadedEntities().forEach(row => {
      this.setNestedValue(row.data, column.field, value);
    });
  }

  // Obtener las columnas dinámicas basadas en los headers
  getTableColumns(): { key: string; label: string; field: string }[] {
    if (this.loadedRowResults.length === 0) {
      return [];
    }

    const columns: { key: string; label: string; field: string }[] = [];

    // Agregar columnas fijas
    columns.push({ key: 'rowNumber', label: '#', field: 'number' });
    columns.push({ key: 'status', label: 'Estado', field: '_status' });

    // Agregar columnas dinámicas desde mappings
    if (this.config.mappings && this.config.mappings.length > 0) {
      this.config.mappings.forEach(mapping => {
        const columnLetter = mapping.excelCell.match(/^[A-Z]+/)?.[0];
        if (columnLetter) {
          columns.push({
            key: mapping.entityField,
            label: mapping.label,
            field: mapping.entityField
          });
        }
      });
    }

    columns.push({ key: 'actions', label: 'Acciones', field: '_actions' });
    debugger;
    return columns;
  }


  // Obtener valor de una propiedad anidada
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  // Establecer valor de una propiedad anidada
  setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  async saveLoadedData(): Promise<void> {
    const validEntities = this.loadedRowResults
      .filter(row => row.isValid)
      .map(row => row.data);

    if (validEntities.length === 0) {
      alert('No hay datos válidos para guardar');
      return;
    }

    if (!confirm(`¿Está seguro de guardar ${validEntities.length} registros válidos en la base de datos?`)) {
      return;
    }

    try {
      // TODO: Implementar guardado en IndexedDB
      // await this.feedbackService.saveMultiple(validEntities);

      console.log('Guardando entidades:', validEntities);
      alert(`${validEntities.length} registros guardados exitosamente`);

      // Limpiar datos cargados y volver al tab principal
      this.clearLoadedData();

    } catch (error) {
      alert(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  clearLoadedData(): void {
    if (this.loadedRowResults.length > 0) {
      if (!confirm('¿Está seguro de descartar los datos cargados?')) {
        return;
      }
    }

    this.loadedRowResults = [];
    this.importState = {
      status: 'idle',
      progress: 0,
      currentRow: 0,
      totalRows: 0
    };
    this.activeTab = 'general';
  }

  removeLoadedRow(index: number): void {
    if (confirm('¿Eliminar esta fila?')) {
      this.loadedRowResults.splice(index, 1);
    }
  }

  getFilteredLoadedEntities(): ExcelRowResult[] {
    if (!this.dataSearchTerm) {
      return this.loadedRowResults;
    }

    const term = this.dataSearchTerm.toLowerCase();
    return this.loadedRowResults.filter(row =>
      Object.values(row.data).some(value =>
        value?.toString().toLowerCase().includes(term)
      )
    );
  }

  getMappedCount(): number {
    return this.configPresenter.getStats(this.availableFields).mappedFields;
  }

  getRequiredCount(): number {
    return this.configPresenter.getStats(this.availableFields).requiredFields;
  }

  getMappedRequiredCount(): number {
    return this.configPresenter.getStats(this.availableFields).mappedRequiredFields;
  }

  getFieldTypeIcon(type: string): string {
    return this.configPresenter.getFieldTypeIcon(type);
  }

  trackByField(index: number): number {
    return index;
  }

  trackByEntity(index: number): number {
    return index;
  }

  getErrorMessages(errors: ExcelRowError[]): string {
    return errors.map(err => `${err.field}: ${err.message}`).join('\n');
  }

  getValidRowsCount(): number {
    return this.loadedRowResults.filter(row => row.isValid).length;
  }

}
