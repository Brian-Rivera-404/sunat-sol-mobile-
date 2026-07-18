import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, formatearFecha } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

const CAL_PROTO = [
  { ruc: '0', date: '14 jul', status: 'vencido' as const },
  { ruc: '1', date: '15 jul', status: 'vencido' as const },
  { ruc: '2', date: '16 jul', status: 'vencido' as const },
  { ruc: '3\u20134', date: '17 jul', status: 'hoy' as const },
  { ruc: '5\u20136', date: '18 jul', status: 'pr\u00F3ximo' as const },
  { ruc: '7\u20138\u20139', date: '21 jul', status: 'pr\u00F3ximo' as const },
]

const CAL_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  vencido: { color: '#DC2626', bg: '#FEE2E2' },
  hoy: { color: '#E85E1E', bg: '#FFF7ED' },
  pr\u00F3ximo: { color: '#1B4FBF', bg: '#DBEAFE' },
}

function CalPill({ status }: { status: string }) {
  const s = CAL_STATUS_STYLE[status] ?? { color: C.s500, bg: C.s100 }
  return (
    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: s.bg }}>
      <Text className="text-xs font-bold" style={{ color: s.color }}>{status}</Text>
    </View>
  )
}

const DEADLINES = [
  { mes: 'Enero', dia: 12, label: 'calendar_onthly_declaration' },
  { mes: 'Febrero', dia: 12, label: 'calendar_onthly_declaration' },
  { mes: 'Marzo', dia: 12, label: 'calendar_annual_declaration' },
  { mes: 'Abril', dia: 14, label: 'calendar_onthly_declaration' },
  { mes: 'Mayo', dia: 12, label: 'calendar_onthly_declaration' },
  { mes: 'Junio', dia: 12, label: 'calendar_onthly_declaration' },
  { mes: 'Julio', dia: 12, label: 'calendar_onthly_declaration' },
  { mes: 'Agosto', dia: 14, label: 'calendar_onthly_declaration' },
  { mes: 'Setiembre', dia: 12, label: 'calendar_onthly_declaration' },
  { mes: 'Octubre', dia: 14, label: 'calendar_onthly_declaration' },
  { mes: 'Noviembre', dia: 12, label: 'calendar_onthly_declaration' },
  { mes: 'Diciembre', dia: 12, label: 'calendar_onthly_declaration' },
]

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'TaxCalendar'>

export default function TaxCalendarScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()

  const ruc = state.user?.dni || '10734521890'
  const lastDigit = parseInt(ruc.slice(-1), 10)
  const currentMonth = new Date().getMonth()

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('calendar_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm" accessibilityLabel={`${t('calendar_ruc_digit')}: ${lastDigit}`}>
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">{'\uD83D\uDCC5'}</Text>
            <View>
              <Text className="text-sm text-gray-400 dark:text-gray-400">{t('calendar_ruc_digit')}</Text>
              <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">{lastDigit}</Text>
            </View>
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-400 leading-4">{t('calendar_ruc_explain')}</Text>
        </View>

        {/* RUC-digit calendar view – prototype parity */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm" accessibilityLabel={t('calendar_ruc_table')}>
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('calendar_ruc_table')}</Text>
          {CAL_PROTO.map((item, i) => (
            <View key={i} className="flex-row items-center justify-between py-2.5" style={{ borderBottomWidth: i < CAL_PROTO.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
                  <Text className="text-xs font-bold" style={{ color: C.navy }}>{item.ruc}</Text>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('calendar_ruc_digit_title')} {item.ruc}</Text>
                  <Text className="text-xs text-gray-400">{item.date}</Text>
                </View>
              </View>
              <CalPill status={item.status} />
            </View>
          ))}
        </View>

        <View className="mb-2.5">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 mt-2" accessibilityRole="header">{t('calendar_upcoming')}</Text>
          {DEADLINES.map((dl, i) => {
            const isPast = i < currentMonth
            const isCurrent = i === currentMonth
            return (
              <View
                key={i}
                className={`bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 flex-row items-center shadow-sm ${isCurrent ? 'border-2 border-[#0A2240] dark:border-blue-400' : ''} ${isPast ? 'opacity-50' : ''}`}
                accessibilityLabel={`${dl.mes} ${dl.dia}: ${t(dl.label)}`}
              >
                <View className={`w-10 h-10 rounded-full ${isCurrent ? 'bg-[#0A2240]' : isPast ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'} items-center justify-center mr-3`}>
                  <Text className={`text-sm font-bold ${isCurrent ? 'text-white' : isPast ? 'text-gray-400' : 'text-[#0A2240] dark:text-blue-300'}`}>{dl.dia}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-semibold ${isPast ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>{dl.mes}</Text>
                  <Text className={`text-xs ${isPast ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-400'}`}>{t(dl.label)}</Text>
                </View>
                {isCurrent && <Text className="text-[#0A2240] dark:text-blue-400 text-xs font-semibold">{t('calendar_current')}</Text>}
              </View>
            )
          })}
        </View>

        {/* Próximas obligaciones — prototype parity */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('calendar_upcoming_obligations')}</Text>
          {[
            { label: t('calendar_obligation_jul'), date: t('calendar_obligation_jul_date') },
            { label: t('calendar_obligation_annual'), date: t('calendar_obligation_annual_date') },
          ].map((e, i) => (
            <View key={i} className="flex-row justify-between items-center py-2" style={{ borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
              <View>
                <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{e.label}</Text>
                <Text className="text-xs" style={{ color: '#94A3B8' }}>{e.date}</Text>
              </View>
              <CalPill status="próximo" />
            </View>
          ))}
        </View>

        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-[18px] p-4 flex-row items-center justify-between mb-10 shadow-sm"
          onPress={() => { vibrateLight() }}
          accessibilityLabel={t('calendar_set_reminder')}
          accessibilityRole="button"
          accessibilityHint={t('calendar_set_reminder_hint')}
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{'\uD83D\uDD14'}</Text>
            <View>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">{t('calendar_set_reminder')}</Text>
              <Text className="text-gray-400 dark:text-gray-400 text-xs">{t('calendar_reminder_desc')}</Text>
            </View>
          </View>
          <Text className="text-gray-400 dark:text-gray-400 text-lg">{'\u203A'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}