import React, { useState, useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const UIT = 5150
const TASA_IMPUESTO = 0.08
const REFERENCIA_MERCADO = 0.12

export default function TaxSimulatorScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [simMonto, setSimMonto] = useState('')
  const [simRetencion, setSimRetencion] = useState(true)

  const emitidos = useMemo(() => (state.recibos ?? []).filter((r) => r.estado === 'emitido'), [state.recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const totalGastos = useMemo(() => (state.expenses ?? []).reduce((s, e) => s + e.monto, 0), [state.expenses])
  const totalRetenciones = useMemo(() => emitidos.reduce((s, r) => s + r.retencion, 0), [emitidos])

  const mesesTranscurridos = useMemo(() => {
    const now = new Date()
    return now.getMonth() + 1
  }, [])

  const promedioMensual = useMemo(() => {
    if (mesesTranscurridos === 0) return 0
    return totalIngresos / mesesTranscurridos
  }, [totalIngresos, mesesTranscurridos])

  const proyeccionAnual = promedioMensual * 12
  const rentaNetaProyectada = Math.max(0, proyeccionAnual - 7 * UIT - totalGastos)
  const impuestoProyectado = rentaNetaProyectada * TASA_IMPUESTO
  const impuestoRestante = Math.max(0, impuestoProyectado - totalRetenciones)

  const simMontoNum = parseFloat(simMonto) || 0
  const simRet = simRetencion ? simMontoNum * 0.08 : 0
  const simNeto = simMontoNum - simRet
  const simImpuestoAdicional = simMontoNum * TASA_IMPUESTO
  const referenciaEstimada = totalIngresos > 0 ? REFERENCIA_MERCADO : 0

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900" keyboardShouldPersistTaps="handled">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('simulator_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('simulator_projection')}</Text>
          <InfoRow label={t('simulator_promedio')} value={fmt(promedioMensual)} />
          <InfoRow label={t('simulator_projected_annual')} value={fmt(proyeccionAnual)} />
          <InfoRow label={t('simulator_expenses')} value={fmt(totalGastos)} />
          <InfoRow label={t('simulator_withholdings')} value={fmt(totalRetenciones)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-2" />
          <InfoRow label={t('simulator_estimated_tax')} value={fmt(impuestoProyectado)} />
          <InfoRow label={t('simulator_tax_to_pay')} value={fmt(impuestoRestante)} isBold />
        </View>

        {totalIngresos > 0 && (
          <View className="bg-amber-50 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3 mb-4" accessibilityRole="alert">
            <Text className="text-amber-800 dark:text-amber-200 text-xs leading-5">
              {'\u2139\uFE0F'} {t('simulator_market_ref')}: ~{Math.round(referenciaEstimada * 100)}% ({fmt(totalIngresos * referenciaEstimada)})
            </Text>
            <Text className="text-amber-700 dark:text-amber-300 text-xs mt-1">{t('simulator_not_official')}</Text>
          </View>
        )}

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('simulator_simulate')}</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('simulator_simulate_desc')}</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mr-2">S/</Text>
            <TextInput
              className="flex-1 text-base text-gray-900 dark:text-gray-100"
              value={simMonto}
              onChangeText={setSimMonto}
              keyboardType="decimal-pad"
              placeholder="0.00"
              accessibilityLabel={t('simulator_amount')}
              accessibilityHint={t('simulator_amount_hint')}
            />
          </View>
          <TouchableOpacity
            className={`self-start px-4 py-3.5 rounded-xl mb-3 ${simRetencion ? 'bg-[#002f5d]' : 'bg-gray-200 dark:bg-gray-700'}`}
            onPress={() => setSimRetencion(!simRetencion)}
            accessibilityLabel={t('simulator_withhold_toggle')}
            accessibilityRole="switch"
            accessibilityState={{ checked: simRetencion }}
          >
            <Text className={`text-sm font-semibold ${simRetencion ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              {simRetencion ? t('simulator_withhold_on') : t('simulator_withhold_off')}
            </Text>
          </TouchableOpacity>
          {simMontoNum > 0 && (
            <View className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <InfoRow label={t('simulator_bruto')} value={fmt(simMontoNum)} />
              <InfoRow label={t('simulator_withhold')} value={`-${fmt(simRet)}`} />
              <InfoRow label={t('simulator_neto')} value={fmt(simNeto)} isBold />
              <InfoRow label={t('simulator_additional_tax')} value={fmt(simImpuestoAdicional)} />
              <InfoRow label={t('simulator_apartado')} value={fmt(simMontoNum * 0.08)} isBold />
            </View>
          )}
        </View>

        <View className="h-10" />
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <View className="flex-row justify-between items-center py-1.5" accessibilityLabel={`${label}: ${value}`}>
      <Text className={`text-sm text-gray-600 dark:text-gray-400 flex-1 ${isBold ? 'font-bold' : ''}`}>{label}</Text>
      <Text className={`text-sm text-gray-900 dark:text-gray-100 ${isBold ? 'font-bold' : ''}`}>{value}</Text>
    </View>
  )
}