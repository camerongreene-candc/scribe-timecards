type RawRow = Record<string, unknown>

function extractCsvRows(rows: RawRow[]): string[][] {
  return rows.map((row) => {
    const str = (v: unknown) => (v != null ? String(v) : '')
    const name = [str(row.lastName), str(row.firstName)].filter(Boolean).join(', ')
    const meal = row.meal1Out && row.meal1In
      ? `${str(row.meal1Out)} - ${str(row.meal1In)}`
      : ''
    return [str(row.department), str(row.occupation), name, str(row.callTime), str(row.wrap), meal]
  })
}

export function buildCsv(rows: RawRow[]): string {
  const header = ['Department', 'Occupation', 'Name', 'Call Time', 'Wrap', 'Meal 1']
  return [header, ...extractCsvRows(rows)]
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
    .join('\n')
}
