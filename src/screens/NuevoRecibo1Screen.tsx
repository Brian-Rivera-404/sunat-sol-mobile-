import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { useStore, go, RUC_DB, setReciboData } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateError } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'NuevoRecibo1'> }

export default function NuevoRecibo1Screen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [ruc, setRuc] = useState('')
  const [monto, setMonto] = useState('')

  const cliente = ruc.length === 11 ? RUC_DB[ruc] || null : null
  const rucValido = ruc.length === 11 && cliente !== null

  function handleContinuar() {
    if (ruc.length !== 11 || !cliente) {
      alert(t('nuevo_recibo_invalid_ruc'))
      vibrateError()
      return
    }
    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      alert(t('nuevo_recibo_invalid_monto'))
      vibrateError()
      return
    }
    dispatch(setReciboData({ ruc, cliente, monto: montoNum }))
    vibrateLight()
    dispatch(go('NuevoRecibo2'))
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="py-2.5 mr-3" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint="Regresa al inicio">
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{t('nuevo_recibo_step1')}</Text>
      </HeaderBar>

      <View className="px-4 pt-4">
        <View className="flex-row mb-2">
          <View className="flex-1 h-1 bg-blue-500 rounded-full mr-1" />
          <View className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full ml-1" />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-blue-600 font-medium">Datos del cliente</Text>
          <Text className="text-xs text-gray-400">Confirmación</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1" accessibilityRole="header">{t('nuevo_recibo_title')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-6">{t('nuevo_recibo_subtitle')}</Text>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 shadow-sm">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('nuevo_recibo_ruc_label')}</Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base mb-1 text-gray-900 dark:text-gray-100"
            placeholder={t('nuevo_recibo_ruc_placeholder')}
            keyboardType="number-pad"
            maxLength={11}
            value={ruc}
            onChangeText={setRuc}
            accessibilityLabel={t('nuevo_recibo_ruc_label')}
            accessibilityHint={t('nuevo_recibo_ruc_hint')}
          />
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('nuevo_recibo_ruc_example')}</Text>
          {ruc.length === 11 && (
            cliente ? (
              <View className="bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg px-4 py-3 mb-3 flex-row items-center">
                <Text className="text-green-600 dark:text-green-400 text-lg mr-2" accessibilityElementsHidden={true}>{'\u2713'}</Text>
                <Text className="text-green-700 dark:text-green-300 font-medium flex-1">{cliente}</Text>
              </View>
            ) : (
              <View className="bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg px-4 py-3 mb-3" accessibilityLiveRegion="polite" importantForAccessibility="yes">
                <Text className="text-red-600 dark:text-red-400 text-sm">{t('nuevo_recibo_ruc_not_found')}</Text>
              </View>
            )
          )}

          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('nuevo_recibo_ruc_test')}</Text>
          {Object.entries(RUC_DB).map(([r, c]) => (
            <TouchableOpacity key={r} onPress={() => setRuc(r)} className="py-1" accessibilityLabel={t('nuevo_recibo_ruc_test_prefix') + `: ${r} - ${c}`} accessibilityRole="button" accessibilityHint="Presiona para autocompletar el RUC">
              <Text className="text-blue-600 dark:text-blue-400 text-sm">{r} - {c}</Text>
            </TouchableOpacity>
          ))}

          <View className="h-px bg-gray-200 dark:bg-gray-600 my-4" />

          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('nuevo_recibo_monto_label')}</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mr-2">S/</Text>
            <TextInput
              className="flex-1 text-base text-gray-900 dark:text-gray-100"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={monto}
              onChangeText={setMonto}
              accessibilityLabel={t('nuevo_recibo_monto_label')}
              accessibilityHint={t('nuevo_recibo_monto_hint')}
            />
          </View>
        </View>

        <View className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3 mt-6">
          <Text className="text-blue-700 dark:text-blue-300 text-sm">
            <Text accessibilityElementsHidden={true}>{'\uD83D\uDCA1'}</Text>
            {' '}{t('nuevo_recibo_monto_info')}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-[#002f5d] rounded-xl py-3.5 mt-6 mb-10 items-center"
          onPress={handleContinuar}
          activeOpacity={0.8}
          accessibilityLabel={t('nuevo_recibo_continuar')}
          accessibilityRole="button"
          accessibilityHint={t('nuevo_recibo_continuar_hint')}
        >
          <Text className="text-white font-bold text-base">{t('nuevo_recibo_continuar')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
