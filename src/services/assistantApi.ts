import type { AssistantSettings, AssistantConversation } from '../types/shared'
import { localFAQ, type FAQItem } from './localFAQ'

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
  activeScreen?: string
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
  activeScreen,
}: AskAssistantParams): Promise<AskAssistantResult> {
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  console.log('[assistantApi] askAssistant called.', {
    question,
    useLocalOnly: settings.useLocalOnly,
    hasGeminiApiKey: !!geminiApiKey,
    activeScreen,
  })

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
        'No tengo una respuesta local para esa pregunta. Prueba a reformularla o desactiva "Usar solo respuestas locales" en Ajustes.',
      mode: 'local',
      lowConfidence: true,
    }
  }

  // Key already read at the top for logging
  if (geminiApiKey) {
    try {
      const systemPrompt = `Eres SOL, el asistente virtual oficial de la SUNAT (Superintendencia Nacional de Aduanas y de Administración Tributaria de Perú).
Tu objetivo es guiar a trabajadores independientes en sus trámites tributarios de forma simple, empática y clara.
Responde de manera concisa (máximo 3 párrafos), priorizando un lenguaje comprensible y directo, evitando tecnicismos innecesarios.

Contexto actual del usuario:
- RUC: ${context.ruc || 'No registrado'}
- Monto del último recibo emitido o en borrador: S/ ${context.monto || '0.00'}
- Retención aplicada: ${context.retencion}%
- Forma de pago: ${context.formaPago || 'No especificada'}
- Cliente: ${context.cliente || 'No especificado'}
- Pantalla actual de la aplicación: ${activeScreen || 'Inicio/Home'}

Instrucciones de comportamiento:
1. Si el usuario está en una pantalla específica (por ejemplo, "Deuda Tributaria" o "Tramites"), prioriza responder dudas sobre esa sección (ej. cómo pagar la deuda, plazos, multas).
2. Proporciona siempre información tributaria válida de Perú (Régimen de 4ta Categoría de Trabajadores Independientes, emisión de Recibos por Honorarios Electrónicos - RHE).
3. Si el usuario solicita un cálculo, realiza la simulación del impuesto a la renta o retención de 4ta categoría de forma detallada paso a paso si es necesario.
4. Mantén el tono amigable y profesional.`

      const contents = []
      const historyTurns = conversationHistory.slice(-5)
      for (const turn of historyTurns) {
        contents.push({
          role: 'user',
          parts: [{ text: turn.pregunta }]
        })
        contents.push({
          role: 'model',
          parts: [{ text: turn.respuesta }]
        })
      }

      contents.push({
        role: 'user',
        parts: [{ text: question }]
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      console.log('[assistantApi] Dispatching contents payload to Gemini API...', JSON.stringify(contents, null, 2))
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.2,
            }
          }),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (response.status === 429) {
        throw new Error('429')
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (text) {
        return {
          answer: text.trim(),
          mode: 'remote',
          lowConfidence: false,
        }
      }
      throw new Error('Invalid response format')

    } catch (err: any) {
      console.warn('[assistantApi] Falló Gemini, aplicando local fallback:', err.message)
      const isRateLimit = err.message === '429'
      const fallbackSuffix = isRateLimit
        ? '\n\n(Nota: Se alcanzó el límite de solicitudes del asistente remoto, respuesta local de respaldo)'
        : '\n\n(Nota: No se pudo contactar al asistente remoto, respuesta local de respaldo)'

      const faqMatch = matchLocalFAQ(question)
      if (faqMatch) {
        return {
          answer: faqMatch.respuesta + fallbackSuffix,
          mode: 'local',
          lowConfidence: false,
          sourceFAQ: faqMatch,
        }
      }

      return {
        answer: isRateLimit
          ? 'Lo siento, el asistente remoto está sobrecargado en este momento (Error 429) y no tengo una respuesta local guardada para tu duda.'
          : 'Lo siento, no tengo conexión con el asistente remoto en este momento y no tengo una respuesta local guardada para tu duda.',
        mode: 'local',
        lowConfidence: true,
      }
    }
  }

  // Fallback to old URL if key is missing (for local dev setup)
  const API_URL = process.env.EXPO_PUBLIC_ASSISTANT_API_URL || 'http://localhost:3001/api/assistant'
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

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