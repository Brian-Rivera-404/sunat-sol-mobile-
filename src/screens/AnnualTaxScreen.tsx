import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'

const RENTA_CHECK = [
  { id: 'ingresos', labelKey: 'annual_step_ingresos', done: true },
  { id: 'gastos', labelKey: 'annual_step_gastos', done: true },
  { id: 'liquidacion', labelKey: 'annual_step_liquidacion', done: false },
  { id: 'declaracion', labelKey: 'annual_step_declaracion', done: false },
  { id: 'devolucion', labelKey: 'annual_step_devolucion', done: false },
]

export default function AnnualTaxScreen() {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [acepto, setAcepto] = useState(false)

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
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <View className="flex-row justify-between items-center mb-3.5">
            <View>
              <Text className="text-xs text-gray-500 dark:text-gray-300">{t('annual_tax_campaign')}</Text>
              <Text className="text-lg font-extrabold text-[#0A2240] dark:text-blue-300">{pasosCompletados}/{RENTA_CHECK.length} {t('annual_tax_steps_completed')}</Text>
            </View>
            {/* Circular progress */}
            <View className="items-center justify-center" style={{ width: circleSize, height: circleSize }}>
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-sm font-extrabold text-[#1B4FBF] dark:text-blue-400">{Math.round(progress)}%</Text>
              </View>
              <svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
                <circle cx={circleSize/2} cy={circleSize/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
                <circle cx={circleSize/2} cy={circleSize/2} r={radius} fill="none" stroke="#1B4FBF" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${circleSize/2} ${circleSize/2})`} />
              </svg>
            </View>
          </View>
          <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: C.blue }} />
          </View>
        </View>

        {/* Checklist — prototype parity */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] shadow-sm mb-3 overflow-hidden">
          {RENTA_CHECK.map((item, i) => {
            const done = i < pasosCompletados
            return (
              <View key={item.id} className="flex-row items-center px-4" style={{ paddingVertical: 12, borderBottomWidth: i < RENTA_CHECK.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
                <View className="w-[30] h-[30] rounded-full items-center justify-center mr-3.5" style={{ backgroundColor: done ? '#DCFCE7' : '#F1F5F9', borderWidth: 2, borderColor: done ? '#16A34A' : '#CBD5E1' }}>
                  <Text className={`text-sm font-extrabold ${done ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{done ? '\u2713' : String(i + 1)}</Text>
                </View>
                <Text className={`text-sm flex-1 ${done ? 'text-gray-400 dark:text-gray-500 line-through font-medium' : 'text-gray-800 dark:text-gray-100 font-bold'}`}>{t(item.labelKey)}</Text>
                {!done && <Text className="text-lg text-gray-300 dark:text-gray-600">{'\u203A'}</Text>}
              </View>
            )
          })}
        </View>

        {/* Deadline info box */}
        <View className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-[16px] px-4 py-3 flex-row gap-2.5 mb-3" accessibilityRole="alert">
          <Text className="text-lg">{'\uD83D\uDCC5'}</Text>
          <Text className="text-xs leading-5 flex-1 text-blue-850 dark:text-blue-300"><Text className="font-bold">{t('annual_tax_deadline')}:</Text> {t('annual_tax_deadline_desc')}</Text>
        </View>

        {/* Summary */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('annual_tax_summary')}</Text>
          <InfoRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <InfoRow label={t('annual_tax_deductions')} value={fmt(deduccion7UIT + totalGastos)} />
          <InfoRow label={t('annual_tax_net_income')} value={fmt(rentaNeta)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-3" />
          <InfoRow label={t('annual_tax_estimated_tax')} value={fmt(impuestoEstimado)} />
          <InfoRow label={t('declarar_retenciones')} value={fmt(totalRetenciones)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-3" />
          <InfoRow label={t('annual_tax_balance')} value={fmt(saldoAPagar)} isBold />
        </View>

        {/* Presentar declaración */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('declarar_anual')}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-4">
            {t('declarar_info')}
          </Text>
          <View className="flex-row items-start mb-4">
            <Switch
              value={acepto}
              onValueChange={setAcepto}
              trackColor={{ false: '#d1d5db', true: '#002f5d' }}
              thumbColor={acepto ? '#fff' : '#f4f3f4'}
              accessibilityLabel={t('declarar_acepto')}
              accessibilityHint={t('declarar_acepto_hint')}
            />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-3 flex-1">
              {t('declarar_acepto_text')}
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${acepto ? 'bg-[#1B4FBF]' : 'bg-gray-300 dark:bg-gray-600'}`}
            onPress={() => {
              Alert.alert(
                t('declarar_confirmar_title'),
                t('declarar_confirmar_body'),
                [
                  { text: t('general_cancelar'), style: 'cancel' },
                  {
                    text: t('declarar_presentar'),
                    style: 'destructive',
                    onPress: () => { vibrateLight(); dispatch(go('DeclaracionExitosa')) },
                  },
                ],
                { cancelable: true },
              )
            }}
            disabled={!acepto}
            accessibilityLabel={acepto ? t('declarar_presentar') : t('declarar_presentar_disabled')}
            accessibilityRole="button"
            accessibilityState={{ disabled: !acepto }}
            accessibilityHint={acepto ? t('declarar_presentar_hint') : t('declarar_presentar_disabled_hint')}
          >
            <Text className={`font-bold text-base ${acepto ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('declarar_presentar')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <View className="flex-row justify-between items-center py-2.5 gap-2" accessibilityLabel={`${label}: ${value}`}>
      <Text className="text-sm text-gray-500 dark:text-gray-300 flex-1 mr-2">{label}</Text>
      <Text 
        numberOfLines={1} 
        adjustsFontSizeToFit 
        className={`text-xl font-extrabold flex-shrink-0 text-right min-w-[100px] ${isBold ? 'text-[#0A2240] dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'}`}
      >
        {value}
      </Text>
    </View>
  )
}