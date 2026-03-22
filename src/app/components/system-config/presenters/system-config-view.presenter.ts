import { Injectable, signal, computed, inject } from '@angular/core';
import {
  ConfigGroup,
  ConfigField,
  SystemConfigEntity,
  ALL_CONFIG_GROUPS,
  createDefaultSystemConfig,
  FieldOption
} from '../../../model/system-config-entity.model';
import { SYSTEM_CONFIG_REPOSITORY } from '../../../tokens/repository.tokens';
import { FieldViewState, OptionViewState } from '../models/system-config-view.models';

/**
 * Presenter para la vista de configuración del sistema.
 * Maneja la lógica de presentación y estado de la vista.
 */
@Injectable()
export class SystemConfigViewPresenter {
  private systemConfigRepo = inject(SYSTEM_CONFIG_REPOSITORY);

  // ============================================================
  // Estado de la vista
  // ============================================================

  /** Grupos de configuración disponibles */
  readonly configGroups = ALL_CONFIG_GROUPS;

  /** Key del grupo activo */
  readonly activeGroupKey = signal<string>('feedback');

  /** Valores de configuración actuales */
  readonly configValues = signal<Map<string, any>>(new Map());

  /** Indica si hay cambios sin guardar */
  readonly hasChanges = signal<boolean>(false);

  /** Indica si se está guardando */
  readonly isSaving = signal<boolean>(false);

  /** Indica si se está cargando */
  readonly isLoading = signal<boolean>(true);

  /** Tooltip activo */
  readonly activeTooltip = signal<string | null>(null);

  /** Estado de los campos en la vista */
  readonly fieldsViewState = signal<Map<string, FieldViewState>>(new Map());

  // ============================================================
  // Computados
  // ============================================================

  /** Grupo activo actual */
  readonly activeGroup = computed<ConfigGroup | undefined>(() => {
    return this.configGroups.find(g => g.key === this.activeGroupKey());
  });

  /** Campos del grupo activo con su estado de vista */
  readonly activeFieldsWithState = computed<FieldViewState[]>(() => {
    const group = this.activeGroup();
    if (!group) return [];

    return group.fields.map(field => {
      const existing = this.fieldsViewState().get(field.key);
      if (existing) return existing;

      return this.createFieldViewState(field);
    });
  });

  // ============================================================
  // Inicialización
  // ============================================================

  /**
   * Inicializa la configuración cargando desde repositorio o creando valores por defecto
   */
  async initialize(): Promise<void> {
    this.isLoading.set(true);
    try {
      const exists = await this.systemConfigRepo.exists();

      if (!exists) {
        const defaultConfig = createDefaultSystemConfig();
        await this.systemConfigRepo.create(defaultConfig);
        console.log('[SystemConfigViewPresenter] Config por defecto creada en IndexedDB');
      }

      this.loadConfigFromRepo();
      this.initializeFieldsState();
    } catch (error) {
      console.error('[SystemConfigViewPresenter] Error al inicializar config:', error);
      this.loadDefaultValues();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Inicializa el estado de visualización de todos los campos
   */
  private initializeFieldsState(): void {
    const statesMap = new Map<string, FieldViewState>();

    for (const group of this.configGroups) {
      for (const field of group.fields) {
        statesMap.set(field.key, this.createFieldViewState(field));
      }
    }

    this.fieldsViewState.set(statesMap);
  }

  /**
   * Crea el estado de vista para un campo
   */
  private createFieldViewState(field: ConfigField): FieldViewState {
    const optionsState: OptionViewState[] = (field.options || []).map(option => ({
      option,
      isEditing: false
    }));

    return {
      field,
      isExpanded: false,
      isEditing: false,
      optionsState
    };
  }

  // ============================================================
  // Carga de datos
  // ============================================================

  /**
   * Carga la configuración desde el repositorio
   */
  loadConfigFromRepo(): void {
    const config = this.systemConfigRepo.get()();
    const values = new Map<string, any>();

    if (config?.groups) {
      for (const group of config.groups) {
        for (const field of group.fields || []) {
          values.set(field.key, field.defaultValue.value);
        }
      }
    } else {
      this.loadDefaultValues();
      return;
    }

    this.configValues.set(values);
  }

  /**
   * Carga los valores por defecto en memoria
   */
  private loadDefaultValues(): void {
    const defaultConfig = createDefaultSystemConfig();
    const values = new Map<string, any>();
    for (const group of defaultConfig.groups) {
      for (const field of group.fields || []) {
        values.set(field.key, field.defaultValue.value);
      }
    }
    this.configValues.set(values);
  }

  /**
   * Recarga la configuración desde el repositorio
   */
  reloadConfig(): void {
    this.loadConfigFromRepo();
  }

  // ============================================================
  // Navegación
  // ============================================================

  /**
   * Selecciona un grupo de configuración
   */
  selectGroup(groupKey: string): void {
    this.activeGroupKey.set(groupKey);
  }

  // ============================================================
  // Obtención de valores
  // ============================================================

  /**
   * Obtiene el valor de un campo
   */
  getValue(fieldKey: string): any {
    return this.configValues().get(fieldKey);
  }

  /**
   * Establece el valor de un campo
   */
  setValue(fieldKey: string, value: any): void {
    const values = new Map(this.configValues());
    values.set(fieldKey, value);
    this.configValues.set(values);
    this.hasChanges.set(true);
  }

  /**
   * Obtiene una opción por su valor
   */
  getOptionByValue(options: FieldOption[], value: string): FieldOption | undefined {
    return options?.find(o => o.value === value);
  }

  /**
   * Verifica si una opción está seleccionada (para multi-select)
   */
  isOptionSelected(field: ConfigField, optionValue: string): boolean {
    const value = this.getValue(field.key);
    if (Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  }

  // ============================================================
  // Handlers de cambios
  // ============================================================

  private fieldOptionMap = new Map<string, FieldOption>();

  handleSelectChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOption = field.options?.find(o => o.value === target.value);
    this.setValue(field.key, target.value);
    if (selectedOption) {
      this.fieldOptionMap.set(field.key, selectedOption);
    }
  }

  handleMultiSelectChange(field: ConfigField, option: FieldOption, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentValue: string[] = this.getValue(field.key) || [];

    if (target.checked) {
      this.setValue(field.key, [...currentValue, option.value]);
    } else {
      this.setValue(field.key, currentValue.filter(v => v !== option.value));
    }
  }

  handleBooleanChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    const boolValue = String(target.checked);
    this.setValue(field.key, boolValue);
    const option = field.options?.find(o => o.value === boolValue);
    if (option) {
      this.fieldOptionMap.set(field.key, option);
    }
  }

  handleTextChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(field.key, target.value);
  }

  handleNumberChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(field.key, target.value);
  }

  handleColorChange(field: ConfigField, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(field.key, target.value);
  }

  // ============================================================
  // Tooltips
  // ============================================================

  showTooltip(fieldKey: string): void {
    this.activeTooltip.set(fieldKey);
  }

  hideTooltip(): void {
    this.activeTooltip.set(null);
  }

  // ============================================================
  // Persistencia
  // ============================================================

  /**
   * Guarda la configuración actual
   */
  async saveConfig(): Promise<boolean> {
    this.isSaving.set(true);

    try {
      const currentConfig = this.systemConfigRepo.get()();

      // Clonar los grupos y actualizar los valores de los campos
      const groups = structuredClone(currentConfig?.groups || ALL_CONFIG_GROUPS);

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

      const config: SystemConfigEntity = {
        id: currentConfig?.id || 1,
        groups,
        version: '1.0.0',
        createdAt: currentConfig?.createdAt || new Date(),
        updatedAt: new Date(),
        updateTimestamp: function () { this.updatedAt = new Date(); }
      };

      const success = await this.systemConfigRepo.update(config);

      if (success) {
        this.hasChanges.set(false);
        console.log('[SystemConfigViewPresenter] Configuración guardada correctamente');
        return true;
      } else {
        console.error('[SystemConfigViewPresenter] Error al guardar configuración');
        return false;
      }
    } catch (error) {
      console.error('[SystemConfigViewPresenter] Error al guardar configuración:', error);
      return false;
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Resetea la configuración a valores por defecto
   */
  async resetToDefaults(): Promise<boolean> {
    try {
      const success = await this.systemConfigRepo.resetToDefaults();

      if (success) {
        this.loadConfigFromRepo();
        this.hasChanges.set(false);
        console.log('[SystemConfigViewPresenter] Config reseteada a valores por defecto');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[SystemConfigViewPresenter] Error al resetear config:', error);
      this.loadDefaultValues();
      this.hasChanges.set(true);
      return false;
    }
  }

  /**
   * Cancela los cambios sin guardar
   */
  cancelChanges(): void {
    this.loadConfigFromRepo();
    this.hasChanges.set(false);
  }

  // ============================================================
  // Actualización de opciones de campo
  // ============================================================

  /**
   * Actualiza las opciones de un campo específico
   */
  updateFieldOptions(fieldKey: string, groupKey: string, newOptions: FieldOption[]): void {
    // Actualizar en ALL_CONFIG_GROUPS (en memoria)
    const group = this.configGroups.find(g => g.key === groupKey);
    if (group) {
      const field = group.fields.find(f => f.key === fieldKey);
      if (field) {
        field.options = newOptions;
      }
    }

    // Actualizar estado de vista
    const fieldsState = new Map(this.fieldsViewState());
    const fieldState = fieldsState.get(fieldKey);
    if (fieldState) {
      fieldState.field.options = newOptions;
      fieldState.optionsState = newOptions.map(opt => ({
        option: opt,
        isEditing: false
      }));
      fieldsState.set(fieldKey, fieldState);
      this.fieldsViewState.set(fieldsState);
    }

    this.hasChanges.set(true);
  }
}
