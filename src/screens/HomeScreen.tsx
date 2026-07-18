import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, ScrollView, Platform, AppState } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, setDarkMode, setHighContrast } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import * as LocalAuthentication from 'expo-local-authentication'

import { C } from '../styles/theme'

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>

const FREQUENT_MODULES = [
  { id: 'MisRecibos' as const, labelKey: 'home_mis_recibos', icon: '\uD83D\uDCC4', bg: '#EEF2FF' },
  { id: 'Declarations' as const, labelKey: 'home_declarar', icon: '\uD83D\uDCCA', bg: '#EEF2FF' },
  { id: 'DeductibleExpenses' as const, labelKey: 'expenses_title', icon: '\uD83D\uDCC3', bg: '#FFF7ED' },
  { id: 'TaxDebt' as const, labelKey: 'taxdebt_title', icon: '\uD83D\uDCB0', bg: '#FEF2F2' },
]

const SECONDARY_MODULES = [
  { id: 'MyRuc' as const, labelKey: 'home_mi_ruc', icon: '\uD83C\uF3DB\uFE0F', bg: '#EEF2FF' },
  { id: 'AnnualTax' as const, labelKey: 'annual_tax_title', icon: '\uD83D\uDCCB', bg: '#F0FDF4' },
  { id: 'Tramites' as const, labelKey: 'tramites_title', icon: '\uD83D\uDCDD', bg: '#F0F9FF' },
  { id: 'Orientacion' as const, labelKey: 'orientacion_title', icon: '\uD83D\uDCD6', bg: '#FFFBEB' },
  { id: 'Beneficios' as const, labelKey: 'home_beneficios', icon: '\uD83C\uDF81', bg: '#F5F3FF' },
]

const BOTTOM_CARDS = [
  { id: 'Reportes' as const, labelKey: 'home_reportes', icon: '\uD83D\uDCC8', subKey: 'home_reportes_sub', accent: '#1B4FBF' },
  { id: 'Inbox' as const, labelKey: 'inbox_title', icon: '\uD83D\uDCEB', subKey: 'inbox_subtitle', accent: '#E85E1E' },
  { id: 'TaxCalendar' as const, labelKey: 'calendar_title', icon: '\uD83D\uDCC5', subKey: 'calendar_subtitle', accent: '#D97706' },
]

