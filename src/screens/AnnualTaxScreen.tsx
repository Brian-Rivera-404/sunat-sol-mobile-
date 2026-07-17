import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const ANNUAL_STEPS = [
  { id: 'ingresos', icon: '\uD83D\uDCCB' },
  { id: 'deducciones', icon: '\uD83D\uDCB0' },
  { id: 'impuesto', icon: '\uD83D\uDCCA' },
  { id: 'pago', icon: '\u2705' },
]

export default function AnnualTaxScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()

  const emitidos = useMemo(() => (state.recibos ?? []).filter((r) => r.estado === 'emitido'), [state.recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const totalGastos = useMemo(() => (state.expenses ?? []).reduce((s, e) => s + e.monto, 0), [state.expenses])
  const totalRetenciones = useMemo(() => emitidos.reduce((s, r) => s + r.retencion, 0), [emitidos])

  const UIT = 5150
  const deduccion7UIT = 7 * UIT
  const rentaNeta = Math.max(0, totalIngresos - deduccion7UIT - totalGastos)
  const impuestoEstimado = rentaNeta * 0.08
  const saldoAPagar = Math.max(0, impuestoEstimado - totalRetenciones)

  const pasosCompletados = useMemo(() => {
    let count = 0
    if (totalIngresos > 0) count++
    if (totalGastos > 0 || emitidos.length > 0) count++
    if (impuestoEstimado > 0) count++
    if (emitidos.some((r) => r.estado === 'emitido')) count++
    return count
  }, [totalIngresos, totalGastos, emitidos, impuestoEstimado])

  const progress = Math.min((pasosCompletados / ANNUAL_STEPS.length) * 100, 100)

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('annual_tax_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-amber-50 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-[18px] px-4 py-3 mb-2.5" accessibilityRole="alert">
          <Text className="text-amber-800 dark:text-amber-200 text-sm font-semibold">{'\u26A0\uFE0F'} {t('annual_tax_deadline')}: {t('annual_tax_deadline_date')}</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">{t('annual_tax_progress')}</Text>
          <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" accessibilityLabel={`${t('annual_tax_progress')}: ${Math.round(progress)}%`}>
            <View className="h-full bg-[#0A2240] rounded-full" style={{ width: `${progress}%` }} />
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-400">{pasosCompletados}/{ANNUAL_STEPS.length} {t('annual_tax_steps_completed')}</Text>
        </View>

        <View className="mb-2.5">
          {ANNUAL_STEPS.map((step, i) => {
            const done = i < pasosCompletados
            return (
              <View key={step.id} className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm flex-row items-center">
                <View className={`w-10 h-10 rounded-full ${done ? 'bg-[#0A2240]' : 'bg-gray-200 dark:bg-gray-700'} items-center justify-center mr-3`}>
                  <Text className={done ? 'text-white' : 'text-gray-400'}>{step.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-semibold ${done ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{t('annual_tax_step_' + step.id)}</Text>
                </View>
                {done && <Text className="text-green-500">{'\u2713'}</Text>}
              </View>
            )
          })}
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('annual_tax_summary')}</Text>
          <InfoRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <InfoRow label={t('annual_tax_deductions')} value={fmt(deduccion7UIT + totalGastos)} />
          <InfoRow label={t('annual_tax_net_income')} value={fmt(rentaNeta)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-2" />
          <InfoRow label={t('annual_tax_estimated_tax')} value={fmt(impuestoEstimado)} />
          <InfoRow label={t('declarar_retenciones')} value={fmt(totalRetenciones)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-2" />
          <InfoRow label={t('annual_tax_balance')} value={fmt(saldoAPagar)} isBold />
        </View>

        <TouchableOpacity
          className="bg-[#0A2240] rounded-xl py-4 items-center mb-10"
          onPress={() => { vibrateLight(); dispatch(go('Declarar')) }}
          accessibilityLabel={t('annual_tax_go_declare')}
          accessibilityRole="button"
          accessibilityHint={t('annual_tax_go_declare_hint')}
        >
          <Text className="text-white font-bold text-base">{t('annual_tax_go_declare')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <View className="flex-row justify-between items-center py-1.5" accessibilityLabel={`${label}: ${value}`}>
      <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1">{label}</Text>
      <Text className={`text-xl font-extrabold ${isBold ? '' : ''}`} style={{ color: '#0A2240' }}>{value}</Text>
    </View>
  )
}