# Mock Server — Asistente Tributario SUNAT SOL

Servidor Express mínimo para el endpoint del asistente. Sirve respuestas localmente.
Si se configura con `ANTHROPIC_API_KEY`, reenvía las preguntas a Anthropic Claude.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd mock-server
npm install
```

## Uso básico (mock local)

```bash
npm start
```

El servidor arranca en `http://localhost:3001`.

## Endpoint

### POST /api/assistant

```json
{
  "question": "¿Qué es la retención del 8%?",
  "context": "Contexto del usuario...",
  "language": "es"
}
```

Respuesta:

```json
{
  "answer": "La retención del 8% es...",
  "confidence": 0.9,
  "lowConfidence": false
}
```

## Uso con Anthropic Claude

Crea un archivo `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Si la variable está presente, el servidor reenviará las preguntas a la API de Anthropic.
Si no, usará respuestas mock locales.

**Importante:** La API key NUNCA debe estar en el código del cliente móvil ni en el repositorio.
