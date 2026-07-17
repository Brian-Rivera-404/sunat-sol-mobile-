/*
 * Mapeo prototipo → tipo nativo (RECIBOS)
 *   bruto → montoBruto
 *   ret   → retencion
 *   neto  → montoNeto
 *   pago  → formaPago
 *   estado → estado (emitido / revertido / anulado)
 */
export type RHEReceipt = {
  id: string
  ruc: string
  cliente: string
  fecha: string
  montoBruto: number
  retencion: number
  montoNeto: number
  formaPago: string
  estado: 'emitido' | 'revertido' | 'anulado'
}

export type DeductibleExpense = {
  id: string
  monto: number
  categoria: string
  comprobanteUri?: string
  establecimientoValidado: boolean
  descripcion: string
  fecha: string
}

export type TaxDeclaration = {
  id: string
  periodo: string
  estado: 'pendiente' | 'pagado' | 'vencido'
  fechaLimite: string
  monto: number
}

export type AssistantConversation = {
  id: string
  pregunta: string
  respuesta: string
  moduloDeOrigen: string
  modo: 'local' | 'remote'
  fecha: string
  lowConfidence?: boolean
}

export type Client = {
  id: string
  ruc: string
  nombre: string
  frecuente: boolean
}

export type InboxMessage = {
  id: string
  titulo: string
  cuerpo: string
  fecha: string
  leido: boolean
  modulo: string
}

export type AssistantSettings = {
  modality: 'text_only' | 'text_voice' | 'hands_free'
  ttsSpeed: 'slow' | 'normal' | 'fast'
  useLocalOnly: boolean
  language: 'es' | 'en'
}

export type AnnualTaxStep = {
  id: string
  label: string
  completado: boolean
}

export type ValidatedEstablishment = {
  ruc: string
  nombre: string
  categoria: 'hotel' | 'restaurante' | 'farmacia' | 'transporte' | 'otro'
  validado: boolean
}
