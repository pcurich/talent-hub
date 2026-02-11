import { Injectable, signal, computed } from '@angular/core';
import { ConfigField, FieldOption } from '../../../model/system-config.model';
import {
  FieldEditorModalState,
  OptionFormData,
  OperationResult,
  INITIAL_EDITOR_MODAL_STATE,
  EMPTY_OPTION_FORM
} from '../models/system-config-view.models';

/**
 * Presenter para la edición de opciones de campos.
 * Maneja la lógica del modal de edición y las operaciones CRUD sobre opciones.
 */
@Injectable()
export class SystemConfigFieldEditorPresenter {

  // ============================================================
  // Estado del modal
  // ============================================================

  /** Estado completo del modal */
  private readonly _modalState = signal<FieldEditorModalState>({ ...INITIAL_EDITOR_MODAL_STATE });

  /** Estado del modal (solo lectura) */
  readonly modalState = computed(() => this._modalState());

  /** Si el modal está abierto */
  readonly isModalOpen = computed(() => this._modalState().isOpen);

  /** Campo siendo editado */
  readonly currentField = computed(() => this._modalState().field);

  /** Modo actual del modal */
  readonly currentMode = computed(() => this._modalState().mode);

  /** Formulario de opción actual */
  readonly optionForm = computed(() => this._modalState().optionForm);

  /** Opciones de trabajo (copia modificable) */
  readonly workingOptions = computed(() => this._modalState().workingOptions);

  /** Índice de la opción siendo editada */
  readonly editingOptionIndex = computed(() => this._modalState().editingOptionIndex);

  /** Si hay cambios sin guardar */
  readonly hasUnsavedChanges = computed(() => this._modalState().hasUnsavedChanges);

  /** Si se está editando una opción */
  readonly isEditingOption = computed(() => this._modalState().editingOptionIndex !== null);

  /** Si se está agregando una nueva opción */
  readonly isAddingOption = computed(() => this._modalState().mode === 'add');

  // ============================================================
  // Acciones del Modal
  // ============================================================

  /**
   * Abre el modal para editar las opciones de un campo
   */
  openModal(field: ConfigField, groupKey: string): void {
    this._modalState.set({
      isOpen: true,
      field: { ...field },
      groupKey,
      mode: 'view',
      editingOptionIndex: null,
      optionForm: { ...EMPTY_OPTION_FORM },
      workingOptions: field.options ? [...field.options.map(opt => ({ ...opt }))] : [],
      hasUnsavedChanges: false
    });
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this._modalState.set({ ...INITIAL_EDITOR_MODAL_STATE });
  }

  /**
   * Inicia el modo de agregar nueva opción
   */
  startAddOption(): void {
    this._modalState.update(state => ({
      ...state,
      mode: 'add',
      editingOptionIndex: null,
      optionForm: {
        ...EMPTY_OPTION_FORM,
        order: state.workingOptions.length + 1
      }
    }));
  }

  /**
   * Inicia la edición de una opción existente
   */
  startEditOption(index: number): void {
    const state = this._modalState();
    const option = state.workingOptions[index];

    if (!option) return;

    this._modalState.update(s => ({
      ...s,
      mode: 'edit',
      editingOptionIndex: index,
      optionForm: {
        value: option.value,
        label: option.label,
        description: option.description || '',
        color: option.color || '',
        order: option.order,
        disabled: option.disabled || false
      }
    }));
  }

  /**
   * Cancela la edición/agregado actual
   */
  cancelEdit(): void {
    this._modalState.update(state => ({
      ...state,
      mode: 'view',
      editingOptionIndex: null,
      optionForm: { ...EMPTY_OPTION_FORM }
    }));
  }

  /**
   * Actualiza el formulario de opción
   */
  updateForm(updates: Partial<OptionFormData>): void {
    this._modalState.update(state => ({
      ...state,
      optionForm: {
        ...state.optionForm,
        ...updates
      }
    }));
  }

  // ============================================================
  // Operaciones CRUD sobre opciones
  // ============================================================

