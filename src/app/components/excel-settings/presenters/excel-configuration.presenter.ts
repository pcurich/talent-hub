import { Injectable, inject } from '@angular/core';
import { ExcelColumnMapping, ExcelSettingsConfig, ConfigurationStats, SelectOption } from '../models/excel-settings.models';
import {
  TEAM_MEMBERS_COMPANY_OPTIONS,
  TEAM_MEMBERS_SENIORITY_OPTIONS,
  FEEDBACK_PROVIDER_OPTIONS,
  FEEDBACK_TYPE_OPTIONS,
  PERFORMANCE_LEVEL_OPTIONS,
  FEEDBACK_GENERAL_RATING_OPTIONS,
  FEEDBACK_ACTIONABLE_PROVIDER_OPTIONS,
  FEEDBACK_ACTIONABLE_STATUS_OPTIONS
} from '../../../model/system-config-entity.model';
import { SYSTEM_CONFIG_KEYS } from '../../../constants/general.constants';
import { SystemConfigIndexeddbRepository } from '../../../repository/system-config.indexeddb.repository';

@Injectable()
export class ExcelConfigurationPresenter {
  private readonly STORAGE_KEY = 'excel-settings-config';
  private readonly systemConfigRepo = inject(SystemConfigIndexeddbRepository);

  /**
   * Mapeo de entityField → { group, fieldKey } para resolver opciones dinámicas
   * desde SystemConfigIndexeddbRepository
   */
  private readonly optionsConfigMap: Record<string, { group: string; fieldKey: string }> = {
    'teamMember.companyKey':   { group: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_CONFIG_GROUP_KEY, fieldKey: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_COMPANY_FIELD_KEY },
    'seniority':               { group: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_CONFIG_GROUP_KEY, fieldKey: SYSTEM_CONFIG_KEYS.TEAM_MEMBERS_SENIORITY_FIELD_KEY },
    'feedbackProvider':        { group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_PROVIDER_FIELD_KEY },
    'feedbackType':            { group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_TYPE_FIELD_KEY },
    'performance.what':        { group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_PERFORMANCE_LEVEL_FIELD_KEY },
    'performance.how':         { group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_PERFORMANCE_LEVEL_FIELD_KEY },
    'performance.achievements':{ group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_PERFORMANCE_LEVEL_FIELD_KEY },
    'generalRating':           { group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_GENERAL_RATING_FIELD_KEY },
    'actionPlan.0.responsible':{ group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_ACTION_RESPONSIBLE_FIELD_KEY },
    'actionPlan.0.status':     { group: SYSTEM_CONFIG_KEYS.FEEDBACK_CONFIG_GROUP_KEY,     fieldKey: SYSTEM_CONFIG_KEYS.FEEDBACK_ACTION_STATUS_FIELD_KEY },
  };

  // Definición de los campos disponibles en FeedbackEntity
  private readonly defaultFields: ExcelColumnMapping[] = [
    // Campos básicos
    { entityField: 'number',                    excelCell: 'A1', fieldType: 'number', required: true,  label: 'Nro.',                description: 'Número secuencial del feedback' },
    { entityField: 'teamMember.registration',   excelCell: 'B1', fieldType: 'string', required: true,  label: 'Matricula',           description: 'Matricula del colaborador' },
    { entityField: 'teamMember.name',           excelCell: 'C1', fieldType: 'string', required: true,  label: 'Team Member',         description: 'Nombre del colaborador' },
    { entityField: 'teamMember.companyKey',     excelCell: 'D1', fieldType: 'select', required: true,  label: 'Empresa',             description: 'Empresa asignada del team Member', options: TEAM_MEMBERS_COMPANY_OPTIONS },
    { entityField: 'seniority',                 excelCell: 'E1', fieldType: 'select', required: true,  label: 'Seniority',           description: 'Nivel de seniority', options: TEAM_MEMBERS_SENIORITY_OPTIONS, resolveToFullOption: true },

    // Datos del squad
    { entityField: 'squad.name',                excelCell: 'F1', fieldType: 'string', required: true,  label: 'Squad',               description: 'Nombre del squad' },
    { entityField: 'squad.productOwner.name',   excelCell: 'G1', fieldType: 'string', required: true,  label: 'PO',                  description: 'PO del squad' },
    { entityField: 'poclacDate',                excelCell: 'H1', fieldType: 'date',   required: false, label: 'Fecha POCLAC',        description: 'Fecha de POCLAC' },

    // Feedback
    { entityField: 'feedbackProvider',          excelCell: 'I1', fieldType: 'select', required: true,  label: 'Proveedor de Feedback',    description: 'Quien provee el feedback', options: FEEDBACK_PROVIDER_OPTIONS, resolveToFullOption: true },
    { entityField: 'feedbackType',              excelCell: 'J1', fieldType: 'select', required: true,  label: 'Tipo de Feedback',         description: 'Excede, Cumple, Por debajo', options: FEEDBACK_TYPE_OPTIONS, resolveToFullOption: true },

    // Performance
    { entityField: 'performance.what',          excelCell: 'K1', fieldType: 'select', required: true,  label: 'Desempeño Que',       description: 'QUÉ - ¿Cumple con la entrega de tu backlog con las habilidades y conocimientos técnicos que actualmente tiene?', options: PERFORMANCE_LEVEL_OPTIONS, resolveToFullOption: true },
    { entityField: 'performance.how',           excelCell: 'L1', fieldType: 'select', required: true,  label: 'Desempeño Cómo',      description: 'CÓMO - ¿En qué nivel vive los principios y comportamientos Samay?', options: PERFORMANCE_LEVEL_OPTIONS, resolveToFullOption: true },
    { entityField: 'performance.achievements',  excelCell: 'M1', fieldType: 'select', required: true,  label: 'Desempeño Logros',    description: 'Evaluación de logros (Excede, Cumple, Por debajo)', options: PERFORMANCE_LEVEL_OPTIONS, resolveToFullOption: true },
    { entityField: 'performance.details',       excelCell: 'N1', fieldType: 'string', required: true,  label: 'Detalles de Desempeño', description: 'Detalles adicionales de performance' },
    { entityField: 'generalRating',             excelCell: 'O1', fieldType: 'select', required: true,  label: 'Calificación General', description: 'Rating general del colaborador', options: FEEDBACK_GENERAL_RATING_OPTIONS, resolveToFullOption: true },

    // Feedback Details (SBI)
    { entityField: 'feedbackDetails.situation', excelCell: 'P1', fieldType: 'nested', required: true,  label: 'Situación (SBI)',     description: 'Contexto de la situación' },
    { entityField: 'feedbackDetails.behavior',  excelCell: 'Q1', fieldType: 'nested', required: true,  label: 'Comportamiento (SBI)', description: 'Comportamiento observado' },
    { entityField: 'feedbackDetails.impact',    excelCell: 'R1', fieldType: 'nested', required: true,  label: 'Impacto (SBI)',       description: 'Impacto del comportamiento' },

    // Plan de acción
    { entityField: 'actionPlan.0.actionable',     excelCell: 'S1', fieldType: 'string', required: false, label: 'Accionable',           description: 'Accionable del plan de acción' },
    { entityField: 'actionPlan.0.responsible',    excelCell: 'T1', fieldType: 'select', required: false, label: 'Responsable del Plan de Acción', description: 'Responsable (si es TM BCP -> CL si es TM Proveedor -> FP)', options: FEEDBACK_ACTIONABLE_PROVIDER_OPTIONS, resolveToFullOption: true },
    { entityField: 'actionPlan.0.commitmentDate', excelCell: 'U1', fieldType: 'date',   required: false, label: 'Fecha de Compromiso del Plan de Acción', description: 'Fecha de compromiso para el plan de acción' },
    { entityField: 'actionPlan.0.status',         excelCell: 'V1', fieldType: 'select', required: false, label: 'Estado del Plan de Acción', description: 'Estado actual del plan de acción', options: FEEDBACK_ACTIONABLE_STATUS_OPTIONS, resolveToFullOption: true },
  ];

