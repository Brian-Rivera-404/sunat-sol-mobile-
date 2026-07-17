import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, setDarkMode, setHighContrast } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'

const MODULES = [
  { id: 'MisRecibos', labelKey: 'home_mis_recibos', icon: '\uD83D\uDCC4', bg: '#EEF2FF' },
  { id: 'Declarations', labelKey: 'home_declarar', icon: '\uD83D\uDCCA', bg: '#EEF2FF' },
  { id: 'MyRuc', labelKey: 'home_mi_ruc', icon: '\uD83C\uF3DB\uFE0F', bg: '#EEF2FF' },
  { id: 'DeductibleExpenses', labelKey: 'expenses_title', icon: '\uD83E\uDDFE', bg: '#FFF7ED' },
  { id: 'AnnualTax', labelKey: 'annual_tax_title', icon: '\uD83D\uDCCA', bg: '#F0FDF4' },
  { id: 'Beneficios', labelKey: 'home_beneficios', icon: '\uD83C\uDF81', bg: '#F5F3FF' },
]

const BOTTOM_CARDS = [
  { id: 'Reportes', labelKey: 'home_reportes', icon: '\uD83D\uDCC8', subKey: 'home_reportes_sub', accent: '#1B4FBF' },
  { id: 'Inbox', labelKey: 'inbox_title', icon: '\uD83D\uDCEB', subKey: 'inbox_subtitle', accent: '#E85E1E' },
  { id: 'TaxCalendar', labelKey: 'calendar_title', icon: '\uD83D\uDCC5', subKey: 'calendar_subtitle', accent: '#D97706' },
]

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t, switchLang, nextLangLabel } = useTranslate()

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
            <Text className="text-3xl font-extrabold tracking-tight" style={{ color: '#F4C430' }}>{fmt(totalIngresos)}</Text>
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
                <Text className="text-sm font-bold" style={{ color: '#F4C430' }}>{fmt(totalNeto)}</Text>
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

        {/* Module grid */}
        <View className="px-5 pt-3">
          <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{t('home_servicios')}</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {MODULES.map((m) => (
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
