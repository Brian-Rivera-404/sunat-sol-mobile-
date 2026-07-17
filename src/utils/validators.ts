const RUC_REGEX = /^\d{11}$/
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DNI_REGEX = /^\d{8}$/

const RUC_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
const RUC_MOD = 11

function rucCheckDigit(ruc: string): boolean {
  if (!RUC_REGEX.test(ruc)) return false
  let sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(ruc[i], 10) * RUC_WEIGHTS[i]
  }
  const remainder = sum % RUC_MOD
  const expected = remainder === 0 ? 0 : RUC_MOD - remainder
  return expected === parseInt(ruc[10], 10)
}

export function isValidRUC(value: string): boolean {
  return RUC_REGEX.test(value) && rucCheckDigit(value)
}

export function isValidDNI(value: string): boolean {
  return DNI_REGEX.test(value)
}

export function isValidDNIOrRUC(value: string): boolean {
  return isValidDNI(value) || isValidRUC(value)
}

export function isValidAmount(value: string): boolean {
  if (!AMOUNT_REGEX.test(value)) return false
  const num = parseFloat(value)
  return num > 0 && num <= 999999999.99
}

export function isValidDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

export function isFutureDate(value: string): boolean {
  if (!isValidDate(value)) return false
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return new Date(value + 'T23:59:59') > today
}

export function sanitizeInput(value: string): string {
  return value.replace(/[<>"']/g, '').trim()
}

export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  if (isNaN(num) || num <= 0) return null
  return Math.round(num * 100) / 100
}
