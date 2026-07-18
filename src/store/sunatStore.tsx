import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { secureSaveCCI, secureGetCCI, secureSavePinHash, secureGetPinHash } from '../services/secureStorage'
import type { RHEReceipt, DeductibleExpense, TaxDeclaration, AssistantConversation, Client, InboxMessage, AssistantSettings, TaxDebt, Tramite, GuiaOrientacion } from '../types/shared'
import type { RootStackParamList } from '../types/navigation'

const KEY = 'sunat_sol_data'

interface User {
  nombre: string
  dni: string
  email: string
  tel: string
  direccion: string
}

interface ReciboData {
  ruc: string
  cliente: string
  monto: number
  formaPago: string
  retencion: boolean
}

export interface State {
  screen: keyof RootStackParamList
  user: User
  recibos: RHEReceipt[]
  nextId: number
  reciboData: ReciboData
  toast: string | null
  modalId: string | null
  loaded: boolean
  language: string
  darkMode: boolean
  biometricEnabled: boolean
  highContrast: boolean
  expenses: DeductibleExpense[]
  declarations: TaxDeclaration[]
  conversations: AssistantConversation[]
  assistantSettings: AssistantSettings
  clients: Client[]
  inbox: InboxMessage[]
  onboardingSeen: boolean
  tempOnboardingSeen?: boolean
  sessionTimeoutMinutes: number
  pinHash: string | null
  cci: string | null
  taxDebts: TaxDebt[]
  tramites: Tramite[]
}

type Action =
  | { type: 'LOAD'; payload: Partial<Pick<State, 'user' | 'recibos' | 'nextId' | 'language' | 'darkMode' | 'biometricEnabled' | 'highContrast' | 'expenses' | 'declarations' | 'conversations' | 'assistantSettings' | 'clients' | 'inbox' | 'onboardingSeen' | 'sessionTimeoutMinutes' | 'pinHash' | 'cci' | 'taxDebts' | 'tramites'>> }
  | { type: 'GO'; payload: keyof RootStackParamList }
  | { type: 'SET_RECIBO_DATA'; payload: Partial<ReciboData> }
  | { type: 'ADD_RECIBO'; payload: Omit<RHEReceipt, 'id'> }
  | { type: 'EMITIR_RECIBO' }
  | { type: 'REVERT_RECIBO'; payload: string }
  | { type: 'MODAL'; payload: string | null }
  | { type: 'TOAST'; payload: string | null }
  | { type: 'SET_LANG'; payload: string }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_BIOMETRIC'; payload: boolean }
  | { type: 'SET_HIGH_CONTRAST'; payload: boolean }
  | { type: 'ADD_EXPENSE'; payload: DeductibleExpense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'ADD_DECLARATION'; payload: TaxDeclaration }
  | { type: 'ADD_CONVERSATION'; payload: AssistantConversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'CLEAR_CONVERSATIONS' }
  | { type: 'SET_ASSISTANT_SETTINGS'; payload: Partial<AssistantSettings> }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'REMOVE_CLIENT'; payload: string }
  | { type: 'SET_INBOX'; payload: InboxMessage[] }
  | { type: 'MARK_INBOX_READ'; payload: string }
  | { type: 'SET_ONBOARDING_SEEN'; payload: boolean }
  | { type: 'SET_TEMP_ONBOARDING_SEEN'; payload: boolean }
  | { type: 'SET_SESSION_TIMEOUT'; payload: number }
  | { type: 'SET_PIN_HASH'; payload: string | null }
  | { type: 'SET_CCI'; payload: string | null }
  | { type: 'SET_TAX_DEBTS'; payload: TaxDebt[] }
  | { type: 'PAY_DEBT'; payload: string }
  | { type: 'ADD_TRAMITE'; payload: Tramite }
  | { type: 'UPDATE_TRAMITE'; payload: { id: string; estado: Tramite['estado']; observacion?: string } }

