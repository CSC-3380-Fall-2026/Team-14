export function parseMoney(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null
}
