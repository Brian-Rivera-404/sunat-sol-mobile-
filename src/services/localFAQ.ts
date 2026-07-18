export type FAQItem = {
  id: string
  pregunta: string
  respuesta: string
  modulo: string
  tags: string[]
}

export const localFAQ: FAQItem[] = [
  {
    id: 'faq-retencion-8',
    pregunta: '¿Qué es la retención del 8%?',
    respuesta:
      'Es un anticipo del impuesto a la renta que tu cliente te descuenta al pagarte. De cada S/ 100 que facturas, S/ 8 se van directo a la SUNAT a tu nombre. No es un gasto extra, es parte de tu impuesto anual.',
    modulo: 'rhe',
    tags: ['retencion', 'rhe', 'impuesto', 'renta'],
  },
  {
    id: 'faq-renta-4ta',
    pregunta: '¿Qué es Renta de 4ta categoría?',
    respuesta:
      'Es el impuesto que pagan los trabajadores independientes (honorarios) por sus ingresos. Se calcula al 8% sobre tu renta neta (ingresos menos 7 UIT de deducción). Lo declaras una vez al año entre enero y marzo.',
    modulo: 'renta',
    tags: ['renta', '4ta', 'anual', 'declaracion'],
  },
  {
    id: 'faq-neto-menor-bruto',
    pregunta: '¿Por qué el monto neto es menor al bruto?',
    respuesta:
      'El monto bruto es lo que facturas. El neto es lo que realmente cobras después de que te descuenten la retención del 8% (si aplica). Ejemplo: facturas S/ 1000, te retienen S/ 80, cobras S/ 920.',
    modulo: 'rhe',
    tags: ['monto', 'bruto', 'neto', 'retencion'],
  },
  {
    id: 'faq-equivoco-emitir',
    pregunta: '¿Qué pasa si me equivoco al emitir?',
    respuesta:
      'Tienes 24 horas hábiles para anularlo (revertir) desde la app, en "Mis Recibos". Pasado ese plazo, no se puede anular desde la app y debes hacer una nota de crédito en el portal SUNAT.',
    modulo: 'rhe',
    tags: ['error', 'anular', 'revertir', '24 horas'],
  },
  {
    id: 'faq-como-anular',
    pregunta: '¿Cómo anulo un recibo?',
    respuesta:
      'Ve a "Mis Recibos", busca el recibo, toca "Ver detalle" y luego "Revertir recibo". Te pedirá confirmar dos veces y te recordará el plazo de 24 horas hábiles. Una vez revertido, el estado cambia a "Revertido".',
    modulo: 'rhe',
    tags: ['anular', 'revertir', 'mis recibos'],
  },
  {
    id: 'faq-que-ruc-ingresar',
    pregunta: '¿Qué RUC debo ingresar?',
    respuesta:
      'El RUC de tu cliente (quien te paga), no el tuyo. Debe tener 11 dígitos. Si es una empresa grande, suele empezar con 20. Puedes usar los RUCs de prueba que aparecen en la pantalla para probar.',
    modulo: 'rhe',
    tags: ['ruc', 'cliente', '11 digitos'],
  },
  {
    id: 'faq-inciso-ab',
    pregunta: '¿Qué significa "inciso A/B"?',
    respuesta:
      'Son los tipos de renta de 4ta categoría. Inciso A: honorarios por servicios profesionales independientes. Inciso B: otros ingresos no empresariales (ej. comisiones, regalías). La gran mayoría usa Inciso A.',
    modulo: 'renta',
    tags: ['inciso', '4ta', 'tipo renta'],
  },
  {
    id: 'faq-cuando-aplica-retencion',
    pregunta: '¿Cuándo aplica la retención?',
    respuesta:
      'Siempre que tu cliente sea agente de retención (empresas, estado, etc.). Si tu cliente es una persona natural sin negocio o no es agente de retención, no te retiene. En la app, el toggle "Aplicar retención 8%" controla esto.',
    modulo: 'rhe',
    tags: ['retencion', 'agente', 'aplica'],
  },
  {
    id: 'faq-cliente-no-retiene',
    pregunta: '¿Qué hago si mi cliente no retiene?',
    respuesta:
      'Si tu cliente no es agente de retención, desactiva el toggle "Aplicar retención 8%" al emitir. El monto neto será igual al bruto. Igual debes declarar ese ingreso en tu renta anual.',
    modulo: 'rhe',
    tags: ['retencion', 'cliente', 'no retiene'],
  },
  {
    id: 'faq-descargar-pdf',
    pregunta: '¿Cómo descargo el PDF del recibo?',
    respuesta:
      'En "Mis Recibos", toca "Ver detalle" en cualquier recibo. Ahí verás la opción de compartir/exportar. También puedes ir a "Reportes" para exportar todo tu historial en PDF o Excel para tu contador.',
    modulo: 'reportes',
    tags: ['pdf', 'descargar', 'compartir', 'reporte'],
  },
  {
    id: 'faq-perder-conexion',
    pregunta: '¿Qué pasa si pierdo conexión al emitir?',
    respuesta:
      'La app guarda el borrador localmente. Cuando recuperes conexión, podrás terminar la emisión. El recibo no se envía a SUNAT hasta que toques "Confirmar y emitir" con internet.',
    modulo: 'rhe',
    tags: ['conexion', 'offline', 'borrador'],
  },
  {
    id: 'faq-cambiar-idioma-oscuro',
    pregunta: '¿Cómo cambio el idioma o el modo oscuro?',
    respuesta:
      'En la pantalla principal (Inicio), abajo del todo tienes botones para cambiar idioma (ES/EN) y activar/desactivar modo oscuro y alto contraste. También están en Ajustes del Asistente.',
    modulo: 'general',
    tags: ['idioma', 'modo oscuro', 'accesibilidad', 'ajustes'],
  },
  {
    id: 'faq-gastos-deducibles',
    pregunta: '¿Qué gastos puedo deducir?',
    respuesta:
      'Gastos vinculados a tu actividad: alquiler de oficina, servicios (luz, agua, internet), capacitación, salud, educación, movilidad, útiles de escritorio. Cada uno tiene tope anual. La app te ayuda a clasificarlos al registrar el comprobante.',
    modulo: 'gastos',
    tags: ['gastos', 'deducibles', 'renta', 'tope'],
  },
  {
    id: 'faq-cuando-vence-declaracion',
    pregunta: '¿Cuándo vence mi declaración?',
    respuesta:
      'La declaración anual de renta 2026 vence entre marzo y abril 2027 según tu último dígito de RUC. Las declaraciones mensuales (si aplica) vencen el 12-16 de cada mes. El Calendario Tributario te muestra tu fecha exacta.',
    modulo: 'calendario',
    tags: ['vencimiento', 'declaracion', 'calendario', 'ruc'],
  },
  {
    id: 'faq-que-significa-regimen-mype',
    pregunta: '¿Qué significa régimen MYPE?',
    respuesta:
      'Es el Régimen MYPE Tributario para micro y pequeñas empresas. Si tus ingresos anuales no superan 1700 UIT, puedes acogerte. Tiene tasas progresivas (10% - 29.5%) y beneficios como deducción de 7 UIT. No es lo mismo que 4ta categoría.',
    modulo: 'ruc',
    tags: ['mype', 'regimen', 'renta', 'pequeña empresa'],
  },
  {
    id: 'faq-para-que-sirve-cci',
    pregunta: '¿Para qué sirve registrar mi CCI?',
    respuesta:
      'Para que la SUNAT te devuelva saldos a favor (devoluciones de impuestos) directo a tu cuenta bancaria. El CCI tiene 20 dígitos y lo encuentras en tu app bancaria o estado de cuenta. Sin CCI, la devolución demora más.',
    modulo: 'ruc',
    tags: ['cci', 'cuenta', 'devolucion', 'banco'],
  },
  {
    id: 'faq-establecimiento-valido',
    pregunta: '¿Cómo sé si un establecimiento es válido para gasto deducible?',
    respuesta:
      'Usa "Validar Establecimientos" en la app. Busca el RUC o nombre del hotel/restaurante. Si aparece como "Validado", su comprobante sirve para deducir gasto. Si no aparece, igual puedes registrar el gasto pero el asistente te avisará que verifiques.',
    modulo: 'gastos',
    tags: ['establecimiento', 'validar', 'hotel', 'restaurante', 'comprobante'],
  },
  {
    id: 'faq-buzon-electronico',
    pregunta: '¿Qué es el Buzón Electrónico?',
    respuesta:
      'Es donde la SUNAT te envía notificaciones oficiales: requerimientos, resoluciones, avisos de fiscalización. En la app lo ves en "Buzón Electrónico" con badge de no leídos. Cada mensaje tiene botón para preguntarle al asistente qué significa.',
    modulo: 'buzon',
    tags: ['buzon', 'notificaciones', 'sunat', 'oficial'],
  },
  {
    id: 'faq-simulador-impuestos',
    pregunta: '¿Cómo funciona el simulador de impuestos?',
    respuesta:
      'Proyecta cuánto pagarás de impuesto este año basándose en tus recibos y gastos ya registrados. También puedes simular: "¿Cuánto me queda neto si emito un recibo de S/ X?" antes de emitirlo. Es cálculo 100% local, sin internet.',
    modulo: 'simulador',
    tags: ['simulador', 'proyeccion', 'impuesto', 'neto'],
  },
  {
    id: 'faq-exportar-contador',
    pregunta: '¿Cómo exporto reportes para mi contador?',
    respuesta:
      'En "Reportes e Historial" toca "Exportar para mi contador". Genera PDF (con expo-print) y Excel (con xlsx) 100% local. Incluye recibos emitidos, declaraciones, gastos deducibles y resumen anual.',
    modulo: 'reportes',
    tags: ['exportar', 'pdf', 'excel', 'contador', 'reporte'],
  },
  {
    id: 'faq-apartado-sugerido',
    pregunta: '¿Qué es el apartado sugerido?',
    respuesta:
      'En el resumen del RHE verás: "Te sugerimos apartar S/ X (Y%) para tus impuestos de este recibo". Es solo informativo, no mueve dinero real ni requiere cuenta bancaria. Te ayuda a planificar.',
    modulo: 'rhe',
    tags: ['apartado', 'sugerido', 'impuestos', 'planificar'],
  },
  {
    id: 'faq-hablar-contador',
    pregunta: '¿Cuándo debo hablar con un contador?',
    respuesta:
      'El asistente NUNCA reemplaza la validación oficial. Toda respuesta con montos incluye: "Es una explicación, no un cálculo oficial". Si el asistente detecta baja confianza o tú lo pides, verás el botón "Hablar con un contador" que abre WhatsApp o email prellenado con tu duda.',
    modulo: 'general',
    tags: ['contador', 'validacion', 'oficial', 'whatsapp', 'email'],
  },
  {
    id: 'faq-modo-local',
    pregunta: '¿Qué hace el modo "solo respuestas locales"?',
    respuesta:
      'Desactiva las llamadas a la API de IA y usa solo el diccionario local de preguntas frecuentes. Funciona SIN internet (pruébalo en modo avión). Es más rápido y privado, pero solo sabe lo que está en el diccionario.',
    modulo: 'asistente',
    tags: ['local', 'offline', 'privado', 'faq'],
  },
  {
    id: 'faq-voz-confirmar',
    pregunta: '¿Por qué no puedo confirmar por voz hasta que termine el resumen?',
    respuesta:
      'Es una regla de seguridad: el comando de voz "Confirmar" SOLO se habilita después de que el asistente termine de leer en voz alta el desglose completo (monto bruto, retención, neto). Así evitas confirmar sin escuchar. El botón táctil "Emitir Recibo" siempre está disponible.',
    modulo: 'asistente',
    tags: ['voz', 'confirmar', 'seguridad', 'tts', 'resumen'],
  },
  {
    id: 'faq-historial-borrar',
    pregunta: '¿Puedo borrar mi historial de conversaciones?',
    respuesta:
      'Sí, en "Historial del Asistente" puedes eliminar conversaciones individuales o todo el historial con una sola confirmación. Sin fricción extra. Es tu derecho borrarlo cuando quieras.',
    modulo: 'asistente',
    tags: ['historial', 'borrar', 'privacidad', 'conversaciones'],
  },
  {
    id: 'faq-limite-3uit',
    pregunta: '¿Qué es el límite de 3 UIT?',
    respuesta: 'Es el límite máximo de gastos adicionales (hasta 3 UIT, equivalente a S/ 15,450 en 2026) que puedes deducir para pagar menos Impuesto a la Renta anual por consumos en hoteles, restaurantes, bares y servicios profesionales.',
    modulo: 'gastos',
    tags: ['uit', 'limite', '3 uit', 'deducir', 'gastos']
  },
  {
    id: 'faq-como-pago-deuda',
    pregunta: '¿Cómo pago mi deuda?',
    respuesta: 'Puedes pagar tu deuda desde la sección "Deuda Tributaria" en la app seleccionando la deuda y tocando "Pagar ahora" (usando NPS o tarjeta de débito/crédito), o solicitar un fraccionamiento si deseas pagar en cuotas.',
    modulo: 'deuda',
    tags: ['deuda', 'pagar', 'pago', 'impuesto']
  },
  {
    id: 'faq-vencimiento-plazo-deuda',
    pregunta: '¿Qué pasa si vence el plazo?',
    respuesta: 'Si vence el plazo sin pagar, la deuda entra en estado vencido y acumula intereses moratorios diarios. SUNAT podría iniciar una cobranza coactiva, por lo que es recomendable pagar o solicitar fraccionamiento a tiempo.',
    modulo: 'deuda',
    tags: ['vence', 'plazo', 'vencido', 'intereses', 'multa']
  },
  {
    id: 'faq-fraccionamiento-deuda',
    pregunta: '¿Qué es el fraccionamiento?',
    respuesta: 'El fraccionamiento es un beneficio que te permite pagar tus deudas tributarias en cuotas mensuales (hasta en 72 meses según el monto). Puedes solicitarlo desde "Deuda Tributaria" tocando "Solicitar fraccionamiento".',
    modulo: 'deuda',
    tags: ['fraccionamiento', 'fraccionar', 'cuotas', 'deuda']
  }
]