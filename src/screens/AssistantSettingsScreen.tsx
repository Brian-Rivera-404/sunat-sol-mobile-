import React from 'react'
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, setAssistantSettings, setBiometric } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import * as LocalAuthentication from 'expo-local-authentication'
import HeaderBar from '../components/HeaderBar'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

const MODALIDADES = [
  { key: 'text_only' as const, icon: '\uD83D\uDCDD' },
  { key: 'text_voice' as const, icon: '\uD83C\uDFA4' },
  { key: 'hands_free' as const, icon: '\uD83D\uDC46' },
]

const VELOCIDADES = [
  { key: 'slow' as const, icon: '\uD83D\uDC22' },
  { key: 'normal' as const, icon: '\u27A1\uFE0F' },
  { key: 'fast' as const, icon: '\uD83D\uDC23' },
]

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'AssistantSettings'>

export default function AssistantSettingsScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t, switchLang, nextLangLabel } = useTranslate()
  const settings = state.assistantSettings

  const setModality = (modality: typeof settings.modality) => {
    dispatch(setAssistantSettings({ modality }))
    vibrateLight()
  }

  const setSpeed = (ttsSpeed: typeof settings.ttsSpeed) => {
    dispatch(setAssistantSettings({ ttsSpeed }))
    vibrateLight()
  }

  const toggleLocal = () => {
    dispatch(setAssistantSettings({ useLocalOnly: !settings.useLocalOnly }))
    vibrateSuccess()
  }

  const toggleBiometric = async () => {
    vibrateLight()
    if (!state.biometricEnabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      if (!hasHardware || !isEnrolled) {
        Alert.alert(t('biometric_not_available') || 'Biometría no disponible')
        return
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric_login') || 'Acceso con huella',
      })
      if (result.success) {
        dispatch(setBiometric(true))
        vibrateSuccess()
      }
    } else {
      dispatch(setBiometric(false))
      vibrateSuccess()
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('assistant_settings_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
          <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('assistant_settings_modality')}</Text>
          <View className="flex-row justify-between">
            {MODALIDADES.map((m) => (
              <TouchableOpacity
                key={m.key}
                className={`flex-1 items-center py-3 mx-1 rounded-xl ${settings.modality === m.key ? 'bg-[#1B4FBF]' : 'bg-gray-100 dark:bg-gray-700'}`}
                onPress={() => setModality(m.key)}
                accessibilityLabel={`${t('assistant_settings_modality_' + m.key)}${settings.modality === m.key ? ', ' + t('general_selected') : ''}`}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.modality === m.key }}
              >
                <Text className={`text-2xl mb-2`}>{m.icon}</Text>
                <Text className={`text-xs font-semibold ${settings.modality === m.key ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('assistant_settings_modality_' + m.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('assistant_settings_tts_speed')}</Text>
          <View className="flex-row justify-between">
            {VELOCIDADES.map((v) => (
              <TouchableOpacity
                key={v.key}
                className={`flex-1 items-center py-3 mx-1 rounded-xl ${settings.ttsSpeed === v.key ? 'bg-[#1B4FBF]' : 'bg-gray-100 dark:bg-gray-700'}`}
                onPress={() => setSpeed(v.key)}
                accessibilityLabel={`${t('assistant_settings_speed_' + v.key)}${settings.ttsSpeed === v.key ? ', ' + t('general_selected') : ''}`}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.ttsSpeed === v.key }}
              >
                <Text className={`text-2xl mb-2`}>{v.icon}</Text>
                <Text className={`text-xs font-semibold ${settings.ttsSpeed === v.key ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('assistant_settings_speed_' + v.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('assistant_settings_local')}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('assistant_settings_local_desc')}</Text>
            </View>
            <TouchableOpacity
              onPress={toggleLocal}
              className={`w-14 h-7 rounded-full px-0.5 justify-center ${settings.useLocalOnly ? 'bg-[#1B4FBF] items-end' : 'bg-gray-300 dark:bg-gray-600 items-start'}`}
              accessibilityLabel={`${t('assistant_settings_local')}: ${settings.useLocalOnly ? t('general_active') : t('general_inactive')}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: settings.useLocalOnly }}
            >
              <View className="w-6 h-6 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('biometric_setup')}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('biometric_login')}</Text>
            </View>
            <TouchableOpacity
              onPress={toggleBiometric}
              className={`w-14 h-7 rounded-full px-0.5 justify-center ${state.biometricEnabled ? 'bg-[#1B4FBF] items-end' : 'bg-gray-300 dark:bg-gray-600 items-start'}`}
              accessibilityLabel={`${t('biometric_setup')}: ${state.biometricEnabled ? t('general_active') : t('general_inactive')}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: state.biometricEnabled }}
            >
              <View className="w-6 h-6 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('lang_switch')}</Text>
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
            onPress={switchLang}
            accessibilityLabel={`${t('lang_switch_to')}: ${nextLangLabel}`}
            accessibilityRole="button"
          >
            <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold">{'\uD83C\uDF10'} {nextLangLabel}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-[18px] p-4 flex-row items-center justify-between shadow-sm mb-3"
          onPress={() => { vibrateLight(); dispatch(go('AssistantHistory')) }}
          accessibilityLabel={t('assistant_history_title')}
          accessibilityRole="button"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{'\uD83D\uDCCB'}</Text>
            <View>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">{t('assistant_history_title')}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">{state.conversations.length} {t('assistant_history_convs')}</Text>
            </View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-lg">{'\u203A'}</Text>
        </TouchableOpacity>
        <View className="h-12" />
      </View>
    </ScrollView>
  )
}