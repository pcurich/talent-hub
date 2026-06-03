import * as XLSX from 'xlsx';
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import { ExcelColumnMapping } from '../model/excel-settings.models';
import { injectHeaderStyle } from './excel-style.util';
import { buildDataValidationsXml, DataValidationEntry } from './excel-validation.util';


/**
 * Options for {@link buildStyledWorkbook}.
 */
export interface StyledWorkbookOptions {
  wb: XLSX.WorkBook;
  fields: ExcelColumnMapping[];
  dvEntries: DataValidationEntry[];
}

/**
 * Serialises a workbook to a styled XLSX `Blob`.
 */
export const buildStyledWorkbook = ({ wb, fields, dvEntries }: StyledWorkbookOptions): Blob => {
  const wbBytes = new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as number[]);
  const unzipped = unzipSync(wbBytes);

  let headerStyleIndex = 0;
  if (unzipped['xl/styles.xml']) {
    const { xml, styleIndex } = injectHeaderStyle(strFromU8(unzipped['xl/styles.xml']));
    unzipped['xl/styles.xml'] = strToU8(xml);
    headerStyleIndex = styleIndex;
  }

  const wsKey = Object.keys(unzipped).find(k => /xl\/worksheets\/sheet\d+\.xml/.test(k));
  if (wsKey) {
    let wsXml = strFromU8(unzipped[wsKey]);

    wsXml = wsXml.replace(/<c r="([A-Z]{1,3}1)"/g, `<c r="$1" s="${headerStyleIndex}"`);
    wsXml = wsXml.replace(/<row r="1"/, `<row r="1" ht="28" customHeight="1"`);

    if (!wsXml.includes('<cols>')) {
      const colWidths = fields
        .map(
          (f, i) =>
            `<col min="${i + 1}" max="${i + 1}" width="${Math.min(Math.max(f.label.length * 1.3, 12), 35).toFixed(1)}" customWidth="1"/>`
        )
        .join('');
      wsXml = wsXml.replace('<sheetData>', `<cols>${colWidths}</cols><sheetData>`);
    }

    if (dvEntries.length > 0) {
      wsXml = wsXml.replace('</sheetData>', '</sheetData>' + buildDataValidationsXml(dvEntries));
    }

    unzipped[wsKey] = strToU8(wsXml);
  }

  const finalBytes = zipSync(unzipped);
  return new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
}

/**
 * Triggers a browser file download for a given `Blob`.
 */
export const triggerDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
