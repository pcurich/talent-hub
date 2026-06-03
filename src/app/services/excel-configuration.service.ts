import { Injectable, inject } from '@angular/core';
import { ExcelColumnMapping, ExcelSettingsConfig, ConfigurationStats, SelectOption } from '../model/excel-settings.models';
import { EXCEL_DEFAULT_FIELDS, EXCEL_OPTIONS_CONFIG_MAP } from '../constants/excel-fields.constants';
import { SystemConfigIndexeddbRepository } from '../repository/system-config.indexeddb.repository';

@Injectable({ providedIn: 'root' })
export class ExcelConfigurationService {
  private readonly STORAGE_KEY = 'excel-settings-config';
  private readonly systemConfigRepo = inject(SystemConfigIndexeddbRepository);

  private readonly optionsConfigMap = EXCEL_OPTIONS_CONFIG_MAP;
  private readonly defaultFields: ExcelColumnMapping[] = EXCEL_DEFAULT_FIELDS;

  getDefaultFields(): ExcelColumnMapping[] {
    const fields: ExcelColumnMapping[] = JSON.parse(JSON.stringify(this.defaultFields));

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