  /**
   * Guarda la opción actual (nueva o editada)
   */
  saveOption(): OperationResult {
    const state = this._modalState();
    const { mode, optionForm, workingOptions, editingOptionIndex } = state;

    // Validar formulario
    const validation = this.validateOptionForm(optionForm);
    if (!validation.success) {
      return validation;
    }

    // Verificar duplicados
    const duplicateCheck = this.checkForDuplicates(
      optionForm.value,
      workingOptions,
      mode === 'edit' ? editingOptionIndex : null
    );
    if (!duplicateCheck.success) {
      return duplicateCheck;
    }

    const newOption: FieldOption = {
      value: optionForm.value.trim(),
      label: optionForm.label.trim(),
      description: optionForm.description?.trim() || undefined,
      color: optionForm.color?.trim() || undefined,
      order: optionForm.order,
      disabled: optionForm.disabled
    };

    let newWorkingOptions: FieldOption[];

    if (mode === 'add') {
      newWorkingOptions = [...workingOptions, newOption];
    } else if (mode === 'edit' && editingOptionIndex !== null) {
      newWorkingOptions = workingOptions.map((opt, idx) =>
        idx === editingOptionIndex ? newOption : opt
      );
    } else {
      return { success: false, message: 'Estado inválido para guardar' };
    }

    // Reordenar por order
    newWorkingOptions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    this._modalState.update(s => ({
      ...s,
      mode: 'view',
      editingOptionIndex: null,
      optionForm: { ...EMPTY_OPTION_FORM },
      workingOptions: newWorkingOptions,
      hasUnsavedChanges: true
    }));

    return {
      success: true,
      message: mode === 'add' ? 'Opción agregada correctamente' : 'Opción actualizada correctamente'
    };
  }

  /**
   * Elimina una opción por índice
   */
  deleteOption(index: number): OperationResult {
    const state = this._modalState();

    if (index < 0 || index >= state.workingOptions.length) {
      return { success: false, message: 'Índice de opción inválido' };
    }

    const optionToDelete = state.workingOptions[index];
    const newWorkingOptions = state.workingOptions.filter((_, idx) => idx !== index);

    this._modalState.update(s => ({
      ...s,
      workingOptions: newWorkingOptions,
      hasUnsavedChanges: true,
      // Si estábamos editando esta opción, cancelar
      mode: s.editingOptionIndex === index ? 'view' : s.mode,
      editingOptionIndex: s.editingOptionIndex === index ? null : s.editingOptionIndex,
      optionForm: s.editingOptionIndex === index ? { ...EMPTY_OPTION_FORM } : s.optionForm
    }));

    return {
      success: true,
      message: `Opción "${optionToDelete.label}" eliminada`,
      data: optionToDelete
    };
  }

  /**
   * Habilita/deshabilita una opción
   */
  toggleOptionDisabled(index: number): OperationResult {
    const state = this._modalState();

    if (index < 0 || index >= state.workingOptions.length) {
      return { success: false, message: 'Índice de opción inválido' };
    }

    const newWorkingOptions = state.workingOptions.map((opt, idx) => {
      if (idx === index) {
        return { ...opt, disabled: !opt.disabled };
      }
      return opt;
    });

    this._modalState.update(s => ({
      ...s,
      workingOptions: newWorkingOptions,
      hasUnsavedChanges: true
    }));

    const toggledOption = newWorkingOptions[index];
    return {
      success: true,
      message: toggledOption.disabled
        ? `Opción "${toggledOption.label}" deshabilitada`
        : `Opción "${toggledOption.label}" habilitada`
    };
  }

  /**
   * Reordena las opciones (drag & drop o botones arriba/abajo)
   */
  reorderOptions(fromIndex: number, toIndex: number): OperationResult {
    const state = this._modalState();

    if (fromIndex < 0 || fromIndex >= state.workingOptions.length ||
        toIndex < 0 || toIndex >= state.workingOptions.length) {
      return { success: false, message: 'Índices de reordenamiento inválidos' };
    }

    const newWorkingOptions = [...state.workingOptions];
    const [removed] = newWorkingOptions.splice(fromIndex, 1);
    newWorkingOptions.splice(toIndex, 0, removed);

    // Actualizar órdenes
    newWorkingOptions.forEach((opt, idx) => {
      opt.order = idx + 1;
    });

    this._modalState.update(s => ({
      ...s,
      workingOptions: newWorkingOptions,
      hasUnsavedChanges: true
    }));

    return { success: true, message: 'Opciones reordenadas' };
  }

