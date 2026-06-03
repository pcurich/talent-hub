/**
 * Result returned by {@link injectHeaderStyle}.
 */
export interface StyleInjectionResult {
  /** Updated styles.xml content */
  xml: string;
  /** Zero-based `xf` index of the newly added header style */
  styleIndex: number;
}

/**
 * Injects a header cell style (bold white text on dark-blue fill, thin border, centred)
 * into an XLSX `styles.xml` string.
 */
export const injectHeaderStyle = (stylesXml: string): StyleInjectionResult => {
  let xml = stylesXml;

  const fontCount   = parseInt(xml.match(/<fonts\s+count="(\d+)">/)?.[1]   ?? '1');
  const fillCount   = parseInt(xml.match(/<fills\s+count="(\d+)">/)?.[1]   ?? '2');
  const borderCount = parseInt(xml.match(/<borders\s+count="(\d+)">/)?.[1] ?? '1');
  const xfCount     = parseInt(xml.match(/<cellXfs\s+count="(\d+)">/)?.[1] ?? '1');

  xml = xml
    .replace(
      '</fonts>',
      `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font></fonts>`
    )
    .replace(`<fonts count="${fontCount}">`, `<fonts count="${fontCount + 1}">`);

  xml = xml
    .replace(
      '</fills>',
      `<fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor indexed="64"/></patternFill></fill></fills>`
    )
    .replace(`<fills count="${fillCount}">`, `<fills count="${fillCount + 1}">`);

  xml = xml
    .replace(
      '</borders>',
      `<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right>` +
        `<top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border></borders>`
    )
    .replace(`<borders count="${borderCount}">`, `<borders count="${borderCount + 1}">`);

  xml = xml
    .replace(
      '</cellXfs>',
      `<xf numFmtId="0" fontId="${fontCount}" fillId="${fillCount}" borderId="${borderCount}" ` +
        `xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">` +
        `<alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs>`
    )
    .replace(`<cellXfs count="${xfCount}">`, `<cellXfs count="${xfCount + 1}">`);

  return { xml, styleIndex: xfCount };
}
