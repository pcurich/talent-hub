import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import { Squad } from '../../../model/current-user.model';
import { CURRENT_USER_REPOSITORY } from '../../../tokens/repository.tokens';
import { ExcelConfigurationPresenter } from './excel-configuration.presenter';

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildDataValidationsXml(entries: Array<{ sqref: string; formula1: string }>): string {
  const items = entries.map(v =>
    `<dataValidation type="list" sqref="${v.sqref}" showDropDown="0" showErrorMessage="1" ` +
    `errorTitle="Valor no v&#225;lido" error="Seleccione una opci&#243;n de la lista desplegable">` +
    `<formula1>${xmlEscape(v.formula1)}</formula1></dataValidation>`
  ).join('');
  return `<dataValidations count="${entries.length}">${items}</dataValidations>`;
}

function injectHeaderStyle(stylesXml: string): { xml: string; styleIndex: number } {
  let xml = stylesXml;

  const fontCount   = parseInt(xml.match(/<fonts\s+count="(\d+)">/)?.[1]   ?? '1');
  const fillCount   = parseInt(xml.match(/<fills\s+count="(\d+)">/)?.[1]   ?? '2');
  const borderCount = parseInt(xml.match(/<borders\s+count="(\d+)">/)?.[1] ?? '1');
  const xfCount     = parseInt(xml.match(/<cellXfs\s+count="(\d+)">/)?.[1] ?? '1');

  xml = xml
    .replace('</fonts>',
      `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font></fonts>`)
    .replace(`<fonts count="${fontCount}">`, `<fonts count="${fontCount + 1}">`);

  xml = xml
    .replace('</fills>',
      `<fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor indexed="64"/></patternFill></fill></fills>`)
    .replace(`<fills count="${fillCount}">`, `<fills count="${fillCount + 1}">`);

  xml = xml
    .replace('</borders>',
      `<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right>` +
      `<top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border></borders>`)
    .replace(`<borders count="${borderCount}">`, `<borders count="${borderCount + 1}">`);

  xml = xml
    .replace('</cellXfs>',
      `<xf numFmtId="0" fontId="${fontCount}" fillId="${fillCount}" borderId="${borderCount}" ` +
      `xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">` +
      `<alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs>`)
    .replace(`<cellXfs count="${xfCount}">`, `<cellXfs count="${xfCount + 1}">`);

  return { xml, styleIndex: xfCount };
}

@Injectable()
export class ExcelSquadModalPresenter {
  private readonly currentUserRepo = inject(CURRENT_USER_REPOSITORY);
  private readonly configPresenter = inject(ExcelConfigurationPresenter);
  private readonly currentUser = this.currentUserRepo.get();

  show = false;
  mode: 'import' | 'export' = 'import';
  step: 1 | 2 | 3 = 1;
  selectedSquadIndex: number | null = null;
  fileError = '';
  templateDownloadUrl = '';
  templateFileName = '';
  fileName = '';

  get availableSquads(): Squad[] {
    return this.currentUser()?.squads ?? [];
  }

  get selectedSquad(): Squad | null {
    if (this.selectedSquadIndex === null) return null;
    return this.availableSquads[this.selectedSquadIndex] ?? null;
  }

  get expectedFileName(): string {
    const squad = this.selectedSquad;
    const user = this.currentUser();
    if (!squad || !user) return '';
    return `${squad.name.replaceAll(' ', '_')}_${user.directManager.registration}.xlsx`;
  }

  openForImport(): void {
    this.mode = 'import';
    this.selectedSquadIndex = null;
    this.step = 1;
    this.fileError = '';
    this.show = true;
  }

  openForExport(): void {
    this.mode = 'export';
    this.selectedSquadIndex = null;
    this.step = 1;
    this.templateDownloadUrl = '';
    this.show = true;
  }

  advanceToFileStep(): void {
    this.fileName = this.expectedFileName;
    this.step = 2;
    this.fileError = '';
  }