  getDefaultFields(): ExcelColumnMapping[] {
    const fields: ExcelColumnMapping[] = JSON.parse(JSON.stringify(this.defaultFields));

    // Sobrescribir las opciones de los campos select con los valores actuales del sistema
    for (const field of fields) {
      if (field.fieldType !== 'select') continue;
      const configKey = this.optionsConfigMap[field.entityField];
      if (!configKey) continue;
      const configField = this.systemConfigRepo.getField(configKey.group, configKey.fieldKey);
      if (configField?.options?.length) {
        field.options = configField.options.map(o => ({
          value: o.value,
          label: o.label,
          groupKey: configKey.group,
          fieldKey: configKey.fieldKey
        } as SelectOption));
      }
    }

    return fields;
  }

  getDefaultConfig(): ExcelSettingsConfig {
    return {
      mappings: this.defaultFields,
      sheetName: 'BCP',
      dataStartRow: 1,
      lastUpdated: new Date()
    };
  }

  loadConfiguration(): { config: ExcelSettingsConfig; fields: ExcelColumnMapping[] } {
    const fields = this.getDefaultFields();
    const saved = localStorage.getItem(this.STORAGE_KEY);

    if (!saved) {
      return { config: this.getDefaultConfig(), fields };
    }

    try {
      const savedConfig: ExcelSettingsConfig = JSON.parse(saved);

      // Aplicar los mapeos guardados a los campos disponibles
      fields.forEach(field => {
        const savedMapping = savedConfig.mappings.find(m => m.entityField === field.entityField);
        if (savedMapping) {
          field.excelCell = savedMapping.excelCell;
        }
      });

      console.log('Configuración cargada desde localStorage');
      return { config: savedConfig, fields };
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      return { config: this.getDefaultConfig(), fields };
    }
  }

  saveConfiguration(config: ExcelSettingsConfig, fields: ExcelColumnMapping[]): boolean {
    try {
      // Actualizar mappings desde availableFields
      const updatedConfig: ExcelSettingsConfig = {
        ...config,
        mappings: fields
          .filter(field => field.excelCell.trim() !== '')
          .map(field => ({ ...field })),
        lastUpdated: new Date()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedConfig));
      console.log('Configuración guardada:', updatedConfig);
      return true;
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      return false;
    }
  }

  resetConfiguration(): { config: ExcelSettingsConfig; fields: ExcelColumnMapping[] } {
    localStorage.removeItem(this.STORAGE_KEY);
    return {
      config: this.getDefaultConfig(),
      fields: this.getDefaultFields()
    };
  }

  getStats(fields: ExcelColumnMapping[]): ConfigurationStats {
    return {
      totalFields: fields.length,
      mappedFields: fields.filter(f => f.excelCell.trim() !== '').length,
      requiredFields: fields.filter(f => f.required).length,
      mappedRequiredFields: fields.filter(f => f.required && f.excelCell.trim() !== '').length
    };
  }

  getFieldTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'string': '📝',
      'number': '🔢',
      'date': '📅',
      'select': '📋',
      'nested': '🔗'
    };
    return icons[type] || '❓';
  }

  applyImportedConfig(fields: ExcelColumnMapping[], importedConfig: ExcelSettingsConfig): ExcelColumnMapping[] {
    fields.forEach(field => {
      const mapping = importedConfig.mappings.find(m => m.entityField === field.entityField);
      field.excelCell = mapping?.excelCell || '';
    });
    return fields;
  }
}
