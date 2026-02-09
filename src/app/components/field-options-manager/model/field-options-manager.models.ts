import { ExcelColumnMapping } from '../../excel-settings/models/excel-settings.models'; // Update the import path accordingly

export interface FieldWithOptions {
  field: ExcelColumnMapping;
  isExpanded: boolean;
  isEditing: boolean;
  newOptionValue: string;
  newOptionLabel: string;
}
