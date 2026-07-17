import type { AssistantSettings, AssistantConversation } from '../types/shared'
import { localFAQ, type FAQItem } from './localFAQ'

const API_URL = process.env.EXPO_PUBLIC_ASSISTANT_API_URL || 'http://localhost:3001/api/assistant'

interface RHEFormContextData {
  ruc: string
  monto: number
  retencion: number
  formaPago: string
  cliente: string
}

interface AskAssistantParams {
  question: string
  context: RHEFormContextData
  settings: AssistantSettings
  conversationHistory: AssistantConversation[]
}

interface AskAssistantResult {
  answer: string
  mode: 'local' | 'remote'
  lowConfidence: boolean
  sourceFAQ?: FAQItem
}

function matchLocalFAQ(question: string): FAQItem | null {
  const lowerQ = question.toLowerCase().trim()
  const normalizedQ = lowerQ.replace(/[¿?¡!.,;:]/g, '')

  const exactMatch = localFAQ.find((faq) => {
    const lowerFaq = faq.pregunta.toLowerCase().replace(/[¿?¡!.,;:]/g, '')
    return normalizedQ.includes(lowerFaq) || lowerFaq.includes(normalizedQ)
  })
  if (exactMatch) return exactMatch

  const tagMatch = localFAQ.find((faq) =>
    faq.tags.some((tag) => normalizedQ.includes(tag.toLowerCase()))
  )
  if (tagMatch) return tagMatch

  const wordMatches = localFAQ.map((faq) => {
    const faqWords = faq.pregunta.toLowerCase().replace(/[¿?¡!.,;:]/g, '').split(/\s+/)
    const questionWords = normalizedQ.split(/\s+/)
    const matches = questionWords.filter((w) => faqWords.includes(w) && w.length > 3).length
    return { faq, score: matches }
  })
  wordMatches.sort((a, b) => b.score - a.score)
  if (wordMatches[0]?.score >= 2) return wordMatches[0].faq

  return null
}

export async function askAssistant({
  question,
  context,
  settings,
  conversationHistory,
}: AskAssistantParams): Promise<AskAssistantResult> {
  if (settings.useLocalOnly) {
    const faqMatch = matchLocalFAQ(question)
    if (faqMatch) {
      return {
        answer: faqMatch.respuesta,
        mode: 'local',
        lowConfidence: false,
        sourceFAQ: faqMatch,
      }
    }
    return {
      answer:
        'No tengo una respuesta local para esa pregunta. Prueba a reformularla o desactiva "Usar solo respuestas locales" en Ajustes para consultar al asistente remoto.',
      mode: 'local',
      lowConfidence: true,
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        context: {
          ruc: context.ruc,
          monto: context.monto,
          retencion: context.retencion,
          formaPago: context.formaPago,
          cliente: context.cliente,
        },
        history: conversationHistory.slice(-5).map((c) => ({
          pregunta: c.pregunta,
          respuesta: c.respuesta,
          modulo: c.moduloDeOrigen,
        })),
        language: settings.language,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    return {
      answer: data.answer || 'Lo siento, no pude procesar la respuesta.',
      mode: 'remote',
      lowConfidence: data.lowConfidence === true,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[assistantApi] Timeout llamando al backend')
    } else {
      console.error('[assistantApi] Error:', error)
    }

    const faqMatch = matchLocalFAQ(question)
    if (faqMatch) {
      return {
        answer:
          faqMatch.respuesta +
          '\n\n(Nota: No hubo conexión con el servidor, esta es una respuesta local de respaldo)',
        mode: 'local',
        lowConfidence: false,
        sourceFAQ: faqMatch,
      }
    }

    return {
      answer:
        'No pude conectar con el asistente y no tengo una respuesta local para eso. Verifica tu conexión o activa "Usar solo respuestas locales" en Ajustes.',
      mode: 'local',
      lowConfidence: true,
    }
  }
}

export function getLocalFAQ(): FAQItem[] {
  return localFAQ
}

export function getFAQByModule(modulo: string): FAQItem[] {
  return localFAQ.filter((faq) => faq.modulo === modulo)
}

export function searchLocalFAQ(query: string): FAQItem[] {
  const lowerQ = query.toLowerCase()
  return localFAQ.filter(
    (faq) =>
      faq.pregunta.toLowerCase().includes(lowerQ) ||
      faq.respuesta.toLowerCase().includes(lowerQ) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(lowerQ))
  )
}