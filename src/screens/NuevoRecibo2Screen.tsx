import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStore, go, fmt, setReciboData } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

type Props = { navigation: NativeStackNavigationProp<any> }

const FORMA_PAGO = [
  { key: 'transferencia', label: 'Transferencia', icon: '\uD83C\uDFE6' },
  { key: 'efectivo', label: 'Efectivo', icon: '\uD83D\uDCB5' },
  { key: 'cheque', label: 'Cheque', icon: '\uD83D\uDCC4' },
  { key: 'deposito', label: 'Dep\u00F3sito', icon: '\uD83C\uDFE5' },
]

export default function NuevoRecibo2Screen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [formaPago, setFormaPago] = useState(state.reciboData.formaPago || 'transferencia')
  const [retencion, setRetencion] = useState(state.reciboData.retencion !== false)

  const monto = state.reciboData.monto || 0
  const retencionMonto = retencion ? monto * 0.08 : 0
  const neto = monto - retencionMonto

  function handleVerResumen() {
    dispatch(setReciboData({ formaPago, retencion }))
    vibrateLight()
    dispatch(go('ResumenRecibo'))
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" keyboardShouldPersistTaps="handled">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('NuevoRecibo1'))} className="py-2.5 mr-3" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint="Regresa al paso 1">
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{t('nuevo_recibo_step2')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1" accessibilityRole="header">{t('nuevo_recibo2_forma_pago')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-5">{t('nuevo_recibo2_selecciona')}</Text>

        <View className="flex-row flex-wrap justify-between mb-2">
          {FORMA_PAGO.map((fp) => {
            const selected = formaPago === fp.key
            return (
              <TouchableOpacity
                key={fp.key}
                onPress={() => setFormaPago(fp.key)}
                className={`w-[48%] rounded-xl px-4 py-5 mb-3 items-center border-2 ${
                  selected ? 'border-[#002f5d] bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
                activeOpacity={0.7}
                accessibilityLabel={`${fp.label}, ${selected ? t('nuevo_recibo2_selected') : t('nuevo_recibo2_not_selected')}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityHint={t('nuevo_recibo2_select_hint') + ' ' + fp.label.toLowerCase()}
              >
                <Text className="text-2xl mb-1" accessibilityElementsHidden={true}>{fp.icon}</Text>
                <Text className={`font-semibold ${selected ? 'text-[#002f5d] dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {fp.label}
                </Text>
                {selected && <Text className="text-[#002f5d] dark:text-blue-300 text-lg mt-1" accessibilityElementsHidden={true}>{'\u25CF'}</Text>}
              </TouchableOpacity>
            )
          })}
        </View>

        <View className="mt-4 mb-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">{t('nuevo_recibo2_aplicar_retencion')}</Text>
            <TouchableOpacity
              onPress={() => setRetencion(!retencion)}
              className={`w-14 h-7 rounded-full px-0.5 justify-center ${
                retencion ? 'bg-[#002f5d] items-end' : 'bg-gray-300 dark:bg-gray-600 items-start'
              }`}
              activeOpacity={0.8}
              accessibilityLabel={`${t('nuevo_recibo2_aplicar_retencion')}, ${retencion ? t('nuevo_recibo2_activado') : t('nuevo_recibo2_desactivado')}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: retencion }}
              accessibilityHint={t('nuevo_recibo2_toggle_hint')}
            >
              <View className="w-6 h-6 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {retencion ? t('nuevo_recibo2_retencion_on') : t('nuevo_recibo2_retencion_off')}
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-5 mb-6" accessibilityLabel={`${t('nuevo_recibo2_resumen')}: ${t('nuevo_recibo2_monto_bruto')} ${fmt(monto)}, ${t('nuevo_recibo2_retencion')} ${retencion ? fmt(retencionMonto) : t('resumen_recibo_zero')}, ${t('nuevo_recibo2_neto')} ${fmt(neto)}`}>
          <Text className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('nuevo_recibo2_resumen')}</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 dark:text-gray-400">{t('nuevo_recibo2_monto_bruto')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{fmt(monto)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 dark:text-gray-400">{t('nuevo_recibo2_retencion')} (8%)</Text>
            <Text className="text-red-500 dark:text-red-400 font-medium">-{fmt(retencionMonto)}</Text>
          </View>
          <View className="h-px bg-gray-300 dark:bg-gray-600 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-gray-800 dark:text-gray-100 font-bold">{t('nuevo_recibo2_neto')}</Text>
            <Text className="text-[#002f5d] dark:text-blue-300 font-bold text-lg">{fmt(neto)}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-[#002f5d] rounded-lg py-4 items-center mb-4"
          onPress={handleVerResumen}
          activeOpacity={0.8}
          accessibilityLabel={t('nuevo_recibo2_ver_resumen')}
          accessibilityRole="button"
          accessibilityHint={t('nuevo_recibo2_ver_resumen_hint')}
        >
          <Text className="text-white font-bold text-base">{t('nuevo_recibo2_ver_resumen')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
