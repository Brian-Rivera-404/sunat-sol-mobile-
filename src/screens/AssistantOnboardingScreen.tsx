import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, setOnboardingSeen } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const TARJETAS = [
  { icon: '\uD83C\uDFA4', key: 'voice' },
  { icon: '\uD83D\uDCDD', key: 'text' },
  { icon: '\uD83D\uDCA1', key: 'explain' },
]

export default function AssistantOnboardingScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [noVolver, setNoVolver] = useState(false)

  const handleEntendido = () => {
    if (noVolver) {
      dispatch(setOnboardingSeen(true))
    }
    vibrateLight()
    navigation.goBack()
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <Text className="text-white text-lg font-bold flex-1 text-center" accessibilityRole="header">{t('assistant_onboarding_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-8">
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">{t('assistant_welcome')}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">{t('assistant_welcome_desc')}</Text>

        {TARJETAS.map((tjr) => (
          <View key={tjr.key} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4 flex-row items-center" accessibilityLabel={t('assistant_onboarding_' + tjr.key)}>
            <View className="w-12 h-12 rounded-full bg-[#002f5d] dark:bg-blue-700 items-center justify-center mr-4">
              <Text className="text-2xl">{tjr.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('assistant_onboarding_' + tjr.key + '_title')}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('assistant_onboarding_' + tjr.key + '_desc')}</Text>
            </View>
          </View>
        ))}

        <View className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3 mb-6" accessibilityRole="alert">
          <Text className="text-blue-700 dark:text-blue-300 text-xs leading-5">{'\uD83D\uDD12'} {t('assistant_privacy_notice')}</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center mb-4 py-2"
          onPress={() => setNoVolver(!noVolver)}
          accessibilityLabel={`${t('assistant_dont_show')}: ${noVolver ? t('general_active') : t('general_inactive')}`}
          accessibilityRole="switch"
          accessibilityState={{ checked: noVolver }}
        >
          <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${noVolver ? 'bg-[#002f5d] border-[#002f5d]' : 'border-gray-400'}`}>
            {noVolver && <Text className="text-white text-xs font-bold">{'\u2713'}</Text>}
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">{t('assistant_dont_show')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#002f5d] rounded-lg py-4 items-center mb-10"
          onPress={handleEntendido}
          accessibilityLabel={t('assistant_got_it')}
          accessibilityRole="button"
          accessibilityHint={t('assistant_got_it_hint')}
        >
          <Text className="text-white font-bold text-base">{t('assistant_got_it')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}