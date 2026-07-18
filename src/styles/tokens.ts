export const TYPOGRAPHY = {
  h1: 'text-3xl font-black tracking-tight',
  h2: 'text-2xl font-extrabold tracking-tight',
  h3: 'text-lg font-bold',
  h4: 'text-base font-bold',
  body: 'text-sm',
  bodyBold: 'text-sm font-bold',
  caption: 'text-xs text-gray-400 dark:text-gray-500',
  numeric: 'font-mono tracking-widest',
  numericLarge: 'font-mono tracking-widest text-xl font-extrabold',
  button: 'text-sm font-bold',
} as const

export const SPACING = {
  card: 'p-5',
  cardCompact: 'p-4',
  section: 'mb-6',
  sectionCompact: 'mb-4',
  gutter: 'px-4',
  gutterX2: 'px-8',
} as const

export const RADIUS = {
  card: 'rounded-[18px]',
  cardMd: 'rounded-[16px]',
  button: 'rounded-xl',
  buttonLg: 'rounded-[18px]',
  pill: 'rounded-full',
  input: 'rounded-xl',
  modal: 'rounded-t-2xl',
} as const

// SUNAT brand palette
export const SUNAT = {
  navy: '#0A2240',
  navyMid: '#0D3060',
  navyLight: '#1A3A6A',
  blue: '#1B4FBF',
  blueMid: '#2563EB',
  darkBlue: '#002F5D',
  gold: '#C8A84E',
  goldLight: '#E8DCC0',
  orange: '#E85E1E',
  red: '#DC2626',
  green: '#16A34A',
  bg: '#EEF2FF',
  bgCard: '#FFFFFF',
  textDark: '#1E293B',
  textMuted: '#64748B',
} as const

export const ACCENT = {
  blue: SUNAT.blue,
  blueLighter: '#1B4FBF18',
  darkBlue: SUNAT.darkBlue,
  navy: SUNAT.navy,
  navyMid: SUNAT.navyMid,
  orange: SUNAT.orange,
  gold: SUNAT.gold,
  purpleAI: '#6366F1',
} as const

export const STATUS_STYLES = {
  success: { color: '#16A34A', bg: '#DCFCE7' },
  warning: { color: '#D97706', bg: '#FEF3C7' },
  error: { color: '#DC2626', bg: '#FEE2E2' },
  info: { color: '#1B4FBF', bg: '#DBEAFE' },
  muted: { color: '#94A3B8', bg: '#F1F5F9' },
} as const
