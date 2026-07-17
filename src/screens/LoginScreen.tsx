import React, { useState, useEffect } from 'react'
import {
  View, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, setBiometric, setDarkMode } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateError, vibrateSuccess, vibrateSelection } from '../utils/haptics'

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t, switchLang, currentLangLabel, nextLangLabel } = useTranslate()
  const [dniRuc, setDniRuc] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [biometricAvailable, setBiometricAvailable] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const LocalAuth = require('expo-local-authentication')
        const compatible = await LocalAuth.hasHardwareAsync()
        const enrolled = await LocalAuth.isEnrolledAsync()
        setBiometricAvailable(compatible && enrolled)
      } catch { setBiometricAvailable(false) }
    })()
  }, [])

  const handleLogin = () => {
    if (!dniRuc.trim() || !password.trim()) {
      setError(t('login_errors_required'))
      vibrateError()
      return
    }
    if (dniRuc.trim().length < 8) {
      setError(t('login_errors_dni_length'))
      vibrateError()
      return
    }
    if (password.trim().length < 4) {
      setError(t('login_errors_pass_length'))
      vibrateError()
      return
    }
    setError('')
    vibrateSuccess()
    dispatch(go('Home'))
  }

  const handleBiometric = async () => {
    try {
      const LocalAuth = require('expo-local-authentication')
      const result = await LocalAuth.authenticateAsync({
        promptMessage: t('biometric_login'),
        disableDeviceFallback: false,
      })
      if (result.success) {
        vibrateSuccess()
        dispatch(go('Home'))
      } else {
        vibrateError()
        setError(t('biometric_not_available'))
      }
    } catch {
      setError(t('biometric_not_available'))
      vibrateError()
    }
  }

  const handleDemo = () => {
    setDniRuc('10734521890')
    setPassword('demo1234')
    setError('')
    vibrateSelection()
  }

  const handleDarkToggle = () => {
    dispatch(setDarkMode(!state.darkMode))
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#002f5d]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-white mb-2" accessibilityRole="header">
            {t('app_name')}
          </Text>
          <Text className="text-lg text-blue-200">
            {t('app_subtitle')}
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          {error ? (
            <Text className="text-red-600 text-sm mb-4 text-center" accessibilityRole="alert" accessibilityLiveRegion="assertive" importantForAccessibility="yes">{error}</Text>
          ) : null}

          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {t('login_dni_ruc')}
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100"
            placeholder={t('login_dni_placeholder')}
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={dniRuc}
            onChangeText={(t) => { setDniRuc(t); setError('') }}
            accessibilityLabel={t('login_dni_ruc')}
            accessibilityRole="none"
            accessibilityHint={t('login_dni_hint')}
          />
          <Text className="text-xs text-blue-200 dark:text-blue-300 mb-4">{t('login_dni_example')}</Text>

          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {t('login_password')}
          </Text>
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
            <TextInput
              className="flex-1 px-4 py-3 text-base text-gray-900 dark:text-gray-100"
              placeholder={t('login_pass_placeholder')}
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => { setPassword(t); setError('') }}
              accessibilityLabel={t('login_password')}
              accessibilityRole="none"
              accessibilityHint={t('login_pass_hint')}
            />
            <TouchableOpacity
              className="px-3 py-3"
              onPress={() => setShowPassword((p) => !p)}
              accessibilityLabel={showPassword ? t('login_hide_pass') : t('login_show_pass')}
              accessibilityRole="button"
              accessibilityHint={showPassword ? 'Oculta la contraseña escrita' : 'Muestra la contraseña escrita'}
            >
              <Text className="text-lg">{showPassword ? '\uD83D\uDE48' : '\uD83D\uDC41\uFE0F'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-[#002f5d] rounded-lg py-3.5 items-center mb-4"
            onPress={handleLogin}
            accessibilityLabel={t('login_enter')}
            accessibilityRole="button"
            accessibilityHint="Presiona para ingresar al sistema"
          >
            <Text className="text-white font-bold text-base">{t('login_enter')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-2.5 mb-1"
            onPress={handleDemo}
            accessibilityLabel={t('login_demo')}
            accessibilityRole="button"
            accessibilityHint="Carga datos de ejemplo para probar el sistema"
          >
            <Text className="text-center text-[#002f5d] dark:text-blue-300 underline text-sm">
              {t('login_demo')}
            </Text>
          </TouchableOpacity>

          {biometricAvailable ? (
            <TouchableOpacity
              className="py-2.5 mb-1"
              onPress={handleBiometric}
              accessibilityLabel={t('biometric_login')}
              accessibilityRole="button"
              accessibilityHint="Usa tu huella digital o rostro para ingresar"
            >
              <Text className="text-center text-gray-600 dark:text-gray-400 text-sm">
                {'\uD83D\uDC46'} {t('biometric_login')}
              </Text>
            </TouchableOpacity>
          ) : null}

          <View className="flex-row justify-center items-center py-2">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('login_no_account')} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityLabel={t('login_register')}
              accessibilityRole="button"
              accessibilityHint="Abre el formulario de creación de cuenta"
            >
              <Text className="text-[#002f5d] dark:text-blue-300 font-semibold text-sm">{t('login_register')}</Text>
            </TouchableOpacity>
          </View>

          <View className="border-t border-gray-200 dark:border-gray-600 mt-4 pt-4">
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity
                className="flex-row items-center justify-center py-1"
                onPress={switchLang}
                accessibilityLabel={`${t('lang_switch')}: ${nextLangLabel}`}
                accessibilityRole="button"
              >
                <Text className="text-gray-500 text-xs mr-1">{'\uD83C\uDF10'}</Text>
                <Text className="text-gray-500 dark:text-gray-500 text-xs">{nextLangLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center justify-center py-1"
                onPress={handleDarkToggle}
                accessibilityLabel={state.darkMode ? t('dark_mode_off') : t('dark_mode_on')}
                accessibilityRole="button"
              >
                <Text className="text-gray-500 text-xs mr-1">{state.darkMode ? '\uD83C\uDF19' : '\u2600\uFE0F'}</Text>
                <Text className="text-gray-500 dark:text-gray-500 text-xs">{state.darkMode ? t('dark_mode_off') : t('dark_mode_on')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
