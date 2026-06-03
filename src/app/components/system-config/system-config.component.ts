import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ALL_CONFIG_GROUPS,
  ConfigField,
  ConfigGroup,
  createDefaultSystemConfig,
  FieldOption,
  SystemConfigEntity
} from '../../model/system-config-entity.model';
import { SYSTEM_CONFIG_REPOSITORY } from '../../tokens/repository.tokens';
import { SystemConfigFieldEditorPresenter } from './presenters/system-config-field-editor.presenter';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [SystemConfigFieldEditorPresenter],
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.scss'
})
export class SystemConfigComponent implements OnInit {
  private systemConfigRepo = inject(SYSTEM_CONFIG_REPOSITORY);
  private toastService = inject(ToastService);

  // Presenter para edición de opciones de campo
  readonly editorPresenter = inject(SystemConfigFieldEditorPresenter);

  configGroups = ALL_CONFIG_GROUPS;
  activeGroupKey = signal<string>('feedback');
  configValues = signal<Map<string, any>>(new Map());
  hasChanges = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  // Tooltip activo
  activeTooltip = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.initializeConfig();
  }

  /**
   * Inicializa la configuración:
   * - Si existe en IndexedDB, carga desde el repositorio
   * - Si no existe, crea con valores por defecto
   */
  private async initializeConfig(): Promise<void> {
    this.isLoading.set(true);
    try {
      const exists = await this.systemConfigRepo.exists();

      if (!exists) {
        // No existe config, crear con valores por defecto
        const defaultConfig = createDefaultSystemConfig();
        await this.systemConfigRepo.create(defaultConfig);
        console.log('[SystemConfigComponent] Config por defecto creada en IndexedDB');
      }

      // Cargar configuración desde el repositorio
      this.loadConfigFromRepo();
    } catch (error) {
      console.error('[SystemConfigComponent] Error al inicializar config:', error);
      // Fallback: cargar valores por defecto en memoria
      this.loadDefaultValues();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga la configuración desde el repositorio (IndexedDB)
   */
  private loadConfigFromRepo(): void {
    const config = this.systemConfigRepo.get()();
    let values = new Map<string, any>();

    if (config?.groups) {
      // Actualizar configGroups con los datos del repositorio
      this.configGroups = config.groups;

      for (const group of config.groups) {
        for (const field of group.fields || []) {
          try {
            values.set(field.key, field.defaultValue?.value);
          } catch (error) {
            console.error(`[SystemConfigComponent] Error al cargar valor para campo '${field.key}':`, error);
          }
        }
      }
    } else {
      values = this.loadDefaultValues();
    }

    this.configValues.set(values);
  }

  /**
   * Carga los valores por defecto en memoria
   */
  private loadDefaultValues(): Map<string, any> {
    const defaultConfig = createDefaultSystemConfig();
    const values = new Map<string, any>();
    for (const group of defaultConfig.groups) {
      for (const field of group.fields || []) {
        values.set(field.key, field.defaultValue.value);
      }
    }
   return values;
  }


  get activeGroup(): ConfigGroup | undefined {
    return this.configGroups.find(g => g.key === this.activeGroupKey());
  }

  selectGroup(groupKey: string): void {
    this.activeGroupKey.set(groupKey);
  }

  getValue(fieldKey: string): any {
    return this.configValues().get(fieldKey);
  }

  setValue(fieldKey: string, value: any): void {
    const values = new Map(this.configValues());
    values.set(fieldKey, value);
    this.configValues.set(values);
    this.hasChanges.set(true);
  }

  onSelectChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOption = field.options?.find(o => o.value === target.value);
    this.setValue(field.key, target.value);
    if (selectedOption) {
      this.setFieldOption(field.key, selectedOption);
    }
  }

  onMultiSelectChange(field: ConfigField, option: FieldOption, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentValue: string[] = this.getValue(field.key) || [];

    if (target.checked) {
      this.setValue(field.key, [...currentValue, option.value]);
    } else {
      this.setValue(field.key, currentValue.filter(v => v !== option.value));
    }
  }

  onBooleanChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    const boolValue = String(target.checked);
    this.setValue(field.key, boolValue);
    const option = field.options?.find(o => o.value === boolValue);
    if (option) {
      this.setFieldOption(field.key, option);
    }
  }

  onTextChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(field.key, target.value);
  }

  onNumberChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(field.key, target.value);
  }

  onColorChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(field.key, target.value);
  }

  isOptionSelected(field: ConfigField, optionValue: string): boolean {
    const value = this.getValue(field.key);
    if (Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  }

  showTooltip(fieldKey: string): void {
    this.activeTooltip.set(fieldKey);
  }

  hideTooltip(): void {
    this.activeTooltip.set(null);
  }

  private fieldOptionMap = new Map<string, FieldOption>();

  private setFieldOption(fieldKey: string, option: FieldOption): void {
    this.fieldOptionMap.set(fieldKey, option);
  }

  async saveConfig(): Promise<void> {
    this.isSaving.set(true);

    try {
      const currentConfig = this.systemConfigRepo.get()();
      // Clonar los grupos y actualizar los valores de los campos
      const groups = structuredClone(this.configGroups || ALL_CONFIG_GROUPS);

      for (const group of groups) {
        for (const field of group.fields || []) {
          const newValue = this.configValues().get(field.key);
          if (newValue !== undefined) {
            const option = this.fieldOptionMap.get(field.key)
              ?? field.options?.find(o => o.value === String(newValue))
              ?? { value: String(newValue), label: String(newValue) };
            field.defaultValue = option;
          }
        }
      }

      // Calcular nueva versión automáticamente (incrementar minor)
      const currentVersion = currentConfig?.version || '1.0.0';
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      const newVersion = `${major}.${minor + 1}.${patch}`;

      const config: SystemConfigEntity = {
        id: currentConfig?.id || 1,
        groups,
        version: newVersion,
        createdAt: currentConfig?.createdAt || new Date(),
        updatedAt: new Date(),
        updateTimestamp: function () { this.updatedAt = new Date(); }
      };

      // Guardar en IndexedDB mediante repositorio
      const success = await this.systemConfigRepo.update(config);

      if (success) {
        this.hasChanges.set(false);
        this.toastService.success(`Configuración guardada correctamente (v${newVersion})`);
        console.log('[SystemConfigComponent] Configuración guardada correctamente');

      } else {
        this.toastService.error('Error al guardar la configuración. Inténtalo de nuevo.');
        console.error('[SystemConfigComponent] Error al guardar configuración');
      }
    } catch (error) {
      this.toastService.error('Error inesperado al guardar la configuración.');
      console.error('[SystemConfigComponent] Error al guardar configuración:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  async resetToDefaults(): Promise<void> {
    if (confirm('¿Estás seguro de restaurar la configuración por defecto? Se perderán todos los cambios.')) {
      try {
        // Resetear en el repositorio
        const success = await this.systemConfigRepo.resetToDefaults();

        if (success) {
          // Recargar desde el repositorio
          this.loadConfigFromRepo();
          this.hasChanges.set(false);
          console.log('[SystemConfigComponent] Config reseteada a valores por defecto');
        }
      } catch (error) {
        console.error('[SystemConfigComponent] Error al resetear config:', error);
        // Fallback: resetear solo en memoria
        this.loadDefaultValues();
        this.hasChanges.set(true);
      }
    }
  }

  cancelChanges(): void {
    if (this.hasChanges()) {
      if (confirm('¿Descartar los cambios sin guardar?')) {
        this.loadConfigFromRepo();
        this.hasChanges.set(false);
      }
    }
  }

  getOptionByValue(options: FieldOption[], value: string): FieldOption | undefined {
    return options?.find(o => o.value === value);
  }

  // ============================================================
  // Métodos para el Modal de Edición de Opciones
  // ============================================================

  /**
   * Abre el modal de edición para un campo
   */
  openFieldEditor(field: ConfigField): void {
    const groupKey = this.activeGroupKey();
    this.editorPresenter.openModal(field, groupKey);
  }

  /**
   * Cierra el modal de edición
   */
  closeFieldEditor(): void {
    if (this.editorPresenter.hasUnsavedChanges()) {
      if (confirm('¿Descartar los cambios sin guardar en las opciones?')) {
        this.editorPresenter.closeModal();
      }
    } else {
      this.editorPresenter.closeModal();
    }
  }

  /**
   * Handler para cambios en el formulario de opción
   */
  onOptionFormChange(field: 'value' | 'label' | 'description' | 'color', event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editorPresenter.updateForm({ [field]: target.value });
  }

  /**
   * Handler para cambio de estado disabled
   */
  onOptionDisabledChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editorPresenter.updateForm({ disabled: target.checked });
  }

  /**
   * Guarda la opción actual (nueva o editada)
   */
  saveCurrentOption(): void {
    const result = this.editorPresenter.saveOption();
    if (!result.success) {
      alert(result.message);
    }
  }

  /**
   * Elimina una opción
   */
  deleteOption(index: number): void {
    if (confirm('¿Estás seguro de eliminar esta opción?')) {
      const result = this.editorPresenter.deleteOption(index);
      if (!result.success) {
        alert(result.message);
      }
    }
  }

  /**
   * Habilita/deshabilita una opción
   */
  toggleOptionDisabled(index: number): void {
    const result = this.editorPresenter.toggleOptionDisabled(index);
    if (!result.success) {
      alert(result.message);
    }
  }

  /**
   * Mueve una opción hacia arriba
   */
  moveOptionUp(index: number): void {
    this.editorPresenter.moveOptionUp(index);
  }

  /**
   * Mueve una opción hacia abajo
   */
  moveOptionDown(index: number): void {
    this.editorPresenter.moveOptionDown(index);
  }

  /**
   * Resetea los cambios del editor
   */
  resetEditorChanges(): void {
    if (confirm('¿Descartar todos los cambios de las opciones?')) {
      this.editorPresenter.resetChanges();
    }
  }

  /**
   * Guarda las opciones editadas en el campo
   */
  saveFieldOptions(): void {
    const fieldKey = this.editorPresenter.getCurrentFieldKey();
    const groupKey = this.editorPresenter.getCurrentGroupKey();
    const newOptions = this.editorPresenter.getOptionsToSave();

    if (!fieldKey || !groupKey) {
      alert('Error: No se pudo identificar el campo a actualizar');
      return;
    }
    // Actualizar en ALL_CONFIG_GROUPS (en memoria)
    const group = this.configGroups.find(g => g.key === groupKey);
    if (group) {
      const field = group.fields.find(f => f.key === fieldKey);
      if (field) {
        field.options = newOptions;
      }
    }

    // Marcar cambios como guardados en el editor
    this.editorPresenter.markChangesSaved();

    // Indicar que hay cambios pendientes de guardar globalmente
    this.hasChanges.set(true);

    console.log(`[SystemConfigComponent] Opciones de ${fieldKey} actualizadas. Recuerda guardar la configuración.`);
    this.editorPresenter.closeModal();
  }
}
