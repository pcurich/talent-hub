import { xmlEscape } from '../../../util/xml.util';

/**
 * Represents a single Excel data-validation drop-down entry.
 */
export interface DataValidationEntry {
  /** Cell range reference, e.g. "B2:B1048576" */
  sqref: string;
  /** Formula string (quoted list or named range), e.g. '"Option1,Option2"' */
  formula1: string;
}

/**
 * Builds the `<dataValidations>` XML block for an XLSX worksheet.
 */
export const buildDataValidationsXml = (entries: DataValidationEntry[]): string => {
  const items = entries
    .map(
      v =>
        `<dataValidation type="list" sqref="${v.sqref}" showDropDown="0" showErrorMessage="1" ` +
        `errorTitle="Valor no v&#225;lido" error="Seleccione una opci&#243;n de la lista desplegable">` +
        `<formula1>${xmlEscape(v.formula1)}</formula1></dataValidation>`
    )
    .join('');
  return `<dataValidations count="${entries.length}">${items}</dataValidations>`;
}
