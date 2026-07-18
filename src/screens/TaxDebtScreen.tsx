import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../components/AccessibleText'
import { useStore, go, goBack, fmt, formatearFecha, payDebt, solicitarFraccionamiento, toastMsg } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { FadeInView, PressableScale } from '../components/AnimatedHelpers'
import { C, SHADOWS } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import FilterTabs from '../components/FilterTabs'

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
    vibrateLight()
    const title = t('taxdebt_confirm_pay_title')
    const body = `${t('taxdebt_confirm_pay_body')} — ${fmt(monto)}`

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${body}`)) {
        dispatch(payDebt(id))
        vibrateSuccess()
        dispatch(toastMsg(t('taxdebt_pay_success') || 'Pago realizado con éxito'))
      }
    } else {
      Alert.alert(
        title,
        body,
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
  }

  const handleFraccionamiento = (debtId: string, deudaName: string, monto: number) => {
    vibrateLight()
    const title = t('fraccionamiento_solicitar')
    const body = `${t('fraccionamiento_confirmar') || '¿Desea solicitar el fraccionamiento de esta deuda?'} — ${deudaName} (${fmt(monto)})`

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${body}`)) {
        dispatch(solicitarFraccionamiento(debtId, {
          id: `FR-${Date.now()}`,
          tipo: 'Fraccionamiento de Deuda',
          descripcion: `${t('fraccionamiento_solicitar')} — ${deudaName}`,
          fechaPresentacion: new Date().toISOString().slice(0, 10),
          estado: 'en_revision',
        }))
        dispatch(toastMsg(t('fraccionamiento_exito') || 'Solicitud de fraccionamiento enviada'))
        vibrateSuccess()
      }
    } else {
      Alert.alert(
        title,
        body,
        [
          { text: t('general_cancelar'), style: 'cancel' },
          {
            text: t('fraccionamiento_solicitar'),
            onPress: () => {
              dispatch(solicitarFraccionamiento(debtId, {
                id: `FR-${Date.now()}`,
                tipo: 'Fraccionamiento de Deuda',
                descripcion: `${t('fraccionamiento_solicitar')} — ${deudaName}`,
                fechaPresentacion: new Date().toISOString().slice(0, 10),
                estado: 'en_revision',
              }))
              dispatch(toastMsg(t('fraccionamiento_exito') || 'Solicitud de fraccionamiento enviada'))
              vibrateSuccess()
            },
          },
        ],
      )
    }
  }

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(goBack())} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1" accessibilityRole="header">{t('taxdebt_title')}</Text>
      </HeaderBar>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {debts.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="checkmark-circle-outline" size={56} color={C.green} style={{ marginBottom: 16 }} />
            <Text className="text-gray-500 dark:text-gray-400 text-center">{t('taxdebt_empty')}</Text>
          </View>
        ) : (
          <>
            {/* Summary card */}
            <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3" style={SHADOWS.card}>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('taxdebt_total_debt')}</Text>
              <Text className="text-3xl font-extrabold" style={{ color: totalDeuda > 0 ? C.red : C.green }}>{fmt(totalDeuda)}</Text>
              <View className="flex-row gap-4 mt-4">
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
            <FilterTabs
              items={FILTERS}
              selectedKey={filter}
              onSelect={setFilter}
            />

            {/* Debt list */}
            {filtered.map((debt, idx) => {
              const s = DEBT_STATUS_STYLE[debt.estado] ?? { color: C.s500, bg: C.s100 }
              return (
                <FadeInView key={debt.id} delay={idx * 50}>
                <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3" style={SHADOWS.card}>
                  <View className="flex-row justify-between items-start mb-2.5">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{debt.tributo}</Text>
                      <Text className="text-xs text-gray-400 dark:text-gray-300 mt-1">{t('taxdebt_periodo')}: {debt.periodo}</Text>
                    </View>
                    <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg }}>
                      <Text className="text-xs font-bold" style={{ color: s.color }}>{t('taxdebt_' + debt.estado)}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                      <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t(DEBT_TYPE_LABEL[debt.tipo] ?? debt.tipo)}</Text>
                    </View>
                    <Text className="text-xs text-gray-400 dark:text-gray-300"><Ionicons name="calendar-outline" size={12} color={C.s400} /> {t('taxdebt_duedate')}: {formatearFecha(debt.fechaVencimiento)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Text 
                      numberOfLines={1} 
                      adjustsFontSizeToFit 
                      className="text-xl font-extrabold text-[#0A2240] dark:text-blue-300 flex-shrink-0 text-left min-w-[90px]" 
                      style={{ color: debt.estado === 'vencido' ? C.red : undefined }}
                    >
                      {fmt(debt.monto)}
                    </Text>
                    
                    <View className="flex-col gap-2 items-end flex-1 ml-3">
                      {debt.estado !== 'pagado' && debt.estado !== 'fraccionado' && (
                        <TouchableOpacity
                          className="px-4 py-2 rounded-xl justify-center items-center w-full max-w-[150px] min-h-[38px]" 
                          style={{ backgroundColor: C.blue }}
                          onPress={() => handlePay(debt.id, debt.monto)}
                          accessibilityLabel={t('taxdebt_pay_now')}
                          accessibilityRole="button"
                        >
                          <Text className="text-white font-bold text-xs text-center">{t('taxdebt_pay_now')}</Text>
                        </TouchableOpacity>
                      )}
                      
                      {debt.estado === 'vencido' && (
                        <TouchableOpacity
                          className="px-4 py-2 rounded-xl justify-center items-center w-full max-w-[150px] min-h-[38px]" 
                          style={{ backgroundColor: '#DBEAFE' }}
                          onPress={() => handleFraccionamiento(debt.id, debt.tributo, debt.monto)}
                          accessibilityLabel={t('fraccionamiento_solicitar')}
                          accessibilityRole="button"
                        >
                          <Text className="font-bold text-xs text-center" style={{ color: '#1B4FBF' }}>{t('fraccionamiento_solicitar')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                </FadeInView>
              )
            })}
            <View className="h-12" />
          </>
        )}
      </ScrollView>
    </View>
  )
}
