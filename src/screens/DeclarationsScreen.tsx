import React from 'react'
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, goBack, fmt, formatearFecha } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import { isValidDate, isFutureDate } from '../utils/validators'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pendiente: { color: '#D97706', bg: '#FEF3C7' },
  pagado: { color: '#16A34A', bg: '#DCFCE7' },
  vencido: { color: '#DC2626', bg: '#FEE2E2' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { color: C.s500, bg: C.s100 }
  return (
    <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg }}>
      <Text className="text-xs font-bold" style={{ color: s.color }}>{status}</Text>
    </View>
  )
}

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'Declarations'>

export default function DeclarationsScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()

  const sorted = [...state.declarations].sort((a, b) => b.fechaLimite.localeCompare(a.fechaLimite))

  const handleSetReminder = () => {
    const today = new Date().toISOString().split('T')[0]
    Alert.prompt
      ? Alert.prompt(
          t('declarations_reminder_title'),
          t('declarations_reminder_desc'),
          [
            { text: t('general_cancelar'), style: 'cancel' },
            {
              text: t('declarations_reminder_set'),
              onPress: (input?: string) => {
                const date = (input || '').trim()
                if (!isValidDate(date) || !isFutureDate(date)) {
                  Alert.alert(t('general_error'), t('declarations_reminder_invalid'))
                  return
                }
                Alert.alert(t('declarations_reminder_set'), t('declarations_reminder_success') + ' ' + date)
              },
            },
          ],
          'plain-text',
          today,
          'number-pad',
        )
      : Alert.alert(t('declarations_reminder_title'), t('declarations_reminder_platform'))
  }

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(goBack())} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold" accessibilityRole="header">{t('declarations_title')}</Text>
      </HeaderBar>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 dark:text-gray-400">{t('declarations_empty')}</Text>
          </View>
        ) : (
          <>
            {/* Warning banner – prototype parity */}
            {sorted.some((d) => d.estado === 'pendiente') && (
              <View className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-[16px] p-3.5 flex-row gap-2.5 mb-3" accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Text className="text-lg">{'\u26A0\uFE0F'}</Text>
                <Text className="text-xs leading-5 flex-1" style={{ color: '#92400E' }}>
                  <Text className="font-bold">{t('declarations_pending_banner')}</Text>
                  {' '}{t('declarations_pending_banner_desc')}
                </Text>
              </View>
            )}

            {sorted.map((dec) => (
              <View key={dec.id} className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">{dec.periodo}</Text>
                    <Text className="text-xs text-gray-400 mt-1">{t('declarations_subtitle')}</Text>
                  </View>
                  <StatusPill status={dec.estado} />
                </View>
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-xs text-gray-500">{t('declarations_base')}: {fmt(dec.monto || 0)}</Text>
                  <Text className="text-xl font-extrabold mt-1" style={{ color: C.navy }}>{fmt(dec.monto || 0)}</Text>
                </View>
                {dec.estado === 'pendiente' ? (
                  <TouchableOpacity
                    className="rounded-xl px-4 py-2.5" style={{ backgroundColor: C.blue }}
                      onPress={() => { vibrateLight(); dispatch(go('NuevoRecibo1')) }}
                      accessibilityLabel={t('declarations_declare_pay')}
                      accessibilityRole="button"
                    >
                      <Text className="text-white font-extrabold text-sm">{t('declarations_declare_pay')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="items-end">
                      <Text className="text-xs text-gray-400">{t('declarations_duedate')}</Text>
                      <Text className="text-xs font-bold" style={{ color: '#16A34A' }}>{formatearFecha(dec.fechaLimite)}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-[18px] p-4 flex-row items-center justify-between mb-4 shadow-sm"
          onPress={() => { vibrateLight(); handleSetReminder() }}
          accessibilityLabel={t('declarations_reminder_set')}
          accessibilityRole="button"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{'\uD83D\uDD14'}</Text>
            <View>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">{t('declarations_reminder_set')}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">{t('declarations_reminder_desc')}</Text>
            </View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-lg">{'\u203A'}</Text>
        </TouchableOpacity>
        <View className="h-6" />
      </ScrollView>
    </View>
  )
}
