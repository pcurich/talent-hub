import { Injectable } from '@angular/core';
import { FeedbackEntity } from '@pcurich/client-storage-indexeddb';
import * as XLSX from 'xlsx';
import {
  ExcelSettingsConfig,
  ExcelRowResult,
  ExcelReadResult,
  ExcelRowError,
  ExcelRowData,
  ImportOptions
} from '../models/excel-settings.models';

@Injectable()
export class ExcelReaderPresenter {

  /**
   * Lee y procesa el archivo Excel completo
   */
  async readExcelFile(
    file: File,
    config: ExcelSettingsConfig,
    options: ImportOptions
  ): Promise<ExcelReadResult> {
    const errors: string[] = [];
    debugger;
    // Validar configuración
    if (!this.isConfigValid(config)) {
      return {
        success: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        rows: [],
        entities: [],
        config,
        errors: ['Configuración de mapeo incompleta o inválida']
      };
    }

    try {
      // Aquí iría la lógica de lectura del Excel usando una librería como xlsx
      // Por ahora es un placeholder
      const excelData = await this.parseExcelFile(file, config);

      // Procesar cada fila
      const rows: ExcelRowResult[] = [];
      const entities: FeedbackEntity[] = [];

      for (let i = 0; i < excelData.length; i++) {
        const rowData = excelData[i];
        const rowResult = this.processRow(rowData, config, i + config.dataStartRow);

        rows.push(rowResult);

        if (rowResult.isValid) {
          entities.push(new FeedbackEntity(rowResult.data));
        } else {
          entities.push(new FeedbackEntity(rowResult.data));
          errors.push(`Fila ${rowResult.rowNumber}: Contiene errores y detiene la importación`);
        }
      }
      // TODO CAMBIAR EL invalidRows

      debugger
      return {
        success: true,
        totalRows: rows.length,
        validRows: rows.length,
        invalidRows: errors.length,
        rows,
        entities,
        config,
        errors
      };

    } catch (error) {
      return {
        success: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        rows: [],
        entities: [],
        config,
        errors: [`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  /**
   * Procesa una fila individual del Excel
   */
  private processRow(
    rowData: ExcelRowData,
    config: ExcelSettingsConfig,
    rowNumber: number
  ): ExcelRowResult {
    const data: Partial<FeedbackEntity> = {};
    const errors: ExcelRowError[] = [];

    // Iterar sobre cada mapeo configurado
    for (const mapping of config.mappings) {
      try {
        const cellValue = this.getCellValue(rowData, mapping.excelCell);
        const parsedValue = this.parseValue(cellValue, mapping);

        // Validar campo requerido
        if (mapping.required && (parsedValue === null || parsedValue === undefined || parsedValue === '')) {
          errors.push({
            field: mapping.entityField,
            message: `Campo requerido '${mapping.label}' está vacío`,
            severity: 'error'
          });
          continue;
        }

        // Asignar valor al campo de la entidad
        this.setNestedValue(data, mapping.entityField, parsedValue);

      } catch (error) {
        errors.push({
          field: mapping.entityField,
          message: `Error al procesar campo '${mapping.label}': ${error instanceof Error ? error.message : 'Error desconocido'}`,
          severity: 'error'
        });
      }
    }

    // La fila es válida si no tiene errores críticos
    const isValid = errors.every(e => e.severity !== 'error');

    return {
      rowNumber,
      data,
      errors,
      isValid
    };
  }

  /**
   * Obtiene el valor de una celda específica
   */
  private getCellValue(rowData: ExcelRowData, cellReference: string): any {
    // Extraer la columna de la referencia (ej: 'A1' -> 'A')
    const column = cellReference.match(/^[A-Z]+/)?.[0];
    if (!column) return null;

    const cell = rowData.cells.get(column);
    return cell?.value ?? null;
  }

  /**
   * Parsea el valor según el tipo de campo
   */
  private parseValue(value: any, mapping: any): any {
    if (value === null || value === undefined) return null;

    switch (mapping.fieldType) {
      case 'string':
        return String(value).trim();

      case 'number':
        const num = Number(value);
        return isNaN(num) ? null : num;

      case 'date':
        return this.parseDate(value);

      case 'select':
        return String(value).trim();

      case 'nested':
        return String(value).trim();

      default:
        return value;
    }
  }

  /**
   * Parsea una fecha de Excel
   */
  private parseDate(value: any): Date | string | null {
    if (value instanceof Date) return value;

    // Excel almacena fechas como números seriales
    if (typeof value === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      const days = value - 2; // Excel bug: cuenta 1900 como año bisiesto
      return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    }

    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  /**
   * Establece un valor en una propiedad anidada
   */
  private setNestedValue(obj: any, path: string, value: any): void {
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

  /**
   * Valida que la configuración sea válida
   */
  private isConfigValid(config: ExcelSettingsConfig): boolean {
    // Verificar que existan mapeos
    if (!config.mappings || config.mappings.length === 0) {
      return false;
    }

    // Verificar que los campos estén mapeados
    const requiredMappings = config.mappings.filter(m => m.required);

    return requiredMappings.length > 0;
  }

  /**
   * Parsea archivo Excel usando SheetJS (xlsx)
   */
  private async parseExcelFile(
    file: File,
    config: ExcelSettingsConfig
  ): Promise<ExcelRowData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('No se pudo leer el archivo'));
            return;
          }

          // Parsear el archivo Excel
          const workbook = XLSX.read(data, { type: 'binary', cellDates: true });

          // Obtener la hoja especificada o la primera disponible
          const sheetName = config.sheetName || workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          if (!worksheet) {
            reject(new Error(`No se encontró la hoja "${sheetName}"`));
            return;
          }

          // Convertir la hoja a formato JSON manteniendo las referencias de celdas
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          const rows: ExcelRowData[] = [];

          // Leer los encabezados de las columnas desde config.mappings
          const headers = new Map<string, string>();
          for (const mapping of config.mappings) {
            // Extraer la columna de la referencia (ej: 'A1' -> 'A')
            const column = mapping.excelCell.match(/^[A-Z]+/)?.[0];
            if (!column) continue;

            // Extraer el número de fila del excelCell para leer el encabezado
            const headerRowMatch = mapping.excelCell.match(/\d+/);
            const headerRow = headerRowMatch ? parseInt(headerRowMatch[0]) - 1 : 0;

            // Leer el valor del encabezado
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: XLSX.utils.decode_col(column) });
            const cell = worksheet[cellAddress];

            if (cell) {
              headers.set(mapping.excelCell, cell.w || String(cell.v) || mapping.label);
            } else {
              // Si no hay valor en la celda, usar el label del mapping
              headers.set(mapping.excelCell, mapping.label);
            }
          }

          // Iterar desde la fila de datos hasta el final
          debugger;
          for (let rowNum = config.dataStartRow ; rowNum <= range.e.r; rowNum++) {
            const cells = new Map<string, { value: any; formatted: string; column: string; row: number; reference: string }>();
            let hasData = false;

            // Iterar sobre todas las columnas
            for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
              const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
              const cell = worksheet[cellAddress];
              const columnLetter = XLSX.utils.encode_col(colNum);

              if (cell) {
                hasData = true;
                cells.set(columnLetter, {
                  value: cell.v,
                  formatted: cell.w || String(cell.v),
                  column: columnLetter,
                  row: rowNum + 1,
                  reference: cellAddress
                });
              }
            }

            // Solo agregar filas que tengan al menos una celda con datos
            if (hasData) {
              rows.push({
                rowNumber: rowNum,
                cells,
                headers: new Map(headers) // Incluir los encabezados en cada fila
              });
            }
          }

          resolve(rows);

        } catch (error) {
          reject(new Error(`Error al parsear el archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      // Leer el archivo como binary string
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Valida una entidad antes de guardarla
   */
  validateEntity(entity: Partial<FeedbackEntity>): ExcelRowError[] {
    const errors: ExcelRowError[] = [];

    // Validaciones específicas
    if (!entity.registration) {
      errors.push({
        field: 'registration',
        message: 'El registro es obligatorio',
        severity: 'error'
      });
    }

    if (!entity.teamMember) {
      errors.push({
        field: 'teamMember',
        message: 'El nombre del team member es obligatorio',
        severity: 'error'
      });
    }

    // Agregar más validaciones según necesites

    return errors;
  }
}