export default function HomeScreen({ navigation }: { navigation: HomeNav }) {
  const { state, dispatch } = useStore()
  const { t, switchLang, nextLangLabel } = useTranslate()

  const [isLocked, setIsLocked] = useState(state.biometricEnabled)

  const unlockWithBiometrics = async () => {
    if (!state.biometricEnabled) {
      setIsLocked(false)
      return
    }
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric_login') || 'Acceso con huella',
        disableDeviceFallback: false,
      })
      if (result.success) {
        setIsLocked(false)
        vibrateLight()
      }
    } else {
      setIsLocked(false)
    }
  }

  useEffect(() => {
    if (state.biometricEnabled) {
      unlockWithBiometrics()
    }
  }, [state.biometricEnabled])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      if (nextAppState === 'active' && state.biometricEnabled) {
        setIsLocked(true)
        unlockWithBiometrics()
      }
    }
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [state.biometricEnabled])

  if (isLocked) {
    return (
      <View className="flex-1 bg-[#002f5d] items-center justify-center px-8">
        <View className="items-center mb-8">
          <Text className="text-white text-5xl font-bold mb-2">{t('app_name')}</Text>
          <Text className="text-blue-200 text-lg text-center">SOL Móvil Seguro</Text>
        </View>
        <TouchableOpacity
          onPress={unlockWithBiometrics}
          className="bg-white/10 dark:bg-white/5 border border-white/20 p-8 rounded-full mb-12 items-center justify-center shadow-lg"
          accessibilityLabel="Desbloquear con biometría"
          accessibilityRole="button"
        >
          <Text className="text-6xl text-white">🔒</Text>
        </TouchableOpacity>
        <Text className="text-white/80 text-center mb-8 text-sm px-4">
          Esta aplicación contiene información tributaria confidencial protegida por biometría.
        </Text>
        <TouchableOpacity
          onPress={unlockWithBiometrics}
          className="bg-white rounded-xl py-3.5 px-8 w-full items-center shadow-md"
          accessibilityLabel="Desbloquear ahora"
          accessibilityRole="button"
        >
          <Text className="text-[#002f5d] font-bold text-base">Desbloquear Aplicación</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const firstName = state.user?.nombre ?? 'Usuario'
  const initial = firstName.charAt(0).toUpperCase()

  const emitidos = (state.recibos ?? []).filter((r) => r.estado === 'emitido')
  const totalIngresos = emitidos.reduce((sum, r) => sum + r.montoBruto, 0)
  const totalRetenido = emitidos.reduce((sum, r) => sum + r.retencion, 0)
  const totalNeto = emitidos.reduce((sum, r) => sum + r.montoNeto, 0)
  const reciboCount = emitidos.length
  const unreadCount = (state.inbox ?? []).filter((m) => !m.leido).length

  const toggleDark = () => { dispatch(setDarkMode(!state.darkMode)); vibrateLight() }
  const toggleContrast = () => { dispatch(setHighContrast(!state.highContrast)); vibrateLight() }

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20">
        {/* Header */}
        <LinearGradient colors={['#0A2240', '#0D3060']} className="pt-14 pb-9 px-5 rounded-b-[28px]">
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-white/55 text-xs">{t('home_welcome')}</Text>
              <Text className="text-white font-extrabold text-lg">{firstName}</Text>
            </View>
            <View className="flex-row items-center gap-2.5">
              <TouchableOpacity
                className="bg-white/12 rounded-xl w-[38] h-[38] items-center justify-center"
                onPress={() => navigation.navigate('Inbox')}
                accessibilityLabel={t('inbox_title')}
                accessibilityRole="button"
              >
                <Text className="text-lg">{'\uD83D\uDD14'}</Text>
                {unreadCount > 0 && (
                  <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2" style={{ backgroundColor: '#E85E1E', borderColor: '#0A2240' }} />
                )}
              </TouchableOpacity>
              <View className="w-[38] h-[38] rounded-full items-center justify-center" style={{ backgroundColor: '#E85E1E' }}>
                <Text className="text-white font-extrabold text-base">{initial}</Text>
              </View>
            </View>
          </View>

          {/* Income card */}
          <View className="bg-white/9 rounded-[20px] p-[18px] border border-white/12">
            <Text className="text-white/55 text-xs mb-1">{t('home_ingresos_label')}</Text>
            <Text className="text-3xl font-extrabold tracking-tight" style={{ color: C.gold }}>{fmt(totalIngresos)}</Text>
            <Text className="text-white/40 text-xs mt-0.5">
              {reciboCount} recibo{reciboCount !== 1 ? 's' : ''} emitido{reciboCount !== 1 ? 's' : ''}
            </Text>
            <View className="h-[1] bg-white/10 my-3.5" />
            <View className="flex-row gap-5">
              <View>
                <Text className="text-white/45 text-xs">{t('home_retenido')}</Text>
                <Text className="text-white/90 text-sm font-bold">{fmt(totalRetenido)}</Text>
              </View>
              <View>
                <Text className="text-white/45 text-xs">{t('home_neto')}</Text>
                <Text className="text-sm font-bold" style={{ color: C.gold }}>{fmt(totalNeto)}</Text>
              </View>
              <View>
                <Text className="text-white/45 text-xs">{t('home_declarado')}</Text>
                <Text className="text-white/90 text-sm font-bold">{fmt(totalIngresos * 0.08)}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* CTA */}
        <View className="px-5 -mt-[22] mb-2">
          <TouchableOpacity
            onPress={() => { dispatch(go('NuevoRecibo1')); vibrateLight() }}
            accessibilityLabel={t('home_emitir')}
            accessibilityRole="button"
          >
            <LinearGradient colors={['#1B4FBF', '#2563EB']} className="rounded-[18px] py-[15] items-center flex-row justify-center shadow-lg">
              <Text className="text-white font-extrabold text-base">{'\u2795'} {t('home_emitir')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Operaciones Frecuentes (2x2 Grid) */}
        <View className="px-5 pt-3">
          <Text className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-3">
            {state.language === 'es' ? 'Operaciones Frecuentes' : 'Frequent Operations'}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {FREQUENT_MODULES.map((m) => {
              const hasPendingDebts = m.id === 'TaxDebt' && (state.taxDebts ?? []).some((d) => d.estado === 'pendiente' || d.estado === 'vencido')
              return (
                <TouchableOpacity
                  key={m.id}
                  className="bg-white dark:bg-gray-800 rounded-[18px] pt-4 pb-3 px-3 items-center w-[48%] shadow-sm relative"
                  onPress={() => { dispatch(go(m.id)); vibrateLight() }}
                  accessibilityLabel={t(m.labelKey)}
                  accessibilityRole="button"
                >
                  {hasPendingDebts && (
                    <View className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-600 border-2 border-white dark:border-gray-800 z-10" />
                  )}
                  <View className="w-12 h-12 rounded-[16] items-center justify-center mb-2" style={{ backgroundColor: m.bg }}>
                    <Text className="text-2xl">{m.icon}</Text>
                  </View>
                  <Text className="text-gray-800 dark:text-gray-200 font-bold text-xs text-center leading-tight">{t(m.labelKey)}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Consultas e Información (Secondary Grid) */}
        <View className="px-5 pt-5">
          <Text className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-3">
            {state.language === 'es' ? 'Consultas e Información' : 'Inquiries & Information'}
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {SECONDARY_MODULES.map((m) => (
              <TouchableOpacity
                key={m.id}
                className="bg-white dark:bg-gray-800 rounded-[18px] pt-[14] pb-[10] px-2 items-center w-[30%] flex-grow shadow-sm"
                onPress={() => { dispatch(go(m.id)); vibrateLight() }}
                accessibilityLabel={t(m.labelKey)}
                accessibilityRole="button"
              >
                <View className="w-11 h-11 rounded-[14] items-center justify-center mb-2" style={{ backgroundColor: m.bg }}>
                  <Text className="text-[22px]">{m.icon}</Text>
                </View>
                <Text className="text-gray-800 dark:text-gray-200 font-bold text-xs text-center leading-tight">{t(m.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom cards */}
        <View className="px-5 pt-4 pb-8">
          {BOTTOM_CARDS.map((c) => (
            <TouchableOpacity
              key={c.id}
              className="bg-white dark:bg-gray-800 rounded-[18px] p-[14] flex-row items-center mb-2.5 shadow-sm"
              onPress={() => { dispatch(go(c.id)); vibrateLight() }}
              accessibilityLabel={t(c.labelKey)}
              accessibilityRole="button"
            >
              <View className="w-[46] h-[46] rounded-[14] items-center justify-center mr-3.5 relative" style={{ backgroundColor: `${c.accent}18` }}>
                <Text className="text-[22px]">{c.icon}</Text>
                {c.id === 'Inbox' && unreadCount > 0 && (
                  <View className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: '#E85E1E' }} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 dark:text-gray-200 font-bold text-sm">{t(c.labelKey)}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{t(c.subKey)}</Text>
              </View>
              <Text className="text-gray-300 text-[22px]">{'\u203A'}</Text>
            </TouchableOpacity>
          ))}

          {/* Settings footer */}
          <View className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity
                className="flex-row items-center py-2 px-4"
                onPress={switchLang}
                accessibilityLabel={`${t('lang_switch')}: ${nextLangLabel}`}
                accessibilityRole="button"
              >
                <Text className="text-gray-500 text-sm mr-1">{'\uD83C\uDF10'}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">{nextLangLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-2 px-4"
                onPress={toggleDark}
                accessibilityLabel={state.darkMode ? t('dark_mode_off') : t('dark_mode_on')}
                accessibilityRole="button"
              >
                <Text className="text-gray-500 text-sm mr-1">{state.darkMode ? '\uD83C\uDF19' : '\u2600\uFE0F'}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">{state.darkMode ? t('dark_mode_off') : t('dark_mode_on')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-2 px-4"
                onPress={toggleContrast}
                accessibilityLabel={state.highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
                accessibilityRole="button"
              >
                <Text className="text-gray-500 text-sm mr-1">{state.highContrast ? '\uD83C\uDF0D' : '\uD83D\uDD0D'}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">{state.highContrast ? 'Alto contraste ON' : t('home_alto_contraste')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

    </View>
  )
}
