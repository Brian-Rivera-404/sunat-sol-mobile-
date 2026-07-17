import { fmt, formatearFecha } from '../src/store/sunatStore'

describe('fmt()', () => {
  it('formats whole numbers with S/ prefix and decimals', () => {
    expect(fmt(1500)).toBe('S/ 1,500.00')
  })

  it('formats decimal numbers', () => {
    expect(fmt(1234.56)).toBe('S/ 1,234.56')
  })

  it('formats zero', () => {
    expect(fmt(0)).toBe('S/ 0.00')
  })

  it('formats large numbers with thousands separators', () => {
    expect(fmt(111111)).toBe('S/ 111,111.00')
  })
})

describe('formatearFecha()', () => {
  it('formats ISO date to "d mes yyyy"', () => {
    expect(formatearFecha('2026-07-10')).toMatch(/10 jul 2026/)
  })

  it('handles single-digit days', () => {
    expect(formatearFecha('2026-03-05')).toMatch(/5 mar 2026/)
  })
})
