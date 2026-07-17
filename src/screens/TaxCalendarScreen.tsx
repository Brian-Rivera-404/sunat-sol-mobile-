import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, formatearFecha } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

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

export default function TaxCalendarScreen({ navigation }: { navigation: any }) {
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
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm" accessibilityLabel={`${t('calendar_ruc_digit')}: ${lastDigit}`}>
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">{'\uD83D\uDCC5'}</Text>
            <View>
              <Text className="text-sm text-gray-400 dark:text-gray-400">{t('calendar_ruc_digit')}</Text>
              <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">{lastDigit}</Text>
            </View>
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-400 leading-4">{t('calendar_ruc_explain')}</Text>
        </View>

        <View className="mb-2.5">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('calendar_upcoming')}</Text>
          {DEADLINES.map((dl, i) => {
            const isPast = i < currentMonth
            const isCurrent = i === currentMonth
            return (
              <View
                key={i}
                className={`bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 flex-row items-center shadow-sm ${isCurrent ? 'border-2 border-[#0A2240] dark:border-blue-400' : ''} ${isPast ? 'opacity-50' : ''}`}
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