import { Injectable } from '@angular/core';
import { ExcelSettingsConfig } from '../models/excel-settings.models';

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  config?: ExcelSettingsConfig;
  error?: string;
}

@Injectable()
export class ExcelFilePresenter {

  exportConfiguration(config: ExcelSettingsConfig): ExportResult {
    try {
      const jsonData = JSON.stringify(config, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const filename = `excel-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Error al exportar configuración:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async importConfiguration(file: File): Promise<ImportResult> {
    if (!file) {
      return { success: false, error: 'No se seleccionó ningún archivo' };
    }

    // Validar extensión
    if (!file.name.endsWith('.json')) {
      return { success: false, error: 'El archivo debe ser un JSON' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedConfig: ExcelSettingsConfig = JSON.parse(content);

          // Validar estructura básica
          if (!this.isValidConfig(importedConfig)) {
            resolve({
              success: false,
              error: 'El archivo no tiene una estructura válida de configuración'
            });
            return;
          }

          console.log('Configuración importada exitosamente');
          resolve({ success: true, config: importedConfig });
        } catch (error) {
          console.error('Error al importar configuración:', error);
          resolve({
            success: false,
            error: 'Error al parsear el archivo. Verifique que sea un JSON válido.'
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Error al leer el archivo'
        });
      };

      reader.readAsText(file);
    });
  }

  private isValidConfig(config: any): config is ExcelSettingsConfig {
    return (
      config &&
      typeof config === 'object' &&
      Array.isArray(config.mappings) &&
      typeof config.sheetName === 'string' &&
      typeof config.dataStartRow === 'number'
    );
  }
}
