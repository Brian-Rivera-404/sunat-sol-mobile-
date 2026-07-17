import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

interface Beneficio {
  icon: string
  title: string
  description: string
  amount: string
  tag?: string
}

const BENEFICIOS: Beneficio[] = [
  { icon: '\uD83D\uDCB0', title: 'Deducción automática 7 UIT', description: 'Deducción estándar para todos los contribuyentes de 4ta categoría.', amount: 'S/ 36,050' },
  { icon: '\uD83C\uDFE0', title: 'Deducción por alquiler', description: 'Deduce hasta el 30% del monto pagado por alquiler de tu vivienda.', amount: 'Hasta S/ 15,450' },
  { icon: '\uD83C\uDFE5', title: 'Gastos médicos', description: 'Deduce gastos en salud, seguros médicos y medicamentos.', amount: 'Hasta S/ 25,750' },
  { icon: '\uD83D\uDCDA', title: 'Gastos educativos', description: 'Deduce gastos en educación propia, de hijos o cónyuge.', amount: 'Hasta S/ 15,450', tag: 'Nuevo' },
  { icon: '\uD83D\uDCF1', title: 'Pago electrónico', description: 'Beneficio adicional por usar medios de pago electrónicos.', amount: 'Hasta S/ 10,300', tag: 'Popular' },
  { icon: '\u23F8\uFE0F', title: 'Suspensión de retenciones', description: 'Solicita la suspensión de retenciones si tus ingresos proyectados son menores.', amount: 'Trámite gratuito', tag: 'Recomendado' },
]

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'Beneficios'>

export default function BeneficiosScreen({ navigation }: { navigation: ScreenNav }) {
  const { dispatch } = useStore()
  const { t } = useTranslate()

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity
          className="mr-3 py-2.5"
          onPress={() => dispatch(go('Home'))}
          accessibilityLabel={t('general_volver')}
          accessibilityRole="button"
          accessibilityHint={t('general_volver_hint')}
        >
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('beneficios_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-5">
          {t('beneficios_desc')}
        </Text>

        <View className="gap-4 mb-10">
          {BENEFICIOS.map((b, i) => (
            <View key={i} className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm" accessibilityLabel={`${b.title}, ${b.description}, ${b.amount}${b.tag ? `, ${b.tag}` : ''}`}>
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900 items-center justify-center mr-3">
                  <Text className="text-xl" accessibilityElementsHidden={true}>{b.icon}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center flex-wrap">
                    <Text className="text-sm font-bold text-gray-900 dark:text-gray-100 mr-2">{b.title}</Text>
                    {b.tag ? (
                      <View className="bg-[#002f5d] px-2 py-0.5 rounded-full">
                        <Text className="text-white text-xs font-semibold">{b.tag}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-4">{b.description}</Text>
                  <Text className="text-xl font-extrabold mt-2" style={{ color: C.navy }}>{b.amount}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
