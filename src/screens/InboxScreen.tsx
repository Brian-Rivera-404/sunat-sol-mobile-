import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, formatearFecha, markInboxRead } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

function getBorderColor(modulo: string): string {
  switch (modulo) {
    case 'declaraciones': return '#F59E0B'
    case 'rhe': return '#10B981'
    default: return '#0A2240'
  }
}

function getBadgeBg(modulo: string): string {
  switch (modulo) {
    case 'declaraciones': return '#FEF3C7'
    case 'rhe': return '#D1FAE5'
    default: return '#EEF2FF'
  }
}

function getBadgeText(modulo: string): string {
  switch (modulo) {
    case 'declaraciones': return '#92400E'
    case 'rhe': return '#065F46'
    default: return '#0A2240'
  }
}

function ModuleTag({ modulo }: { modulo: string }) {
  const labelMap: Record<string, string> = {
    declaraciones: 'Declaraciones',
    rhe: 'RHE',
  }
  const label = labelMap[modulo] || modulo
  return (
    <View style={{ backgroundColor: getBadgeBg(modulo), borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ color: getBadgeText(modulo), fontSize: 10, fontWeight: '700' }}>{label}</Text>
    </View>
  )
}

export default function InboxScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()

  const unreadCount = useMemo(() => (state.inbox ?? []).filter((m) => !m.leido).length, [state.inbox])
  const sorted = useMemo(() => [...(state.inbox ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha)), [state.inbox])

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('inbox_title')}</Text>
        {unreadCount > 0 && (
          <View className="ml-2 bg-red-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">{unreadCount}</Text>
          </View>
        )}
      </HeaderBar>

      <View className="px-4 pt-6">
        {unreadCount > 0 && (
          <View className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-[18px] px-4 py-3 mb-2.5" accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text className="text-blue-700 dark:text-blue-300 text-sm font-semibold">{t('inbox_unread')}: {unreadCount}</Text>
          </View>
        )}

        {sorted.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Text className="text-5xl mb-4">{'\uD83D\uDCE5'}</Text>
            <Text className="text-gray-400 dark:text-gray-400">{t('inbox_empty')}</Text>
          </View>
        ) : (
          sorted.map((msg) => (
            <TouchableOpacity
              key={msg.id}
              className={`bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm ${!msg.leido ? 'border-l-4' : ''}`}
              style={!msg.leido ? { borderLeftColor: getBorderColor(msg.modulo) } : undefined}
              onPress={() => {
                if (!msg.leido) dispatch(markInboxRead(msg.id))
                dispatch(go('AssistantChat'))
                vibrateLight()
              }}
              accessibilityLabel={`${!msg.leido ? `${t('inbox_unread')}. ` : ''}${msg.titulo}: ${msg.cuerpo}, ${formatearFecha(msg.fecha)}. ${t('inbox_tap_ask')}`}
              accessibilityRole="button"
              accessibilityHint={t('inbox_tap_ask_hint')}
            >
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center mb-1">
                    {!msg.leido && <View className="w-2 h-2 rounded-full bg-[#0A2240] mr-2" />}
                    <Text className={`text-sm font-semibold flex-1 ${!msg.leido ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{msg.titulo}</Text>
                  </View>
                  <Text className={`text-xs mt-1 ${!msg.leido ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>{msg.cuerpo}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mb-1">{formatearFecha(msg.fecha)}</Text>
                  <ModuleTag modulo={msg.modulo} />
                </View>
              </View>
              {!msg.leido && (
                <View className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Text className="text-xs text-[#0A2240] dark:text-blue-400 font-semibold">{t('inbox_ask_assistant')} {'\u203A'}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        <View className="h-10" />
      </View>
    </ScrollView>
  )
}
