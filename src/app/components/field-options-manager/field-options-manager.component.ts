import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExcelColumnMapping } from '../excel-settings/models/excel-settings.models';
import { ExcelConfigurationPresenter } from '../excel-settings/presenters/excel-configuration.presenter';
import { FieldWithOptions } from './model/field-options-manager.models';


@Component({
  selector: 'app-field-options-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ExcelConfigurationPresenter],
  templateUrl: './field-options-manager.component.html',
  styleUrl: './field-options-manager.component.scss'
})
export class FieldOptionsManagerComponent implements OnInit {
  private router = inject(Router);
  private configPresenter = inject(ExcelConfigurationPresenter);

  allFields: ExcelColumnMapping[] = [];
  selectFields: FieldWithOptions[] = [];
  filteredFields: FieldWithOptions[] = [];

  searchTerm: string = '';
  showOnlyWithOptions: boolean = false;

  // Estado de edición
  editingOption: { fieldIndex: number; optionIndex: number } | null = null;
  editOptionValue: string = '';
  editOptionLabel: string = '';

  get fieldsWithOptionsCount(): number {
    return this.selectFields.filter(item => item.field.options && item.field.options.length > 0).length;
  }

  getTotalOptionsCount(): number {
    return this.selectFields.reduce((total, item) => {
      return total + (item.field.options?.length || 0);
    }, 0);
  }

  ngOnInit(): void {
    this.loadFields();
    this.applyFilters();
  }

  loadFields(): void {
    const { fields } = this.configPresenter.loadConfiguration();
    this.allFields = fields;

    // Filtrar solo campos de tipo select
    this.selectFields = this.allFields
      .filter(f => f.fieldType === 'select')
      .map(field => ({
        field: {
          ...field,
          options: field.options || []
        },
        isExpanded: false,
        isEditing: false,
        newOptionValue: '',
        newOptionLabel: ''
      }));
  }

  applyFilters(): void {
    this.filteredFields = this.selectFields.filter(item => {
      const matchesSearch = !this.searchTerm ||
        item.field.label.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.field.entityField.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesOptions = !this.showOnlyWithOptions ||
        (item.field.options && item.field.options.length > 0);

      return matchesSearch && matchesOptions;
    });
  }

  toggleExpand(index: number): void {
    this.filteredFields[index].isExpanded = !this.filteredFields[index].isExpanded;
  }

  toggleAddOption(index: number): void {
    this.filteredFields[index].isEditing = !this.filteredFields[index].isEditing;
    if (!this.filteredFields[index].isEditing) {
      this.filteredFields[index].newOptionValue = '';
      this.filteredFields[index].newOptionLabel = '';
    }
  }

  addOption(index: number): void {
    const item = this.filteredFields[index];
    const value = item.newOptionValue.trim();
    const label = item.newOptionLabel.trim();

    if (!value || !label) {
      alert('Debe completar valor y etiqueta');
      return;
    }

    if (!item.field.options) {
      item.field.options = [];
    }

    // Verificar que no exista el valor
    if (item.field.options.some(opt => opt.value === value)) {
      alert('Ya existe una opción con ese valor');
      return;
    }

    item.field.options.push({ value, label });
    item.newOptionValue = '';
    item.newOptionLabel = '';
    item.isEditing = false;

    this.saveChanges();
  }

  startEditOption(fieldIndex: number, optionIndex: number): void {
    const option = this.filteredFields[fieldIndex].field.options![optionIndex];
    this.editingOption = { fieldIndex, optionIndex };
    this.editOptionValue = option.value;
    this.editOptionLabel = option.label;
  }

  saveEditOption(): void {
    if (!this.editingOption) return;

    const value = this.editOptionValue.trim();
    const label = this.editOptionLabel.trim();

    if (!value || !label) {
      alert('Debe completar valor y etiqueta');
      return;
    }

    const { fieldIndex, optionIndex } = this.editingOption;
    const options = this.filteredFields[fieldIndex].field.options!;

    // Verificar que no exista otro valor igual (excepto el actual)
    if (options.some((opt, idx) => opt.value === value && idx !== optionIndex)) {
      alert('Ya existe una opción con ese valor');
      return;
    }

    options[optionIndex] = { value, label };
    this.cancelEditOption();
    this.saveChanges();
  }

  cancelEditOption(): void {
    this.editingOption = null;
    this.editOptionValue = '';
    this.editOptionLabel = '';
  }

  deleteOption(fieldIndex: number, optionIndex: number): void {
    if (!confirm('¿Está seguro de eliminar esta opción?')) return;

    this.filteredFields[fieldIndex].field.options!.splice(optionIndex, 1);
    this.saveChanges();
  }

  toggleOptionDisabled(fieldIndex: number, optionIndex: number): void {
    const option = this.filteredFields[fieldIndex].field.options![optionIndex];
    option.disabled = !option.disabled;
    this.saveChanges();
  }

  saveChanges(): void {
    // Actualizar allFields con los cambios de selectFields
    this.selectFields.forEach(item => {
      const fieldIndex = this.allFields.findIndex(f => f.entityField === item.field.entityField);
      if (fieldIndex !== -1) {
        this.allFields[fieldIndex].options = item.field.options;
      }
    });

    // Guardar en localStorage
    const { config } = this.configPresenter.loadConfiguration();
    const success = this.configPresenter.saveConfiguration(config, this.allFields);

    if (success) {
      console.log('Opciones guardadas exitosamente');
    } else {
      alert('Error al guardar las opciones');
    }
  }

  exportOptions(): void {
    const data = this.selectFields.map(item => ({
      entityField: item.field.entityField,
      label: item.field.label,
      options: item.field.options || []
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `field-options-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async importOptions(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!Array.isArray(importedData)) {
        alert('Formato de archivo inválido');
        return;
      }

      // Aplicar opciones importadas
      importedData.forEach((imported: any) => {
        const field = this.selectFields.find(f => f.field.entityField === imported.entityField);
        if (field && imported.options) {
          field.field.options = imported.options;
        }
      });

      this.saveChanges();
      this.applyFilters();
      alert('Opciones importadas exitosamente');

    } catch (error) {
      alert('Error al importar opciones: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }

    input.value = '';
  }

  trackByField(index: number): number {
    return index;
  }

  trackByOption(index: number): number {
    return index;
  }
}
