import React from 'react'
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, formatearFecha } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import { isValidDate, isFutureDate } from '../utils/validators'
import HeaderBar from '../components/HeaderBar'

const ESTADO_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  pendiente: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-400', icon: '\u23F3' },
  pagado: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-400', icon: '\u2714\uFE0F' },
  vencido: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-400', icon: '\u274C' },
}

export default function DeclarationsScreen({ navigation }: { navigation: any }) {
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
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('declarations_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        {sorted.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 dark:text-gray-400">{t('declarations_empty')}</Text>
          </View>
        ) : (
          <View className="relative">
            <View className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            {sorted.map((dec, i) => {
              const colors = ESTADO_COLORS[dec.estado] || ESTADO_COLORS.pendiente
              return (
                <View key={dec.id} className="flex-row mb-6">
                  <View className="w-10 items-center z-10">
                    <View className={`w-8 h-8 rounded-full ${colors.bg} items-center justify-center`}>
                      <Text accessibilityElementsHidden>{colors.icon}</Text>
                    </View>
                  </View>
                  <View className="flex-1 ml-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm" accessibilityLabel={`${t('declarations_declaration')} ${dec.periodo}, ${t('declarations_status')}: ${t('declarations_' + dec.estado)}, ${t('declarations_duedate')}: ${formatearFecha(dec.fechaLimite)}${dec.monto ? ', ' + t('declarations_amount') + ': ' + fmt(dec.monto) : ''}`}>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{dec.periodo}</Text>
                      <View className={`px-2 py-0.5 rounded-full ${colors.bg}`}>
                        <Text className={`text-xs font-semibold ${colors.text}`}>{t('declarations_' + dec.estado)}</Text>
                      </View>
                    </View>
                    {dec.monto > 0 && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('declarations_amount')}: {fmt(dec.monto)}</Text>
                    )}
                    <Text className="text-xs text-gray-400 dark:text-gray-500">{t('declarations_duedate')}: {formatearFecha(dec.fechaLimite)}</Text>
                    {dec.estado === 'pendiente' && (
                      <TouchableOpacity
                        className="mt-3 bg-[#002f5d] rounded-lg py-2 items-center"
                        onPress={() => { vibrateLight(); dispatch(go('NuevoRecibo1')) }}
                        accessibilityLabel={t('declarations_declare')}
                        accessibilityRole="button"
                        accessibilityHint={t('declarations_declare_hint')}
                      >
                        <Text className="text-white font-semibold text-sm">{t('declarations_declare')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        )}
        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between mb-4 shadow-sm"
          onPress={() => { vibrateLight(); handleSetReminder() }}
          accessibilityLabel={t('declarations_reminder_set')}
          accessibilityRole="button"
          accessibilityHint={t('declarations_reminder_hint')}
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
      </View>
    </ScrollView>
  )
}