const seedUser: User = {
  nombre: 'Juan Pérez García',
  dni: '10734521890',
  email: 'jperez@gmail.com',
  tel: '987654321',
  direccion: 'Av. Arequipa 1234, Lince, Lima',
}

/*
 * Mapeo prototipo → nativo (RECIBOS)
 *   bruto → montoBruto   ret → retencion   neto → montoNeto
 *   pago  → formaPago    estado → estado
 */
const seedRecibos: RHEReceipt[] = [
  { id: 'E001-0030', ruc: '20100070970', cliente: 'BANCO DE CRÉDITO DEL PERÚ S.A.', fecha: '2026-06-19', montoBruto: 111111, retencion: 8888.88, montoNeto: 102222.12, formaPago: 'cheque', estado: 'emitido' },
  { id: 'E001-0029', ruc: '20100070970', cliente: 'BANCO DE CRÉDITO DEL PERÚ S.A.', fecha: '2026-06-14', montoBruto: 2500, retencion: 200, montoNeto: 2300, formaPago: 'transferencia', estado: 'emitido' },
  { id: 'E001-0028', ruc: '20131694977', cliente: 'ALICORP S.A.A.', fecha: '2026-06-04', montoBruto: 1800, retencion: 144, montoNeto: 1656, formaPago: 'transferencia', estado: 'emitido' },
  { id: 'E001-0027', ruc: '20100047218', cliente: 'TELEFÓNICA DEL PERÚ S.A.A.', fecha: '2026-05-05', montoBruto: 1200, retencion: 144, montoNeto: 1056, formaPago: 'efectivo', estado: 'emitido' },
  { id: 'E001-0026', ruc: '20100070970', cliente: 'BANCO DE CRÉDITO DEL PERÚ S.A.', fecha: '2026-04-20', montoBruto: 3000, retencion: 240, montoNeto: 2760, formaPago: 'deposito', estado: 'anulado' },
  { id: 'E001-0025', ruc: '20100070970', cliente: 'BANCO DE CRÉDITO DEL PERÚ S.A.', fecha: '2026-03-15', montoBruto: 500, retencion: 0, montoNeto: 500, formaPago: 'efectivo', estado: 'emitido' },
  { id: 'E001-0024', ruc: '20131694977', cliente: 'ALICORP S.A.A.', fecha: '2026-02-10', montoBruto: 800, retencion: 64, montoNeto: 736, formaPago: 'transferencia', estado: 'emitido' },
  { id: 'E001-0023', ruc: '20100047218', cliente: 'TELEFÓNICA DEL PERÚ S.A.A.', fecha: '2026-01-22', montoBruto: 350, retencion: 28, montoNeto: 322, formaPago: 'cheque', estado: 'emitido' },
]

const initialReciboData: ReciboData = { ruc: '', cliente: '', monto: 0, formaPago: 'cheque', retencion: true }

