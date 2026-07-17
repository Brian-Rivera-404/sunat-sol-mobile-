import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const RENTA_CHECK = [
  { id: 'ingresos', labelKey: 'annual_step_ingresos', done: true },
  { id: 'gastos', labelKey: 'annual_step_gastos', done: true },
  { id: 'liquidacion', labelKey: 'annual_step_liquidacion', done: false },
  { id: 'declaracion', labelKey: 'annual_step_declaracion', done: false },
  { id: 'devolucion', labelKey: 'annual_step_devolucion', done: false },
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
    if (saldoAPagar === 0 && totalIngresos > 0) count++
    return count
  }, [totalIngresos, totalGastos, emitidos, impuestoEstimado, saldoAPagar])

  const progress = Math.min((pasosCompletados / RENTA_CHECK.length) * 100, 100)
  const screenWidth = Dimensions.get('window').width
  const circleSize = 56
  const strokeWidth = 4
  const radius = (circleSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('annual_tax_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        {/* Progress card with circle */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <View className="flex-row justify-between items-center mb-3.5">
            <View>
              <Text className="text-xs" style={{ color: '#64748B' }}>{t('annual_tax_campaign')}</Text>
              <Text className="text-lg font-extrabold" style={{ color: '#0A2240' }}>{pasosCompletados}/{RENTA_CHECK.length} {t('annual_tax_steps_completed')}</Text>
            </View>
            {/* Circular progress */}
            <View className="items-center justify-center" style={{ width: circleSize, height: circleSize }}>
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-sm font-extrabold" style={{ color: '#1B4FBF' }}>{Math.round(progress)}%</Text>
              </View>
              <svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
                <circle cx={circleSize/2} cy={circleSize/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
                <circle cx={circleSize/2} cy={circleSize/2} r={radius} fill="none" stroke="#1B4FBF" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${circleSize/2} ${circleSize/2})`} />
              </svg>
            </View>
          </View>
          <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: '#1B4FBF' }} />
          </View>
        </View>

        {/* Checklist — prototype parity */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] shadow-sm mb-2.5 overflow-hidden">
          {RENTA_CHECK.map((item, i) => {
            const done = i < pasosCompletados
            return (
              <View key={item.id} className="flex-row items-center px-4" style={{ paddingVertical: 12, borderBottomWidth: i < RENTA_CHECK.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
                <View className="w-[30] h-[30] rounded-full items-center justify-center mr-3.5" style={{ backgroundColor: done ? '#DCFCE7' : '#F1F5F9', borderWidth: 2, borderColor: done ? '#16A34A' : '#CBD5E1' }}>
                  <Text className="text-sm font-extrabold" style={{ color: done ? '#16A34A' : '#94A3B8' }}>{done ? '\u2713' : String(i + 1)}</Text>
                </View>
                <Text className="text-sm flex-1" style={{ color: done ? '#64748B' : '#1E293B', fontWeight: done ? '500' : '700', textDecorationLine: done ? 'line-through' : 'none' }}>{t(item.labelKey)}</Text>
                {!done && <Text className="text-lg" style={{ color: '#CBD5E1' }}>{'\u203A'}</Text>}
              </View>
            )
          })}
        </View>

        {/* Deadline info box */}
        <View className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-[16px] px-4 py-3 flex-row gap-2.5 mb-2.5" accessibilityRole="alert">
          <Text className="text-lg">{'\uD83D\uDCC5'}</Text>
          <Text className="text-xs leading-5 flex-1" style={{ color: '#1E40AF' }}><Text className="font-bold">{t('annual_tax_deadline')}:</Text> {t('annual_tax_deadline_desc')}</Text>
        </View>

        {/* Summary */}
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
      <Text className="text-sm" style={{ color: '#64748B' }}>{label}</Text>
      <Text className={`text-xl font-extrabold ${isBold ? '' : ''}`} style={{ color: '#0A2240' }}>{value}</Text>
    </View>
  )
}