import { Injectable } from '@angular/core';
import {
  ExcelColumnMapping,
  ExcelReadResult,
  ExcelRowError,
  ExcelRowResult,
  ImportState
} from '../models/excel-settings.models';

export interface TableColumn {
  key: string;
  label: string;
  field: string;
}

@Injectable()
export class LoadedDataPresenter {
  results: ExcelRowResult[] = [];
  searchTerm = '';
  importState: ImportState = {
    status: 'idle',
    progress: 0,
    currentRow: 0,
    totalRows: 0
  };

  setImportReading(): void {
    this.importState = { ...this.importState, status: 'reading' };
  }

  setImportResult(result: ExcelReadResult): void {
    this.importState = {
      status: 'completed',
      progress: 100,
      currentRow: result.totalRows,
      totalRows: result.totalRows,
      result
    };
    this.results = result.rows;
  }

  setImportError(message: string): void {
    this.importState = {
      status: 'error',
      progress: 0,
      currentRow: 0,
      totalRows: 0,
      error: message
    };
  }

  getTableColumns(mappings: ExcelColumnMapping[]): TableColumn[] {
    if (this.results.length === 0) return [];

    const columns: TableColumn[] = [];
    columns.push({ key: 'rowNumber', label: '#', field: 'number' });
    columns.push({ key: 'status', label: 'Estado', field: '_status' });

    if (mappings?.length > 0) {
      mappings.forEach(mapping => {
        if (mapping.excelCell.match(/^[A-Z]+/)?.[0]) {
          columns.push({
            key: mapping.entityField,
            label: mapping.label,
            field: mapping.entityField
          });
        }
      });
    }

    columns.push({ key: 'actions', label: 'Acciones', field: '_actions' });
    return columns;
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  getFilteredEntities(): ExcelRowResult[] {
    if (!this.searchTerm) return this.results;
    const term = this.searchTerm.toLowerCase();
    return this.results.filter(row =>
      Object.values(row.data).some(value =>
        value?.toString().toLowerCase().includes(term)
      )
    );
  }

  getColumnUniqueValues(column: TableColumn): string[] {
    const values = new Set<string>();
    this.getFilteredEntities().forEach(row => {
      const val = this.getNestedValue(row.data, column.field);
      if (val !== null && val !== undefined && val !== '') {
        values.add(String(val));
      }
    });
    return Array.from(values).sort();
  }

  applyBulkValue(column: TableColumn, value: string): void {
    if (!value) return;
    this.getFilteredEntities().forEach(row => {
      this.setNestedValue(row.data, column.field, value);
    });
  }

  removeRow(index: number): void {
    this.results.splice(index, 1);
  }

  clear(): void {
    this.results = [];
    this.importState = { status: 'idle', progress: 0, currentRow: 0, totalRows: 0 };
  }

  getValidRowsCount(): number {
    return this.results.filter(row => row.isValid).length;
  }

  getErrorMessages(errors: ExcelRowError[]): string {
    return errors.map(err => `${err.field}: ${err.message}`).join('\n');
  }
}