const seedState: State = {
  screen: 'Home',
  user: seedUser,
  recibos: seedRecibos,
  nextId: 31,
  reciboData: initialReciboData,
  toast: null,
  modalId: null,
  loaded: false,
  language: 'es',
  darkMode: false,
  biometricEnabled: false,
  highContrast: false,
  /*
   * Mapeo prototipo → nativo (GASTOS)
   *   desc   → descripcion              amount → monto
   *   type   → categoria (mapeo semántico: Hospedaje→otros, Restaurante→otros, etc.)
   *   valid  → establecimientoValidado  date → fecha (YYYY-MM-DD)
   */
  expenses: [
    { id: 'EXP-001', monto: 380, categoria: 'otros', establecimientoValidado: true, descripcion: 'Hotel Casa Andina Select Miraflores · Hospedaje', fecha: '2026-07-10' },
    { id: 'EXP-002', monto: 145, categoria: 'otros', establecimientoValidado: true, descripcion: 'Restaurante La Mar · Restaurante', fecha: '2026-07-08' },
    { id: 'EXP-003', monto: 2200, categoria: 'oficina_alquiler', establecimientoValidado: true, descripcion: 'Alquiler Oficina San Isidro · Arrendamiento', fecha: '2026-07-01' },
    { id: 'EXP-004', monto: 80, categoria: 'otros', establecimientoValidado: false, descripcion: 'Ferretería Central Lima · Otro', fecha: '2026-07-05' },
  ],
  /*
   * Mapeo prototipo → nativo (DECLARACIONES)
   *   periodo → periodo   monto → monto
   *   estado  → estado    fecha → fechaLimite
   */
  declarations: [
    { id: 'DEC-004', periodo: '2026-06', estado: 'pendiente', fechaLimite: '2026-07-18', monto: 1890 },
    { id: 'DEC-003', periodo: '2026-05', estado: 'pagado', fechaLimite: '2026-06-16', monto: 2340 },
    { id: 'DEC-002', periodo: '2026-04', estado: 'pagado', fechaLimite: '2026-05-15', monto: 1650 },
    { id: 'DEC-001', periodo: '2026-03', estado: 'pagado', fechaLimite: '2026-04-15', monto: 1500 },
  ],
  conversations: [],
  assistantSettings: { modality: 'text_voice', ttsSpeed: 'normal', useLocalOnly: false, language: 'es' },
  clients: [
    { id: 'c1', ruc: '20100070970', nombre: 'BANCO DE CRÉDITO DEL PERÚ S.A.', frecuente: true },
    { id: 'c2', ruc: '20131694977', nombre: 'ALICORP S.A.A.', frecuente: true },
    { id: 'c3', ruc: '20100047218', nombre: 'TELEFÓNICA DEL PERÚ S.A.A.', frecuente: true },
  ],
  /*
   * Mapeo prototipo → nativo (INBOX)
   *   titulo → titulo   cuerpo → cuerpo   fecha → fecha   leido → leido
   *   tag    → modulo (Alerta→declaraciones, Éxito→rhe)
   */
  inbox: [
    { id: 'in1', titulo: 'Declaración PDT 616 — jun 2026', cuerpo: 'Tienes plazo hasta el 18 de julio. Evita multas declarando a tiempo.', fecha: '2026-07-15', leido: false, modulo: 'declaraciones' },
    { id: 'in2', titulo: 'CCI registrada exitosamente', cuerpo: 'Tu cuenta BCP terminada en ****4521 fue registrada para devoluciones tributarias.', fecha: '2026-07-10', leido: true, modulo: 'rhe' },
    { id: 'in3', titulo: 'Suspensión de retenciones aprobada', cuerpo: 'Tu solicitud de suspensión de retenciones es válida hasta el 31/12/2026.', fecha: '2026-07-02', leido: true, modulo: 'rhe' },
  ],
  taxDebts: [
    { id: 'DEU-001', tributo: 'Impuesto a la Renta 4ta Categoría', periodo: '2026-06', monto: 1890, fechaVencimiento: '2026-07-18', estado: 'pendiente', tipo: 'declaracion' },
    { id: 'DEU-002', tributo: 'Impuesto a la Renta 4ta Categoría', periodo: '2026-05', monto: 2340, fechaVencimiento: '2026-06-16', estado: 'pagado', tipo: 'declaracion' },
    { id: 'DEU-003', tributo: 'Multa — Presentación fuera de plazo', periodo: '2026-03', monto: 460, fechaVencimiento: '2026-04-30', estado: 'vencido', tipo: 'multa' },
    { id: 'DEU-004', tributo: 'Liquidación — Renta Anual 2025', periodo: '2025', monto: 12500, fechaVencimiento: '2027-03-31', estado: 'fraccionado', tipo: 'liquidacion' },
  ],
  tramites: [
    { id: 'TR-001', tipo: 'Suspensión de Retenciones', descripcion: 'Solicitud de suspensión de retenciones 2026 — ingresos proyectados menores a S/ 36,050', fechaPresentacion: '2026-01-15', estado: 'aprobado' },
    { id: 'TR-002', tipo: 'Fraccionamiento de Deuda', descripcion: 'Solicitud de fraccionamiento de deuda tributaria — Renta Anual 2025', fechaPresentacion: '2026-06-01', estado: 'en_revision' },
    { id: 'TR-003', tipo: 'Actualización de Datos RUC', descripcion: 'Cambio de dirección fiscal a Av. Arequipa 1234, Lince', fechaPresentacion: '2026-07-10', estado: 'subsanacion', observacion: 'Adjuntar recibo de servicios del domicilio declarado' },
  ],
  onboardingSeen: false,
  tempOnboardingSeen: false,
  sessionTimeoutMinutes: 10,
  pinHash: null,
  cci: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        ...action.payload,
        screen: 'Home', // siempre Home, ignorar lo guardado
        recibos: action.payload.recibos ?? state.recibos,
        expenses: action.payload.expenses ?? state.expenses,
        declarations: action.payload.declarations ?? state.declarations,
        conversations: action.payload.conversations ?? state.conversations,
        clients: action.payload.clients ?? state.clients,
        inbox: action.payload.inbox ?? state.inbox,
        taxDebts: action.payload.taxDebts ?? state.taxDebts,
        tramites: action.payload.tramites ?? state.tramites,
        loaded: true,
      }
    case 'GO':
      return { ...state, screen: action.payload }
    case 'SET_RECIBO_DATA':
      return { ...state, reciboData: { ...state.reciboData, ...action.payload } }
    case 'ADD_RECIBO': {
      const nro = String(state.nextId).padStart(4, '0')
      const id = `E001-${nro}`
      return { ...state, recibos: [{ id, ...action.payload }, ...state.recibos], nextId: state.nextId + 1 }
    }
    case 'EMITIR_RECIBO': {
      const { reciboData } = state
      const ret = reciboData.retencion ? reciboData.monto * 0.08 : 0
      const nro = String(state.nextId).padStart(4, '0')
      const id = `E001-${nro}`
      const recibo: RHEReceipt = {
        id,
        ruc: reciboData.ruc,
        cliente: reciboData.cliente,
        fecha: new Date().toISOString().split('T')[0],
        montoBruto: reciboData.monto,
        retencion: ret,
        montoNeto: reciboData.monto - ret,
        formaPago: reciboData.formaPago,
        estado: 'emitido',
      }
      return { ...state, recibos: [recibo, ...(state.recibos ?? [])], nextId: state.nextId + 1 }
    }
    case 'REVERT_RECIBO': {
      return {
        ...state,
        recibos: (state.recibos ?? []).map((r) =>
          r.id === action.payload ? { ...r, estado: 'revertido' as const } : r
        ),
      }
    }
    case 'MODAL':
      return { ...state, modalId: action.payload }
    case 'TOAST':
      return { ...state, toast: action.payload }
    case 'SET_LANG':
      return { ...state, language: action.payload }
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload }
    case 'SET_BIOMETRIC':
      return { ...state, biometricEnabled: action.payload }
    case 'SET_HIGH_CONTRAST':
      return { ...state, highContrast: action.payload }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...(state.expenses ?? [])] }
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: (state.expenses ?? []).filter((e) => e.id !== action.payload) }
    case 'ADD_DECLARATION':
      return { ...state, declarations: [action.payload, ...(state.declarations ?? [])] }
    case 'ADD_CONVERSATION':
      return { ...state, conversations: [action.payload, ...(state.conversations ?? [])] }
    case 'DELETE_CONVERSATION':
      return { ...state, conversations: (state.conversations ?? []).filter((c) => c.id !== action.payload) }
    case 'CLEAR_CONVERSATIONS':
      return { ...state, conversations: [] }
    case 'SET_ASSISTANT_SETTINGS':
      return { ...state, assistantSettings: { ...state.assistantSettings, ...action.payload } }
    case 'ADD_CLIENT':
      return { ...state, clients: [...(state.clients ?? []).filter((c) => c.ruc !== action.payload.ruc), action.payload] }
    case 'REMOVE_CLIENT':
      return { ...state, clients: (state.clients ?? []).filter((c) => c.id !== action.payload) }
    case 'SET_INBOX':
      return { ...state, inbox: action.payload }
    case 'MARK_INBOX_READ':
      return { ...state, inbox: (state.inbox ?? []).map((m) => (m.id === action.payload ? { ...m, leido: true } : m)) }
    case 'SET_ONBOARDING_SEEN':
      return { ...state, onboardingSeen: action.payload }
    case 'SET_TEMP_ONBOARDING_SEEN':
      return { ...state, tempOnboardingSeen: action.payload }
    case 'SET_SESSION_TIMEOUT':
      return { ...state, sessionTimeoutMinutes: action.payload }
    case 'SET_PIN_HASH':
      return { ...state, pinHash: action.payload }
    case 'SET_CCI':
      return { ...state, cci: action.payload }
    case 'SET_TAX_DEBTS':
      return { ...state, taxDebts: action.payload }
    case 'PAY_DEBT':
      return { ...state, taxDebts: (state.taxDebts ?? []).map((d) => (d.id === action.payload ? { ...d, estado: 'pagado' as const } : d)) }
    case 'ADD_TRAMITE':
      return { ...state, tramites: [action.payload, ...(state.tramites ?? [])] }
    case 'UPDATE_TRAMITE':
      return { ...state, tramites: (state.tramites ?? []).map((t) => (t.id === action.payload.id ? { ...t, estado: action.payload.estado, observacion: action.payload.observacion ?? t.observacion } : t)) }
    default:
      return state
  }
}

