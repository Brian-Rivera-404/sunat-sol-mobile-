import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, deleteConversation, clearConversations, addConversation } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'AssistantHistory'>

export default function AssistantHistoryScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()

  const grouped = useMemo(() => {
    const map: Record<string, typeof state.conversations> = {}
    ;(state.conversations ?? []).forEach((c) => {
      const date = c.fecha.split('T')[0]
      if (!map[date]) map[date] = []
      map[date].push(c)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [state.conversations])

  const handleClearAll = () => {
    Alert.alert(
      t('assistant_history_clear_title'),
      t('assistant_history_clear_body'),
      [
        { text: t('general_cancelar'), style: 'cancel' },
        {
          text: t('assistant_history_clear_confirm'),
          style: 'destructive',
          onPress: () => { dispatch(clearConversations()); vibrateLight() },
        },
      ]
    )
  }

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1" accessibilityRole="header">{t('assistant_history_title')}</Text>
        {state.conversations.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} className="py-2.5" accessibilityLabel={t('assistant_history_clear')} accessibilityRole="button">
            <Text className="text-red-300 text-sm font-semibold">{t('assistant_history_clear')}</Text>
          </TouchableOpacity>
        )}
      </HeaderBar>

      {state.conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">{'\uD83D\uDCAC'}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center">{t('assistant_history_empty')}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {grouped.map(([date, conversations]) => (
            <View key={date} className="mb-4">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{date}</Text>
              {conversations.map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm"
                  onPress={() => {
                    dispatch(addConversation(conv))
                    dispatch(go('AssistantChat'))
                    vibrateLight()
                  }}
                  accessibilityLabel={`${t('assistant_history_conv')}: ${conv.pregunta}. ${t('assistant_history_mode')}: ${conv.modo}`}
                  accessibilityRole="button"
                  accessibilityHint={t('assistant_history_tap_restore')}
                >
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex-1 mr-2" numberOfLines={2}>{conv.pregunta}</Text>
                    <TouchableOpacity
                      className="bg-red-50 dark:bg-red-900 px-2 py-1 rounded-lg"
                      onPress={() => {
                        dispatch(deleteConversation(conv.id))
                        vibrateLight()
                      }}
                      accessibilityLabel={`${t('general_delete')} ${conv.pregunta}`}
                      accessibilityRole="button"
                    >
                      <Text className="text-red-600 dark:text-red-400 text-xs font-semibold">{'\u2715'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1" numberOfLines={2}>{conv.respuesta}</Text>
                  <View className="flex-row items-center mt-2">
                    <View className={`px-2 py-0.5 rounded-full ${conv.modo === 'local' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Text className={`text-xs font-medium ${conv.modo === 'local' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {conv.modo === 'local' ? t('assistant_history_local') : t('assistant_history_remote')}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">{conv.moduloDeOrigen}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  )
}