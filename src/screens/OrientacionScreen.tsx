import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C, SHADOWS } from '../styles/theme'
import { Ionicons } from '@expo/vector-icons'
import { FadeInView } from '../components/AnimatedHelpers'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import FilterTabs from '../components/FilterTabs'
import type { GuiaOrientacion } from '../types/shared'

const GUIAS: GuiaOrientacion[] = [
  { id: 'g1', titulo: 'orientacion_g1_title', contenido: 'orientacion_g1_body', categoria: 'basico', ioniconsIcon: 'book', bg: '#E8EDF5' },
  { id: 'g2', titulo: 'orientacion_g2_title', contenido: 'orientacion_g2_body', categoria: 'retenciones', ioniconsIcon: 'cash', bg: '#E8F5ED' },
  { id: 'g3', titulo: 'orientacion_g3_title', contenido: 'orientacion_g3_body', categoria: 'declaraciones', ioniconsIcon: 'calendar', bg: '#E8EDF5' },
  { id: 'g4', titulo: 'orientacion_g4_title', contenido: 'orientacion_g4_body', categoria: 'deducciones', ioniconsIcon: 'receipt', bg: '#F5F0E8' },
  { id: 'g5', titulo: 'orientacion_g5_title', contenido: 'orientacion_g5_body', categoria: 'multas', ioniconsIcon: 'warning', bg: '#F5E8E8' },
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
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1" accessibilityRole="header">{t('orientacion_title')}</Text>
      </HeaderBar>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('orientacion_subtitle')}</Text>

        {/* Category filter */}
        <FilterTabs
          items={CATEGORIAS.map((cat) => ({
            key: cat.key,
            label: t(cat.labelKey),
          }))}
          selectedKey={filterCat}
          onSelect={setFilterCat}
        />

        {/* Guide cards */}
        {filtered.map((guia, idx) => {
          const isExpanded = expandedId === guia.id
          return (
            <FadeInView key={guia.id} delay={idx * 50}>
              <TouchableOpacity
                className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3"
                style={SHADOWS.card}
                onPress={() => { vibrateLight(); setExpandedId(isExpanded ? null : guia.id) }}
                activeOpacity={0.9}
                accessibilityLabel={`${t(guia.titulo)}. ${isExpanded ? t('general_hide') : t('general_show')}`}
                accessibilityRole="button"
              >
                <View className="flex-row items-center">
                  <View className="w-11 h-11 rounded-[14] items-center justify-center mr-3" style={{ backgroundColor: guia.bg }}>
                    <Ionicons name={guia.ioniconsIcon as any} size={22} color={C.navy} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{t(guia.titulo)}</Text>
                    <Text className="text-xs text-gray-400 mt-1">{t('orientacion_cat_' + guia.categoria)}</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.s400} />
                </View>

                {isExpanded && (
                  <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Text className="text-sm text-gray-600 dark:text-gray-400 leading-6">{t(guia.contenido)}</Text>
                    <TouchableOpacity
                      className="mt-3.5 self-start px-4 min-h-[48px] justify-center rounded-xl" style={{ backgroundColor: C.blue }}
                      onPress={() => dispatch(go('AssistantChat'))}
                      accessibilityLabel={t('inbox_ask_assistant')}
                      accessibilityRole="button"
                    >
                      <Text className="text-white font-semibold text-xs">🤖 {t('inbox_ask_assistant')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </FadeInView>
          )
        })}

        <View className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-[18px] p-4 mb-10 mt-2">
          <Text className="text-blue-700 dark:text-blue-300 text-sm font-bold mb-1">💡 {t('assistant_welcome')}</Text>
          <Text className="text-blue-600 dark:text-blue-400 text-xs leading-5">{t('assistant_welcome_desc')}</Text>
          <TouchableOpacity
            className="mt-3 px-5 min-h-[48px] justify-center rounded-xl bg-[#1B4FBF] self-start"
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