interface StoreCtx {
  state: State
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, seedState)

  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY)
        let payload: Record<string, any> = {}
        if (raw) {
          const saved = JSON.parse(raw)
          payload = saved
        }
        if (Platform.OS !== 'web') {
          const cci = await secureGetCCI()
          if (cci) payload.cci = cci
          const pinHash = await secureGetPinHash()
          if (pinHash) payload.pinHash = pinHash
        }
        dispatch({ type: 'LOAD', payload })
      } catch {
        dispatch({ type: 'LOAD', payload: {} })
      }
    })()
  }, [])

  useEffect(() => {
    if (!state.loaded) return
    const persist = async () => {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify({ user: state.user, recibos: state.recibos, nextId: state.nextId, language: state.language, darkMode: state.darkMode, biometricEnabled: state.biometricEnabled, highContrast: state.highContrast, expenses: state.expenses, declarations: state.declarations, conversations: state.conversations, assistantSettings: state.assistantSettings, clients: state.clients, inbox: state.inbox, onboardingSeen: state.onboardingSeen, sessionTimeoutMinutes: state.sessionTimeoutMinutes, taxDebts: state.taxDebts, tramites: state.tramites }))
      } catch {}
    }
    persist()
  }, [state.user, state.recibos, state.nextId, state.language, state.darkMode, state.biometricEnabled, state.highContrast, state.expenses, state.declarations, state.conversations, state.assistantSettings, state.clients, state.inbox, state.onboardingSeen, state.sessionTimeoutMinutes, state.loaded])

  useEffect(() => {
    if (!state.loaded || !state.cci) return
    secureSaveCCI(state.cci)
  }, [state.cci, state.loaded])

  useEffect(() => {
    if (!state.loaded || !state.pinHash) return
    secureSavePinHash(state.pinHash)
  }, [state.pinHash, state.loaded])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export const go = (screen: keyof RootStackParamList) => ({ type: 'GO' as const, payload: screen })
