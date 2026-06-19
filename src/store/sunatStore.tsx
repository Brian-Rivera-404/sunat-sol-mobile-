import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'sunat_sol_data'

interface User {
  nombre: string
  dni: string
  email: string
  tel: string
  direccion: string
}

export interface Recibo {
  id: string
  ruc: string
  cliente: string
  fecha: string
  montoBruto: number
  retencion: number
  montoNeto: number
  formaPago: string
  estado: string
}

interface ReciboData {
  ruc: string
  cliente: string
  monto: number
  formaPago: string
  retencion: boolean
}

export interface State {
  screen: string
  user: User
  recibos: Recibo[]
  nextId: number
  reciboData: ReciboData
  toast: string | null
  modalId: string | null
  loaded: boolean
  language: string
  darkMode: boolean
  biometricEnabled: boolean
}

type Action =
  | { type: 'LOAD'; payload: Partial<Pick<State, 'user' | 'recibos' | 'nextId' | 'language' | 'darkMode' | 'biometricEnabled'>> }
  | { type: 'GO'; payload: string }
  | { type: 'SET_RECIBO_DATA'; payload: Partial<ReciboData> }
  | { type: 'ADD_RECIBO'; payload: Omit<Recibo, 'id'> }
  | { type: 'EMITIR_RECIBO' }
  | { type: 'MODAL'; payload: string | null }
  | { type: 'TOAST'; payload: string | null }
  | { type: 'SET_LANG'; payload: string }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_BIOMETRIC'; payload: boolean }

const seedUser: User = {
  nombre: 'Juan Pérez García',
  dni: '10734521890',
  email: 'jperez@gmail.com',
  tel: '987654321',
  direccion: 'Av. Arequipa 1234, Lince, Lima',
}

const seedRecibos: Recibo[] = [
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
  screen: 'Login',
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
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload, loaded: true }
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
      const recibo: Recibo = {
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
      return { ...state, recibos: [recibo, ...state.recibos], nextId: state.nextId + 1 }
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
        if (raw) {
          const saved = JSON.parse(raw)
          dispatch({ type: 'LOAD', payload: { user: saved.user, recibos: saved.recibos, nextId: saved.nextId, language: saved.language, darkMode: saved.darkMode, biometricEnabled: saved.biometricEnabled } })
        } else {
          dispatch({ type: 'LOAD', payload: {} })
        }
      } catch {
        dispatch({ type: 'LOAD', payload: {} })
      }
    })()
  }, [])

  useEffect(() => {
    if (!state.loaded) return
    const persist = async () => {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify({ user: state.user, recibos: state.recibos, nextId: state.nextId, language: state.language, darkMode: state.darkMode, biometricEnabled: state.biometricEnabled }))
      } catch {}
    }
    persist()
  }, [state.user, state.recibos, state.nextId, state.loaded])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export const go = (screen: string) => ({ type: 'GO' as const, payload: screen })
export const setLang = (lang: string) => ({ type: 'SET_LANG' as const, payload: lang })
export const setDarkMode = (val: boolean) => ({ type: 'SET_DARK_MODE' as const, payload: val })
export const setBiometric = (val: boolean) => ({ type: 'SET_BIOMETRIC' as const, payload: val })
export const setReciboData = (data: Partial<ReciboData>) => ({ type: 'SET_RECIBO_DATA' as const, payload: data })
export const emitirRecibo = () => ({ type: 'EMITIR_RECIBO' as const })
export const showModal = (id: string) => ({ type: 'MODAL' as const, payload: id })
export const hideModal = () => ({ type: 'MODAL' as const, payload: null })
export const toastMsg = (msg: string) => ({ type: 'TOAST' as const, payload: msg })

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
