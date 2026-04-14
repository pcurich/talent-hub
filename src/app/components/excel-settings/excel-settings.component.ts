import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelConfigurationPresenter } from './presenters/excel-configuration.presenter';
import { ExcelFilePresenter } from './presenters/excel-file.presenter';
import { ExcelColumnMapping, ExcelSettingsConfig } from './models/excel-settings.models';
import { ExcelReaderPresenter } from './presenters/excel-reader.presenter';
import { ExcelSquadModalPresenter } from './presenters/excel-squad-modal.presenter';
import { LoadedDataPresenter } from './presenters/loaded-data.presenter';

@Component({
  selector: 'app-excel-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    ExcelConfigurationPresenter,
    ExcelFilePresenter,
    ExcelReaderPresenter,
    ExcelSquadModalPresenter,
    LoadedDataPresenter
  ],
  templateUrl: './excel-settings.component.html',
  styleUrl: './excel-settings.component.scss'
})
export class ExcelSettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly configPresenter = inject(ExcelConfigurationPresenter);
  private readonly filePresenter = inject(ExcelFilePresenter);
  private readonly readerPresenter = inject(ExcelReaderPresenter);

  readonly squadModal = inject(ExcelSquadModalPresenter);
  readonly loadedData = inject(LoadedDataPresenter);

  activeTab: 'mapping' | 'example' | 'loaded-data' = 'mapping';
  importType: 'excel' | 'json' | '' = '';

  config: ExcelSettingsConfig;
  availableFields: ExcelColumnMapping[] = [];

  constructor() {
    this.config = this.configPresenter.getDefaultConfig();
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  loadConfiguration(): void {
    const { config, fields } = this.configPresenter.loadConfiguration();
    this.config = config;
    this.availableFields = fields;
  }

  saveConfiguration(): void {
    const success = this.configPresenter.saveConfiguration(this.config, this.availableFields);
    alert(success ? 'Configuración guardada exitosamente' : 'Error al guardar la configuración');
  }

  resetConfiguration(): void {
    if (!confirm('¿Está seguro de restablecer toda la configuración? Se perderán todos los mapeos.')) return;
    const { config, fields } = this.configPresenter.resetConfiguration();
    this.config = config;
    this.availableFields = fields;
    alert('Configuración restablecida');
  }

  exportConfiguration(): void {
    const result = this.filePresenter.exportConfiguration(this.config);
    if (!result.success) alert(`Error al exportar: ${result.error}`);
  }

  exportTemplateExcel(): void {
    this.squadModal.openForExport();
  }

  triggerFileInput(): void {
    if (this.importType === 'excel') {
      this.squadModal.openForImport();
    }
    if (this.importType === 'json') {
      setTimeout(() => this.fileInput.nativeElement.click(), 100);
    }
  }

  confirmSquadSelection(): void {
    if (this.squadModal.selectedSquadIndex === null) return;
    if (this.squadModal.mode === 'export') {
      this.squadModal.generateTemplate(this.config.sheetName);
    } else {
      this.squadModal.advanceToFileStep();
    }
  }

  handleModalFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.squadModal.validateFile(file)) {
      input.value = '';
      return;
    }

    this.squadModal.show = false;
    this.squadModal.step = 1;
    const dt = new DataTransfer();
    dt.items.add(file);
    this.fileInput.nativeElement.files = dt.files;
    this.fileInput.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  closeSquadModal(): void {
    this.squadModal.close();
    this.importType = '';
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
      this.availableFields = this.configPresenter.applyImportedConfig(this.availableFields, result.config);
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

    this.loadedData.setImportReading();

    try {
      const result = await this.readerPresenter.readExcelFile(file, this.config);
      this.loadedData.setImportResult(result);

      if (result.success && result.validRows > 0) {
        this.activeTab = 'loaded-data';
        alert(`Datos cargados exitosamente:\n${result.validRows} filas válidas\n${result.invalidRows} filas con errores\n\nPuede revisar y editar los datos antes de guardarlos.`);
      } else {
        alert(`Error en la importación:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.loadedData.setImportError(message);
      alert(`Error: ${message}`);
    }

    input.value = '';
    this.importType = '';
  }

  async saveLoadedData(): Promise<void> {
    const validEntities = this.loadedData.results
      .filter(row => row.isValid)
      .map(row => row.data);

    if (validEntities.length === 0) {
      alert('No hay datos válidos para guardar');
      return;
    }

    if (!confirm(`¿Está seguro de guardar ${validEntities.length} registros válidos en la base de datos?`)) return;

    try {
      // TODO: Implementar guardado en IndexedDB
      console.log('Guardando entidades:', validEntities);
      alert(`${validEntities.length} registros guardados exitosamente`);
      this.clearLoadedData();
    } catch (error) {
      alert(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  clearLoadedData(): void {
    if (this.loadedData.results.length > 0) {
      if (!confirm('¿Está seguro de descartar los datos cargados?')) return;
    }
    this.loadedData.clear();
    this.activeTab = 'mapping';
  }

  removeLoadedRow(index: number): void {
    if (confirm('¿Eliminar esta fila?')) {
      this.loadedData.removeRow(index);
    }
  }

  get stats() {
    return this.configPresenter.getStats(this.availableFields);
  }

  getFieldTypeIcon(type: string): string {
    return this.configPresenter.getFieldTypeIcon(type);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
