require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const LOCAL_ANSWERS = {
  retencion:
    'La retención del 8% es un anticipo del impuesto a la renta que tu cliente te descuenta al pagarte. De cada S/ 100 que facturas, S/ 8 se van directo a la SUNAT a tu nombre. No es un gasto extra, es parte de tu impuesto anual.',
  renta_4ta:
    'La Renta de 4ta categoría es el impuesto que pagan los trabajadores independientes por sus honorarios. Se calcula al 8% sobre tu renta neta (ingresos brutos menos 7 UIT de deducción, que son S/ 36,050 en 2026).',
  neto_bruto:
    'El monto bruto es lo que facturas. El neto es lo que cobras después de la retención. Ejemplo: facturas S/ 1000, te retienen S/ 80 (8%), cobras S/ 920 netos.',
  anular:
    'Tienes 24 horas hábiles para anularlo en "Mis Recibos". Pasado ese plazo, debes hacer una nota de crédito en el portal SUNAT.',
  ruc: 'Debes ingresar el RUC de tu cliente (11 dígitos), no el tuyo. Las empresas grandes suelen empezar con 20.',
  gastos:
    'Gastos vinculados a tu actividad: alquiler de oficina, servicios, capacitación, salud, educación, movilidad, útiles. Cada uno tiene tope anual.',
  vencimiento:
    'La declaración anual vence entre marzo y abril según tu último dígito de RUC. Las mensuales vencen del 12 al 16 de cada mes.',
}

function findLocalAnswer(question) {
  const q = question.toLowerCase()
  if (q.includes('retenc') || q.includes('8%')) return LOCAL_ANSWERS.retencion
  if (q.includes('4ta') || (q.includes('renta') && q.includes('categ')))
    return LOCAL_ANSWERS.renta_4ta
  if (q.includes('neto') && q.includes('bruto')) return LOCAL_ANSWERS.neto_bruto
  if (q.includes('anular') || q.includes('revertir') || q.includes('error'))
    return LOCAL_ANSWERS.anular
  if (q.includes('ruc') && (q.includes('que') || q.includes('cual')))
    return LOCAL_ANSWERS.ruc
  if (q.includes('gasto') && q.includes('deduc')) return LOCAL_ANSWERS.gastos
  if (q.includes('venc') || q.includes('declar')) return LOCAL_ANSWERS.vencimiento
  return null
}

app.post('/api/assistant', async (req, res) => {
  const { question, context, language } = req.body

  if (!question) {
    return res.status(400).json({ error: 'Question is required' })
  }

  // Try local first
  const localAnswer = findLocalAnswer(question)
  if (localAnswer) {
    return res.json({ answer: localAnswer, confidence: 0.95, lowConfidence: false })
  }

  // Fallback to Anthropic if API key is configured
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: [
            {
              role: 'system',
              content:
                'Eres un asistente tributario peruano que explica términos en lenguaje cotidiano. Tu respuesta es informativa, no un cálculo oficial. Usa español simple. Máximo 3 párrafos.',
            },
            {
              role: 'user',
              content: `Contexto: ${context || 'N/A'}\n\nPregunta: ${question}`,
            },
          ],
        }),
      })

      const data = await response.json()
      const answer = data?.content?.[0]?.text || 'Lo siento, no pude procesar la respuesta.'
      return res.json({ answer, confidence: 0.85, lowConfidence: false })
    } catch (error) {
      console.error('Error calling Anthropic API:', error.message)
    }
  }

  // Ultimate fallback
  return res.json({
    answer:
      'No tengo una respuesta específica para tu pregunta. Te recomiendo consultar con un contador o intentar reformular la pregunta.',
    confidence: 0.3,
    lowConfidence: true,
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`)
  console.log(
    `Anthropic API: ${process.env.ANTHROPIC_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED (using mock responses)'}`,
  )
})