  /**
   * Mueve una opción hacia arriba
   */
  moveOptionUp(index: number): OperationResult {
    if (index <= 0) {
      return { success: false, message: 'La opción ya está en la primera posición' };
    }
    return this.reorderOptions(index, index - 1);
  }

  /**
   * Mueve una opción hacia abajo
   */
  moveOptionDown(index: number): OperationResult {
    const state = this._modalState();
    if (index >= state.workingOptions.length - 1) {
      return { success: false, message: 'La opción ya está en la última posición' };
    }
    return this.reorderOptions(index, index + 1);
  }

  // ============================================================
  // Persistencia
  // ============================================================

  /**
   * Obtiene las opciones finales para guardar
   */
  getOptionsToSave(): FieldOption[] {
    return [...this._modalState().workingOptions];
  }

  /**
   * Obtiene el key del campo actual
   */
  getCurrentFieldKey(): string | null {
    return this._modalState().field?.key || null;
  }

  /**
   * Obtiene el key del grupo actual
   */
  getCurrentGroupKey(): string | null {
    return this._modalState().groupKey;
  }

  /**
   * Resetea los cambios a las opciones originales
   */
  resetChanges(): void {
    const state = this._modalState();
    const originalOptions = state.field?.options || [];

    this._modalState.update(s => ({
      ...s,
      mode: 'view',
      editingOptionIndex: null,
      optionForm: { ...EMPTY_OPTION_FORM },
      workingOptions: originalOptions.map(opt => ({ ...opt })),
      hasUnsavedChanges: false
    }));
  }

  /**
   * Marca los cambios como guardados
   */
  markChangesSaved(): void {
    this._modalState.update(s => ({
      ...s,
      hasUnsavedChanges: false
    }));
  }

  // ============================================================
  // Validaciones
  // ============================================================

  /**
   * Valida el formulario de opción
   */
  private validateOptionForm(form: OptionFormData): OperationResult {
    if (!form.value?.trim()) {
      return { success: false, message: 'El valor es requerido' };
    }

    if (!form.label?.trim()) {
      return { success: false, message: 'La etiqueta es requerida' };
    }

    // Validar formato del color si está presente
    if (form.color && !/^#[0-9A-Fa-f]{6}$/.test(form.color.trim())) {
      return { success: false, message: 'El color debe tener formato hexadecimal (#RRGGBB)' };
    }

    return { success: true, message: 'Validación exitosa' };
  }

  /**
   * Verifica si hay opciones duplicadas
   */
  private checkForDuplicates(
    value: string,
    options: FieldOption[],
    excludeIndex: number | null
  ): OperationResult {
    const trimmedValue = value.trim().toLowerCase();

    const duplicate = options.find((opt, idx) =>
      opt.value.toLowerCase() === trimmedValue && idx !== excludeIndex
    );

    if (duplicate) {
      return {
        success: false,
        message: `Ya existe una opción con el valor "${duplicate.value}"`
      };
    }

    return { success: true, message: 'Sin duplicados' };
  }

  // ============================================================
  // Utilidades
  // ============================================================

  /**
   * Verifica si el campo actual tiene opciones editables
   */
  isFieldEditable(): boolean {
    const field = this._modalState().field;
    return field?.type === 'select' || field?.type === 'multi-select';
  }

  /**
   * Obtiene el conteo de opciones actual
   */
  getOptionsCount(): number {
    return this._modalState().workingOptions.length;
  }

  /**
   * Obtiene el conteo de opciones activas
   */
  getActiveOptionsCount(): number {
    return this._modalState().workingOptions.filter(opt => !opt.disabled).length;
  }
}
