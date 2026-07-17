import React, { useState, useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import type { ValidatedEstablishment } from '../types/shared'

const VALIDATED_ESTABLISHMENTS: ValidatedEstablishment[] = [
  { ruc: '20123456789', nombre: 'Hotel Los Delfines', categoria: 'hotel', validado: true },
  { ruc: '20123456790', nombre: 'Restaurante Astrid & Gastón', categoria: 'restaurante', validado: true },
  { ruc: '20123456791', nombre: 'Hotel Marriott Lima', categoria: 'hotel', validado: true },
  { ruc: '20123456792', nombre: 'Restaurante La Mar Cebichería', categoria: 'restaurante', validado: true },
  { ruc: '20123456793', nombre: 'Farmacia Inkafarma', categoria: 'farmacia', validado: true },
  { ruc: '20123456794', nombre: 'Transportes Flores EIRL', categoria: 'transporte', validado: true },
  { ruc: '20123456795', nombre: 'Hotel Westin Lima', categoria: 'hotel', validado: true },
  { ruc: '20123456796', nombre: 'Restaurante Pescados Capitales', categoria: 'restaurante', validado: true },
  { ruc: '20123456797', nombre: 'Clínica San Pablo', categoria: 'farmacia', validado: true },
  { ruc: '20123456798', nombre: 'Hotel Country Club Lima', categoria: 'hotel', validado: true },
]

const CATEGORIA_ICONS: Record<string, string> = {
  hotel: '\uD83C\uDFE8',
  restaurante: '\uD83C\uDF7D\uFE0F',
  farmacia: '\uD83D\uDC8A',
  transporte: '\u2708\uFE0F',
  otro: '\uD83D\uDCCC',
}

export default function ValidarEstablecimientosScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return VALIDATED_ESTABLISHMENTS
    const lower = search.toLowerCase()
    return VALIDATED_ESTABLISHMENTS.filter(
      (e) =>
        e.nombre.toLowerCase().includes(lower) ||
        e.ruc.includes(lower) ||
        e.categoria.toLowerCase().includes(lower)
    )
  }, [search])

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900" keyboardShouldPersistTaps="handled">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('validate_business_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 mb-4">
          <Text className="text-gray-400 mr-2">{'\uD83D\uDD0D'}</Text>
          <TextInput
            className="flex-1 text-base text-gray-900 dark:text-gray-100 py-2"
            value={search}
            onChangeText={setSearch}
            placeholder={t('validate_business_search')}
            placeholderTextColor="#9ca3af"
            accessibilityLabel={t('validate_business_search')}
            accessibilityHint={t('validate_business_search_hint')}
          />
        </View>

        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('validate_business_count')}: {filtered.length}</Text>

        {filtered.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Text className="text-gray-500 dark:text-gray-400">{t('validate_business_not_found')}</Text>
          </View>
        ) : (
          filtered.map((e) => (
            <View key={e.ruc} className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm" accessibilityLabel={`${e.nombre}, ${t('validate_business_cat_' + e.categoria)}, RUC: ${e.ruc}, ${t('validate_business_validated')}`}>
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{CATEGORIA_ICONS[e.categoria] || '\uD83D\uDCCC'}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{e.nombre}</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('validate_business_cat_' + e.categoria)}</Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">RUC: {e.ruc}</Text>
                </View>
                <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                  <Text className="text-green-700 dark:text-green-400 text-xs font-semibold">{'\u2714\uFE0F'} {t('validate_business_validated')}</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </View>
    </ScrollView>
  )
}