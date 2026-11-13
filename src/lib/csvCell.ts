/** A leading formula character is prefixed so a spreadsheet treats the cell as text. */
export function defuseFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Quoted, and a leading formula character is defused: names are free text and CSVs open in spreadsheets. */
export function csvCell(value: string): string {
  return `"${defuseFormula(value).replaceAll('"', '""')}"`;
}
