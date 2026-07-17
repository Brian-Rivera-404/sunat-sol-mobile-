import React, { useState, useEffect } from 'react'
import {
  View, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, setBiometric, setDarkMode, setPinHash, setPinAttempts, setPinLockedUntil, setCCI } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateError, vibrateSuccess, vibrateSelection } from '../utils/haptics'
import { hashPin, verifyPin, getLockoutDuration } from '../utils/pin'
import { secureDeletePinHash } from '../services/secureStorage'

type Mode = 'login' | 'pin_verify' | 'pin_setup'

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t, switchLang, currentLangLabel, nextLangLabel } = useTranslate()
  const [dniRuc, setDniRuc] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [pinInput, setPinInput] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [lockoutRemaining, setLockoutRemaining] = useState(0)

  const hasPin = state.pinHash !== null

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

  useEffect(() => {
    if (!state.pinLockedUntil) return
    const check = setInterval(() => {
      const remaining = new Date(state.pinLockedUntil!).getTime() - Date.now()
      if (remaining <= 0) {
        dispatch(setPinLockedUntil(null))
        dispatch(setPinAttempts(0))
        setLockoutRemaining(0)
        clearInterval(check)
      } else {
        setLockoutRemaining(remaining)
      }
    }, 1000)
    return () => clearInterval(check)
  }, [state.pinLockedUntil])

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
    if (hasPin) {
      setMode('pin_verify')
      setPinInput('')
    } else {
      setMode('pin_setup')
      setPinInput('')
      setPinConfirm('')
    }
  }

  const handlePinSetup = async () => {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setError(t('pin_setup_error'))
      vibrateError()
      return
    }
    if (pinInput !== pinConfirm) {
      setError(t('pin_setup_confirm_error'))
      vibrateError()
      return
    }
    setError('')
    const h = await hashPin(pinInput)
    dispatch(setPinHash(h))
    vibrateSuccess()
    dispatch(go('Home'))
  }

  const handlePinVerify = async () => {
    if (state.pinLockedUntil) {
      setError(t('pin_locked'))
      vibrateError()
      return
    }
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setError(t('pin_setup_error'))
      vibrateError()
      return
    }
    const ok = await verifyPin(pinInput, state.pinHash!)
    if (ok) {
      dispatch(setPinAttempts(0))
      setError('')
      vibrateSuccess()
      dispatch(go('Home'))
    } else {
      const newAttempts = state.pinAttempts + 1
      dispatch(setPinAttempts(newAttempts))
      if (newAttempts >= 5) {
        const duration = getLockoutDuration(newAttempts)
        const until = new Date(Date.now() + duration).toISOString()
        dispatch(setPinLockedUntil(until))
        setError(t('pin_locked'))
      } else {
        setError(t('pin_verify_error'))
      }
      vibrateError()
      setPinInput('')
    }
  }

  const handleBackToLogin = () => {
    setMode('login')
    setError('')
    setPinInput('')
    setPinConfirm('')
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

  const renderPinSetup = () => (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2" accessibilityRole="header">{t('pin_setup_title')}</Text>
      <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">{t('pin_setup_desc')}</Text>
      {error ? (
        <Text className="text-red-600 text-sm mb-4 text-center" accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text>
      ) : null}
      <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('pin_setup_enter')}</Text>
      <TextInput
        className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 text-center tracking-widest mb-4"
        placeholder="\u25CF \u25CF \u25CF \u25CF"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        value={pinInput}
        onChangeText={(t) => { setPinInput(t.replace(/\D/g, '')); setError('') }}
        accessibilityLabel={t('pin_setup_enter')}
        accessibilityRole="none"
      />
      <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('pin_setup_confirm')}</Text>
      <TextInput
        className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 text-center tracking-widest mb-6"
        placeholder="\u25CF \u25CF \u25CF \u25CF"
        placeholderTextColor="#9ca3af"
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        value={pinConfirm}
        onChangeText={(t) => { setPinConfirm(t.replace(/\D/g, '')); setError('') }}
        accessibilityLabel={t('pin_setup_confirm')}
        accessibilityRole="none"
      />
      <TouchableOpacity
        className="bg-[#002f5d] rounded-lg py-3.5 items-center mb-3"
        onPress={handlePinSetup}
        accessibilityLabel={t('pin_setup_save')}
        accessibilityRole="button"
      >
        <Text className="text-white font-bold text-base">{t('pin_setup_save')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { dispatch(setPinHash(null)); dispatch(setCCI(null)); handleBackToLogin() }}>
        <Text className="text-center text-gray-500 dark:text-gray-400 text-sm underline">{t('pin_setup_skip')}</Text>
      </TouchableOpacity>
    </View>
  )

  const renderPinVerify = () => {
    const locked = state.pinLockedUntil !== null
    return (
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2" accessibilityRole="header">{t('pin_verify_title')}</Text>
        {error ? (
          <Text className="text-red-600 text-sm mb-4 text-center" accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text>
        ) : null}
        {locked && lockoutRemaining > 0 ? (
          <Text className="text-orange-600 text-sm mb-4 text-center" accessibilityRole="alert" accessibilityLiveRegion="assertive">
            {t('pin_locked_remaining').replace('{time}', `${Math.ceil(lockoutRemaining / 60000)}`)}
          </Text>
        ) : null}
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 text-center tracking-widest mb-6"
          placeholder="\u25CF \u25CF \u25CF \u25CF"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          value={pinInput}
          onChangeText={(t) => { setPinInput(t.replace(/\D/g, '')); setError('') }}
          editable={!locked}
          accessibilityLabel={t('pin_verify_title')}
          accessibilityRole="none"
        />
        <TouchableOpacity
          className="bg-[#002f5d] rounded-lg py-3.5 items-center mb-3"
          onPress={handlePinVerify}
          disabled={locked}
          accessibilityLabel={t('pin_verify_enter')}
          accessibilityRole="button"
        >
          <Text className="text-white font-bold text-base">{t('pin_verify_enter')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBackToLogin}>
          <Text className="text-center text-gray-500 dark:text-gray-400 text-sm underline">{t('general_volver')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderLogin = () => (
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
  )

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

        {mode === 'pin_setup' ? renderPinSetup() : mode === 'pin_verify' ? renderPinVerify() : renderLogin()}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
