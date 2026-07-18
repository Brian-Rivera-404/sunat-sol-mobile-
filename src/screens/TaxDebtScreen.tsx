import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, formatearFecha, payDebt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

const DEBT_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pendiente: { color: C.amberDark, bg: C.amberBg },
  vencido: { color: C.redDark, bg: C.redBg },
  pagado: { color: C.greenDark, bg: C.greenBg },
  fraccionado: { color: C.blue, bg: C.blueBg },
}

const DEBT_TYPE_LABEL: Record<string, string> = {
  multa: 'taxdebt_type_fine',
  declaracion: 'taxdebt_type_declaration',
  liquidacion: 'taxdebt_type_liquidation',
}

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'TaxDebt'>

export default function TaxDebtScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [filter, setFilter] = useState<string | null>(null)

  const debts = state.taxDebts ?? []

  const totalDeuda = useMemo(() =>
    debts.filter((d) => d.estado !== 'pagado').reduce((s, d) => s + d.monto, 0),
    [debts]
  )

  const filtered = useMemo(() => {
    if (!filter) return debts
    return debts.filter((d) => d.estado === filter)
  }, [debts, filter])

  const FILTERS = [
    { key: null, label: t('general_all') },
    { key: 'pendiente', label: t('taxdebt_pending') },
    { key: 'vencido', label: t('taxdebt_overdue') },
    { key: 'pagado', label: t('taxdebt_paid') },
    { key: 'fraccionado', label: t('taxdebt_instalment') },
  ]

  const handlePay = (id: string, monto: number) => {
    Alert.alert(
      t('taxdebt_confirm_pay_title'),
      `${t('taxdebt_confirm_pay_body')} — ${fmt(monto)}`,
      [
        { text: t('general_cancelar'), style: 'cancel' },
        {
          text: t('taxdebt_pay_now'),
          style: 'destructive',
          onPress: () => { dispatch(payDebt(id)); vibrateSuccess() },
        },
      ],
    )
  }

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1" accessibilityRole="header">{t('taxdebt_title')}</Text>
      </HeaderBar>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {debts.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-5xl mb-4">{'\u2705'}</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">{t('taxdebt_empty')}</Text>
          </View>
        ) : (
          <>
            {/* Summary card */}
            <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('taxdebt_total_debt')}</Text>
              <Text className="text-3xl font-extrabold" style={{ color: totalDeuda > 0 ? C.red : C.green }}>{fmt(totalDeuda)}</Text>
              <View className="flex-row gap-4 mt-3">
                {['pendiente', 'vencido', 'fraccionado'].map((k) => {
                  const count = debts.filter((d) => d.estado === k).length
                  if (count === 0) return null
                  const s = DEBT_STATUS_STYLE[k]
                  return (
                    <View key={k} className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: s.color }} />
                      <Text className="text-xs text-gray-600 dark:text-gray-400">{count} {t('taxdebt_' + k)}</Text>
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 6 }}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key ?? 'all'}
                  className={`px-4 min-h-[48px] justify-center rounded-full ${filter === f.key ? 'bg-[#002f5d]' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'}`}
                  onPress={() => setFilter(f.key)}
                  accessibilityLabel={f.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === f.key }}
                >
                  <Text className={`text-xs font-semibold ${filter === f.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Debt list */}
            {filtered.map((debt) => {
              const s = DEBT_STATUS_STYLE[debt.estado] ?? { color: C.s500, bg: C.s100 }
              return (
                <View key={debt.id} className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{debt.tributo}</Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t('taxdebt_periodo')}: {debt.periodo}</Text>
                    </View>
                    <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg }}>
                      <Text className="text-xs font-bold" style={{ color: s.color }}>{t('taxdebt_' + debt.estado)}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3 mb-2">
                    <View className="bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                      <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t(DEBT_TYPE_LABEL[debt.tipo] ?? debt.tipo)}</Text>
                    </View>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">{'\uD83D\uDCC5'} {t('taxdebt_duedate')}: {formatearFecha(debt.fechaVencimiento)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Text className="text-xl font-extrabold" style={{ color: debt.estado === 'vencido' ? C.red : C.navy }}>{fmt(debt.monto)}</Text>
                    {debt.estado !== 'pagado' && (
                      <TouchableOpacity
                        className="px-4 rounded-xl min-h-[48px] justify-center" style={{ backgroundColor: C.blue }}
                        onPress={() => handlePay(debt.id, debt.monto)}
                        accessibilityLabel={t('taxdebt_pay_now')}
                        accessibilityRole="button"
                      >
                        <Text className="text-white font-bold text-xs">{t('taxdebt_pay_now')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            })}
            <View className="h-10" />
          </>
        )}
      </ScrollView>
    </View>
  )
}
