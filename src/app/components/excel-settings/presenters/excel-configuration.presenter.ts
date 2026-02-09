import { Injectable } from '@angular/core';
import { ExcelColumnMapping, ExcelSettingsConfig, FilterCriteria, ConfigurationStats } from '../models/excel-settings.models';

@Injectable()
export class ExcelConfigurationPresenter {
  private readonly STORAGE_KEY = 'excel-settings-config';

  // Definición de los campos disponibles en FeedbackEntity
  private readonly defaultFields: ExcelColumnMapping[] = [
    // Campos básicos
    { entityField: 'number', excelCell: 'A1', fieldType: 'number', required: false, label: 'Número', description: 'Número secuencial del feedback' },
    { entityField: 'registration', excelCell: 'B1', fieldType: 'string', required: true, label: 'Registro', description: 'Registro del colaborador' },
    { entityField: 'teamMember', excelCell: 'C1', fieldType: 'string', required: true, label: 'Team Member', description: 'Nombre del colaborador' },
    { entityField: 'company', excelCell: 'D1', fieldType: 'select', required: true, label: 'Empresa', description: 'BCP o Proveedor' },
    { entityField: 'seniority', excelCell: 'E1', fieldType: 'select', required: true, label: 'Seniority', description: 'Nivel de seniority' },

    // Datos del squad
    { entityField: 'squad', excelCell: 'F1', fieldType: 'string', required: true, label: 'Squad', description: 'Nombre del squad' },
    { entityField: 'productOwner', excelCell: 'G1', fieldType: 'string', required: true, label: 'Product Owner', description: 'PO del squad' },
    { entityField: 'focalPoint', excelCell: 'H1', fieldType: 'string', required: true, label: 'Focal Point', description: 'Focal point del squad' },
    { entityField: 'poclacDate', excelCell: 'H1', fieldType: 'date', required: false, label: 'Fecha POCLAC', description: 'Fecha de POCLAC' },

    // Feedback
    { entityField: 'feedbackProvider', excelCell: 'J1', fieldType: 'string', required: true, label: 'Proveedor de Feedback', description: 'Quien provee el feedback' },
    { entityField: 'feedbackType', excelCell: 'N2', fieldType: 'select', required: false, label: 'Tipo de Feedback', description: 'Positivo, Constructivo, Negativo' },

    // Ratings y Performance
    { entityField: 'generalRating', excelCell: 'J1', fieldType: 'select', required: false, label: 'Calificación General', description: 'Rating general del colaborador' },
    { entityField: 'performanceWhat', excelCell: 'K1', fieldType: 'select', required: false, label: 'Performance What', description: 'Evaluación del QUÉ' },
    { entityField: 'performanceHow', excelCell: 'L1', fieldType: 'select', required: false, label: 'Performance How', description: 'Evaluación del CÓMO' },
    { entityField: 'performanceAchievements', excelCell: 'N1', fieldType: 'select', required: false, label: 'Performance Achievements', description: 'Evaluación de logros' },
    { entityField: 'performanceDetails', excelCell: 'P1', fieldType: 'string', required: false, label: 'Detalles de Performance', description: 'Detalles adicionales de performance' },

    // Feedback Details (SBI)
    { entityField: 'feedbackDetails.situation', excelCell: 'O1', fieldType: 'nested', required: false, label: 'Situación (SBI)', description: 'Contexto de la situación' },
    { entityField: 'feedbackDetails.behavior', excelCell: 'O1', fieldType: 'nested', required: false, label: 'Comportamiento (SBI)', description: 'Comportamiento observado' },
    { entityField: 'feedbackDetails.impact', excelCell: 'O1', fieldType: 'nested', required: false, label: 'Impacto (SBI)', description: 'Impacto del comportamiento' },

    // Otros
    { entityField: 'userExpectations', excelCell: 'Q1', fieldType: 'string', required: false, label: 'Expectativas del Usuario', description: 'Expectativas y comentarios adicionales' }
  ];

  getDefaultFields(): ExcelColumnMapping[] {
    return JSON.parse(JSON.stringify(this.defaultFields)); // Deep copy
  }

  getDefaultConfig(): ExcelSettingsConfig {
    return {
      mappings: this.defaultFields,
      sheetName: 'BCP',
      dataStartRow: 2,
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

  applyFilters(fields: ExcelColumnMapping[], criteria: FilterCriteria): ExcelColumnMapping[] {
    return fields.filter(field => {
      const matchesSearch = !criteria.searchTerm ||
        field.label.toLowerCase().includes(criteria.searchTerm.toLowerCase()) ||
        field.entityField.toLowerCase().includes(criteria.searchTerm.toLowerCase()) ||
        field.description?.toLowerCase().includes(criteria.searchTerm.toLowerCase());

      const matchesRequired = !criteria.showOnlyRequired || field.required;
      const matchesMapped = !criteria.showOnlyMapped || field.excelCell.trim() !== '';

      return matchesSearch && matchesRequired && matchesMapped;
    });
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
