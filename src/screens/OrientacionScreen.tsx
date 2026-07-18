import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import type { GuiaOrientacion } from '../types/shared'

const GUIAS: GuiaOrientacion[] = [
  { id: 'g1', titulo: 'orientacion_g1_title', contenido: 'orientacion_g1_body', categoria: 'basico', icon: '\uD83C\uDFDB\uFE0F' },
  { id: 'g2', titulo: 'orientacion_g2_title', contenido: 'orientacion_g2_body', categoria: 'retenciones', icon: '\uD83D\uDCB1' },
  { id: 'g3', titulo: 'orientacion_g3_title', contenido: 'orientacion_g3_body', categoria: 'declaraciones', icon: '\uD83D\uDCC5' },
  { id: 'g4', titulo: 'orientacion_g4_title', contenido: 'orientacion_g4_body', categoria: 'deducciones', icon: '\uD83D\uDED2' },
  { id: 'g5', titulo: 'orientacion_g5_title', contenido: 'orientacion_g5_body', categoria: 'multas', icon: '\u26A0\uFE0F' },
]

const CATEGORIAS = [
  { key: null, labelKey: 'general_all' },
  { key: 'basico', labelKey: 'orientacion_cat_basico' },
  { key: 'retenciones', labelKey: 'orientacion_cat_retenciones' },
  { key: 'declaraciones', labelKey: 'orientacion_cat_declaraciones' },
  { key: 'deducciones', labelKey: 'orientacion_cat_deducciones' },
  { key: 'multas', labelKey: 'orientacion_cat_multas' },
]

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'Orientacion'>

export default function OrientacionScreen({ navigation }: { navigation: ScreenNav }) {
  const { dispatch } = useStore()
  const { t } = useTranslate()
  const [filterCat, setFilterCat] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterCat ? GUIAS.filter((g) => g.categoria === filterCat) : GUIAS

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold" accessibilityRole="header">{t('orientacion_title')}</Text>
      </HeaderBar>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-700 dark:text-gray-400 text-sm mb-4">{t('orientacion_subtitle')}</Text>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 6 }}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat.key ?? 'all'}
              className={`px-4 min-h-[48px] justify-center rounded-full ${filterCat === cat.key ? 'bg-[#002f5d]' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'}`}
              onPress={() => setFilterCat(cat.key)}
              accessibilityLabel={t(cat.labelKey)}
              accessibilityRole="button"
              accessibilityState={{ selected: filterCat === cat.key }}
            >
              <Text className={`text-xs font-semibold ${filterCat === cat.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t(cat.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Guide cards */}
        {filtered.map((guia) => {
          const isExpanded = expandedId === guia.id
          return (
            <TouchableOpacity
              key={guia.id}
              className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm"
              onPress={() => { vibrateLight(); setExpandedId(isExpanded ? null : guia.id) }}
              accessibilityLabel={`${t(guia.titulo)}. ${isExpanded ? t('general_hide') : t('general_show')}`}
              accessibilityRole="button"
            >
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl mr-3">{guia.icon}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{t(guia.titulo)}</Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t('orientacion_cat_' + guia.categoria)}</Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-400 text-lg">{isExpanded ? '\u25B2' : '\u25BC'}</Text>
              </View>
              {isExpanded && (
                <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Text className="text-sm text-gray-700 dark:text-gray-300 leading-6">{t(guia.contenido)}</Text>
                  <TouchableOpacity
                    className="mt-3 self-start px-4 rounded-xl min-h-[48px] justify-center" style={{ backgroundColor: C.blue }}
                    onPress={() => dispatch(go('AssistantChat'))}
                    accessibilityLabel={t('inbox_ask_assistant')}
                    accessibilityRole="button"
                  >
                    <Text className="text-white font-semibold text-xs">{'\uD83E\uDD16'} {t('inbox_ask_assistant')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )
        })}

        <View className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-[16px] px-4 py-4 mb-10 mt-1">
          <Text className="text-blue-800 dark:text-blue-300 text-sm font-bold mb-1">{'\uD83D\uDCA1'} {t('assistant_welcome')}</Text>
          <Text className="text-blue-700 dark:text-blue-400 text-xs leading-5">{t('assistant_welcome_desc')}</Text>
          <TouchableOpacity
            className="mt-3 px-5 rounded-xl self-start min-h-[48px] justify-center" style={{ backgroundColor: C.blue }}
            onPress={() => dispatch(go('AssistantChat'))}
            accessibilityLabel={t('assistant_title')}
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-xs">{t('assistant_title')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