  generateTemplate(sheetName: string): void {
    const squad = this.selectedSquad;
    if (!squad) return;

    this.fileName = this.expectedFileName;
    // Ordenar por la letra de columna de excelCell (A1→A, B1→B, ...) para que
    // la posición física en el Excel coincida con lo que espera ExcelReaderPresenter
    const fields = this.configPresenter.getDefaultFields().sort((a, b) => {
      const colA = a.excelCell.replace(/\d+/, '');
      const colB = b.excelCell.replace(/\d+/, '');
      return colA < colB ? -1 : colA > colB ? 1 : 0;
    });
    const headers = fields.map(f => f.label);

    const rows = squad.teamMembers.map((member, idx) => {
      const row: Record<string, any> = {};
      fields.forEach(f => {
        switch (f.entityField) {
          case 'number':       row[f.label] = idx + 1; break;
          case 'registration': row[f.label] = member.registration; break;
          case 'teamMember':   row[f.label] = member.name; break;
          case 'company':      row[f.label] = member.companyValue ?? ''; break;
          case 'squad':        row[f.label] = squad.name; break;
          case 'productOwner': row[f.label] = squad.productOwner.name; break;
          default:             row[f.label] = '';
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'BCP');

    // Recopilar validaciones de campos tipo select
    const dvEntries: Array<{ sqref: string; formula1: string }> = [];
    fields.forEach(f => {
      if (f.fieldType === 'select' && f.options && f.options.length > 0) {
        const col = f.excelCell.replace(/\d+$/, '');
        const labels = f.options
          .filter(o => o.value !== 'blank')
          .map(o => o.label)
          .join(',');
        if (labels && labels.length <= 253) {
          dvEntries.push({ sqref: `${col}2:${col}1048576`, formula1: `"${labels}"` });
        }
      }
    });

    // SheetJS CE no escribe estilos ni dataValidations en el XML de salida.
    // Se inyectan directamente en el ZIP del XLSX via fflate.
    const wbBytes = new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as number[]);
    const unzipped = unzipSync(wbBytes);

    // 1. Estilos de cabecera → styles.xml
    let headerStyleIndex = 0;
    if (unzipped['xl/styles.xml']) {
      const { xml, styleIndex } = injectHeaderStyle(strFromU8(unzipped['xl/styles.xml']));
      unzipped['xl/styles.xml'] = strToU8(xml);
      headerStyleIndex = styleIndex;
    }

    // 2. Worksheet → estilo de cabecera + anchos de columna + alto de fila + data validations
    const wsKey = Object.keys(unzipped).find(k => /xl\/worksheets\/sheet\d+\.xml/.test(k));
    if (wsKey) {
      let wsXml = strFromU8(unzipped[wsKey]);

      // Estilo a celdas de fila 1
      wsXml = wsXml.replace(/<c r="([A-Z]{1,3}1)"/g, `<c r="$1" s="${headerStyleIndex}"`);
      // Altura de la fila de cabecera
      wsXml = wsXml.replace(/<row r="1"/, `<row r="1" ht="28" customHeight="1"`);
      // Anchos de columna proporcionales al label (mínimo 12, máximo 35)
      if (!wsXml.includes('<cols>')) {
        const colWidths = fields.map((f, i) =>
          `<col min="${i + 1}" max="${i + 1}" width="${Math.min(Math.max(f.label.length * 1.3, 12), 35).toFixed(1)}" customWidth="1"/>`
        ).join('');
        wsXml = wsXml.replace('<sheetData>', `<cols>${colWidths}</cols><sheetData>`);
      }
      // Data validations (dropdowns) – deben seguir a </sheetData> según el schema OOXML
      if (dvEntries.length > 0) {
        wsXml = wsXml.replace('</sheetData>', '</sheetData>' + buildDataValidationsXml(dvEntries));
      }

      unzipped[wsKey] = strToU8(wsXml);
    }

    const finalBytes = zipSync(unzipped);

    if (this.templateDownloadUrl) URL.revokeObjectURL(this.templateDownloadUrl);
    const blob = new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    this.templateDownloadUrl = URL.createObjectURL(blob);
    this.templateFileName = this.fileName;
    this.step = 3;
  }

  validateFile(file: File): boolean {
    if (file.name !== this.fileName) {
      this.fileError = `Se esperaba "${this.fileName}" pero se seleccionó "${file.name}".`;
      return false;
    }
    this.fileError = '';
    return true;
  }

  close(): void {
    this.show = false;
    this.step = 1;
    this.mode = 'import';
    this.selectedSquadIndex = null;
    this.fileError = '';
    if (this.templateDownloadUrl) {
      URL.revokeObjectURL(this.templateDownloadUrl);
      this.templateDownloadUrl = '';
    }
  }
}
