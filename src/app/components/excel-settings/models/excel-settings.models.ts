import { FeedbackEntity } from '@pcurich/client-storage-indexeddb';

/**
 * Opción para campos de tipo select
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Mapeo de una celda/cabecera del Excel a un campo de la entidad
 */
export interface ExcelColumnMapping {
  entityField: string; // Campo de FeedbackEntity (ej: 'registration', 'teamMember')
  excelCell: string; // Referencia a la celda de cabecera (ej: 'A1', 'B1' o nombre de columna)
  fieldType: 'string' | 'number' | 'date' | 'select' | 'nested';
  required: boolean;
  label: string; // Etiqueta para mostrar en UI
  description?: string;
  options?: SelectOption[]; // Nuevo campo
}

/**
 * Configuración del mapeo de Excel
 */
export interface ExcelSettingsConfig {
  mappings: ExcelColumnMapping[]; // Mapeos de cabeceras a campos
  sheetName: string; // Nombre de la hoja a leer
  dataStartRow: number; // Fila donde comienzan los datos (ej: 2)
  lastUpdated: Date;
}

/**
 * Resultado de leer una fila del Excel
 */
export interface ExcelRowResult {
  rowNumber: number; // Número de fila en el Excel
  data: Partial<FeedbackEntity>; // Datos parseados de la fila
  errors: ExcelRowError[]; // Errores encontrados en la fila
  isValid: boolean; // Si la fila es válida para insertar
}

/**
 * Error encontrado al procesar una fila
 */
export interface ExcelRowError {
  field: string; // Campo que generó el error
  message: string; // Descripción del error
  severity: 'error' | 'warning'; // Nivel de severidad
}

/**
 * Resultado completo de la lectura del Excel
 */
export interface ExcelReadResult {
  success: boolean;
  totalRows: number; // Total de filas procesadas
  validRows: number; // Filas válidas
  invalidRows: number; // Filas con errores
  rows: ExcelRowResult[]; // Todas las filas procesadas
  entities: FeedbackEntity[]; // Solo las entidades válidas listas para guardar
  config: ExcelSettingsConfig; // Configuración usada
  errors: string[]; // Errores generales del archivo
}

/**
 * Estado de importación de datos
 */
export interface ImportState {
  status: 'idle' | 'reading' | 'validating' | 'importing' | 'completed' | 'error';
  progress: number; // 0-100
  currentRow: number;
  totalRows: number;
  result?: ExcelReadResult;
  error?: string;
}

/**
 * Opciones para la importación
 */
export interface ImportOptions {
  skipInvalidRows: boolean; // Si salta filas inválidas o detiene el proceso
  validateBeforeImport: boolean; // Si valida antes de importar
  clearExistingData: boolean; // Si limpia datos existentes antes de importar
}

/**
 * Criterios de filtrado
 */
export interface FilterCriteria {
  searchTerm: string;
  showOnlyRequired: boolean;
  showOnlyMapped: boolean;
}

/**
 * Estadísticas de configuración
 */
export interface ConfigurationStats {
  totalFields: number;
  mappedFields: number;
  requiredFields: number;
  mappedRequiredFields: number;
}

/**
 * Datos de una celda del Excel
 */
export interface ExcelCellData {
  column: string; // Ej: 'A', 'B', 'C'
  row: number; // Número de fila
  value: any; // Valor de la celda
  formatted: string; // Valor formateado
  reference: string; // Ej: 'A1', 'B2'
}

/**
 * Fila completa del Excel con sus celdas
 */
export interface ExcelRowData {
  rowNumber: number;
  cells: Map<string, ExcelCellData>; // Mapa de columna -> celda
  headers?: Map<string, string>; // Mapa de columna -> título de encabezado
}