export const setLang = (lang: string) => ({ type: 'SET_LANG' as const, payload: lang })
export const setDarkMode = (val: boolean) => ({ type: 'SET_DARK_MODE' as const, payload: val })
export const setBiometric = (val: boolean) => ({ type: 'SET_BIOMETRIC' as const, payload: val })
export const setHighContrast = (val: boolean) => ({ type: 'SET_HIGH_CONTRAST' as const, payload: val })
export const setReciboData = (data: Partial<ReciboData>) => ({ type: 'SET_RECIBO_DATA' as const, payload: data })
export const emitirRecibo = () => ({ type: 'EMITIR_RECIBO' as const })
export const showModal = (id: string) => ({ type: 'MODAL' as const, payload: id })
export const hideModal = () => ({ type: 'MODAL' as const, payload: null })
export const toastMsg = (msg: string) => ({ type: 'TOAST' as const, payload: msg })
export const addExpense = (expense: DeductibleExpense) => ({ type: 'ADD_EXPENSE' as const, payload: expense })
export const removeExpense = (id: string) => ({ type: 'REMOVE_EXPENSE' as const, payload: id })
export const addDeclaration = (declaration: TaxDeclaration) => ({ type: 'ADD_DECLARATION' as const, payload: declaration })
export const addConversation = (conversation: AssistantConversation) => ({ type: 'ADD_CONVERSATION' as const, payload: conversation })
export const deleteConversation = (id: string) => ({ type: 'DELETE_CONVERSATION' as const, payload: id })
export const clearConversations = () => ({ type: 'CLEAR_CONVERSATIONS' as const })
export const setAssistantSettings = (settings: Partial<AssistantSettings>) => ({ type: 'SET_ASSISTANT_SETTINGS' as const, payload: settings })
export const addClient = (client: Client) => ({ type: 'ADD_CLIENT' as const, payload: client })
export const removeClient = (id: string) => ({ type: 'REMOVE_CLIENT' as const, payload: id })
export const setInbox = (inbox: InboxMessage[]) => ({ type: 'SET_INBOX' as const, payload: inbox })
export const markInboxRead = (id: string) => ({ type: 'MARK_INBOX_READ' as const, payload: id })
export const setOnboardingSeen = (val: boolean) => ({ type: 'SET_ONBOARDING_SEEN' as const, payload: val })
export const setTempOnboardingSeen = (val: boolean) => ({ type: 'SET_TEMP_ONBOARDING_SEEN' as const, payload: val })
export const setSessionTimeout = (minutes: number) => ({ type: 'SET_SESSION_TIMEOUT' as const, payload: minutes })
export const setPinHash = (hash: string | null) => ({ type: 'SET_PIN_HASH' as const, payload: hash })
export const setCCI = (cci: string | null) => ({ type: 'SET_CCI' as const, payload: cci })
export const setTaxDebts = (debts: TaxDebt[]) => ({ type: 'SET_TAX_DEBTS' as const, payload: debts })
export const payDebt = (id: string) => ({ type: 'PAY_DEBT' as const, payload: id })
export const addTramite = (tramite: Tramite) => ({ type: 'ADD_TRAMITE' as const, payload: tramite })
export const updateTramite = (id: string, estado: Tramite['estado'], observacion?: string) => ({ type: 'UPDATE_TRAMITE' as const, payload: { id, estado, observacion } })

export const RUC_DB: Record<string, string> = {
  '20100070970': 'BANCO DE CRÉDITO DEL PERÚ S.A.',
  '20131694977': 'ALICORP S.A.A.',
  '20100047218': 'TELEFÓNICA DEL PERÚ S.A.A.',
}

export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']

export function fmt(n: number): string {
  return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatearFecha(fechaStr: string): string {
  const d = new Date(fechaStr + 'T00:00:00')
  return `${d.getDate()} ${MESES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`
}
