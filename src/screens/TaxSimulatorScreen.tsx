import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import HeaderBar from '../components/HeaderBar'

export default function TaxSimulatorScreen() {
  const { dispatch } = useStore()
  const { t } = useTranslate()
  const [simMonto, setSimMonto] = useState('')
  const [simRetencion, setSimRetencion] = useState(true)

  const simMontoNum = parseFloat(simMonto) || 0
  const simRet = simRetencion ? simMontoNum * 0.08 : 0
  const simNeto = simMontoNum - simRet

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900" keyboardShouldPersistTaps="handled">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('simulator_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('simulator_simulate')}</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('simulator_simulate_desc')}</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mr-2">S/</Text>
            <TextInput
              className="flex-1 text-base text-gray-900 dark:text-gray-100"
              value={simMonto}
              onChangeText={setSimMonto}
              keyboardType="decimal-pad"
              placeholder="0.00"
              accessibilityLabel={t('simulator_amount')}
              accessibilityHint={t('simulator_amount_hint')}
            />
          </View>
          <TouchableOpacity
            className={`self-start px-4 py-3.5 rounded-xl mb-3 ${simRetencion ? 'bg-[#002f5d]' : 'bg-gray-200 dark:bg-gray-700'}`}
            onPress={() => setSimRetencion(!simRetencion)}
            accessibilityLabel={t('simulator_withhold_toggle')}
            accessibilityRole="switch"
            accessibilityState={{ checked: simRetencion }}
          >
            <Text className={`text-sm font-semibold ${simRetencion ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              {simRetencion ? t('simulator_withhold_on') : t('simulator_withhold_off')}
            </Text>
          </TouchableOpacity>
          {simMontoNum > 0 && (
            <View className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <InfoRow label={t('simulator_bruto')} value={fmt(simMontoNum)} />
              <InfoRow label={t('simulator_withhold')} value={`-${fmt(simRet)}`} />
              <InfoRow label={t('simulator_neto')} value={fmt(simNeto)} isBold />
              <InfoRow label={t('simulator_additional_tax')} value={fmt(simRet)} />
              <InfoRow label={t('simulator_apartado')} value={fmt(simMontoNum * 0.08)} isBold />
            </View>
          )}
        </View>

        <View className="h-12" />
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <View className="flex-row justify-between items-center py-2.5 gap-2" accessibilityLabel={`${label}: ${value}`}>
      <Text className={`text-sm text-gray-600 dark:text-gray-400 flex-1 mr-2 ${isBold ? 'font-bold' : ''}`}>{label}</Text>
      <Text 
        numberOfLines={1} 
        adjustsFontSizeToFit 
        className={`text-sm text-gray-900 dark:text-gray-100 flex-shrink-0 text-right min-w-[80px] ${isBold ? 'font-bold' : ''}`}
      >
        {value}
      </Text>
    </View>
  )
}