import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, setDarkMode, setHighContrast } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'

const SECTIONS = [
  {
    titleKey: 'home_section_taxes',
    items: [
      { labelKey: 'home_declarar', icon: '\uD83D\uDCCA', screen: 'Declarations' },
      { labelKey: 'annual_tax_title', icon: '\uD83C\uDFE6', screen: 'AnnualTax' },
      { labelKey: 'calendar_title', icon: '\uD83D\uDCC5', screen: 'TaxCalendar' },
      { labelKey: 'simulator_title', icon: '\uD83D\uDD0D', screen: 'TaxSimulator' },
    ],
  },
  {
    titleKey: 'home_section_activity',
    items: [
      { labelKey: 'home_mis_recibos', icon: '\uD83D\uDCC4', screen: 'MisRecibos' },
      { labelKey: 'expenses_title', icon: '\uD83D\uDCCB', screen: 'DeductibleExpenses' },
      { labelKey: 'home_reportes', icon: '\uD83D\uDCC8', screen: 'Reportes' },
    ],
  },
  {
    titleKey: 'home_section_account',
    items: [
      { labelKey: 'home_mi_ruc', icon: '\uD83C\uDFDB\uFE0F', screen: 'MyRuc' },
      { labelKey: 'inbox_title', icon: '\uD83D\uDCE5', screen: 'Inbox' },
      { labelKey: 'home_beneficios', icon: '\uD83C\uDF81', screen: 'Beneficios' },
    ],
  },
]

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t, switchLang, nextLangLabel } = useTranslate()

  const firstName = state.user?.nombre ?? 'Usuario'
  const initial = firstName.charAt(0).toUpperCase()

  const emitidos = (state.recibos ?? []).filter((r) => r.estado === 'emitido')
  const totalIngresos = emitidos.reduce((sum, r) => sum + r.montoBruto, 0)
  const reciboCount = emitidos.length
  const unreadCount = (state.inbox ?? []).filter((m) => !m.leido).length

  const toggleDark = () => { dispatch(setDarkMode(!state.darkMode)); vibrateLight() }
  const toggleContrast = () => { dispatch(setHighContrast(!state.highContrast)); vibrateLight() }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-[#002f5d] pt-12 pb-6 px-5">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
              <Text className="text-[#002f5d] font-bold text-lg">{initial}</Text>
            </View>
            <View>
              <Text className="text-blue-200 text-xs">{t('home_welcome')}</Text>
              <Text className="text-white font-bold text-lg">{t('home_welcome')}, {firstName}</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => dispatch(go('AssistantChat'))}
              className="mr-3"
              accessibilityLabel={t('assistant_title')}
              accessibilityRole="button"
              accessibilityHint={t('assistant_access_hint')}
            >
              <Text className="text-2xl">{'\uD83E\uDD16'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Inbox')}
              className="relative"
              accessibilityLabel={t('inbox_title')}
              accessibilityRole="button"
              accessibilityHint="Muestra tus notificaciones y alertas"
            >
              <Text className="text-2xl">{'\uD83D\uDD14'}</Text>
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white/20 rounded-xl p-4">
          <Text className="text-blue-200 text-sm">{t('home_ingresos_label')}</Text>
          <Text className="text-white font-bold text-3xl mt-1">{fmt(totalIngresos)}</Text>
          <Text className="text-blue-200 text-xs mt-1">
            {reciboCount} recibo{reciboCount !== 1 ? 's' : ''} emitido{reciboCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5">
        <TouchableOpacity
          className="bg-[#002f5d] rounded-xl py-4 flex-row items-center justify-center mb-6"
          onPress={() => { dispatch(go('NuevoRecibo1')); vibrateLight() }}
          accessibilityLabel={t('home_emitir')}
          accessibilityRole="button"
          accessibilityHint="Inicia el proceso de emisión de un recibo electrónico"
        >
          <Text className="text-2xl mr-2">{'\u2795'}</Text>
          <Text className="text-white font-bold text-base">{t('home_emitir')}</Text>
        </TouchableOpacity>

        {SECTIONS.map((section) => (
          <View key={section.titleKey} className="mb-4">
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t(section.titleKey)}</Text>
            <View className="flex-row flex-wrap justify-between">
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 w-[48%] mb-3 items-center shadow-sm"
                  onPress={() => { dispatch(go(item.screen)); vibrateLight() }}
                  accessibilityLabel={t(item.labelKey)}
                  accessibilityRole="button"
                  accessibilityHint={`Abre la sección de ${t(item.labelKey).toLowerCase()}`}
                >
                  <Text className="text-3xl mb-1">{item.icon}</Text>
                  <Text className="text-gray-800 dark:text-gray-200 font-semibold text-sm text-center">{t(item.labelKey)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-8">
          <View className="flex-row justify-center space-x-4 mb-2">
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
              <Text className="text-gray-500 text-sm mr-1">{state.highContrast ? '\u{1F30D}' : '\u{1F453}'}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">{state.highContrast ? 'Alto contraste ON' : 'Alto contraste'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}