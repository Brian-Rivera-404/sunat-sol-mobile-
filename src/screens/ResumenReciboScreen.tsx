import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStore, go, fmt, emitirRecibo } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const FORMA_PAGO_LABEL: Record<string, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  cheque: 'Cheque',
  deposito: 'Dep\u00F3sito',
}

type Props = { navigation: NativeStackNavigationProp<any> }

export default function ResumenReciboScreen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const { ruc, cliente, monto, formaPago, retencion } = state.reciboData
  const retencionMonto = retencion ? monto * 0.08 : 0
  const neto = monto - retencionMonto

  function handleConfirmar() {
    dispatch(emitirRecibo())
    vibrateSuccess()
    dispatch(go('ReciboEmitido'))
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('NuevoRecibo2'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('resumen_recibo_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{t('resumen_recibo_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1" accessibilityRole="header">{t('resumen_recibo_verificar')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-6">{t('resumen_recibo_revisa')}</Text>

        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-5 mb-6 shadow-sm" accessibilityLabel={`${t('resumen_recibo_resumen')}: RUC ${ruc}, ${t('resumen_recibo_cliente')} ${cliente}, ${t('resumen_recibo_monto_bruto')} ${fmt(monto)}, ${t('resumen_recibo_retencion')} ${fmt(retencionMonto)}, ${t('resumen_recibo_forma_pago')} ${FORMA_PAGO_LABEL[formaPago] || formaPago}, ${t('resumen_recibo_neto')} ${fmt(neto)}`}>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`RUC: ${ruc}`}>
            <Text className="text-gray-500 dark:text-gray-400">RUC</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{ruc}</Text>
          </View>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`${t('resumen_recibo_cliente')}: ${cliente}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('resumen_recibo_cliente')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium flex-1 text-right">{cliente}</Text>
          </View>
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
          <View className="flex-row justify-between mb-3 mt-2" accessibilityLabel={`${t('resumen_recibo_monto_bruto')}: ${fmt(monto)}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('resumen_recibo_monto_bruto')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{fmt(monto)}</Text>
          </View>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`${t('resumen_recibo_retencion')}: ${fmt(retencionMonto)}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('resumen_recibo_retencion')}</Text>
            <Text className="text-red-500 dark:text-red-400 font-medium">-{fmt(retencionMonto)}</Text>
          </View>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`${t('resumen_recibo_forma_pago')}: ${FORMA_PAGO_LABEL[formaPago] || formaPago}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('resumen_recibo_forma_pago')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{FORMA_PAGO_LABEL[formaPago] || formaPago}</Text>
          </View>
          <View className="h-px bg-gray-300 dark:bg-gray-600 my-1" />
          <View className="flex-row justify-between mt-2" accessibilityLabel={`${t('resumen_recibo_neto')}: ${fmt(neto)}`}>
            <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">{t('resumen_recibo_neto')}</Text>
            <Text className="text-[#002f5d] dark:text-blue-300 font-bold text-lg">{fmt(neto)}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-[#002f5d] rounded-lg py-4 items-center mb-3"
          onPress={handleConfirmar}
          activeOpacity={0.8}
          accessibilityLabel={t('resumen_recibo_confirmar')}
          accessibilityRole="button"
          accessibilityHint={t('resumen_recibo_confirmar_hint')}
        >
          <Text className="text-white font-bold text-base">{t('resumen_recibo_confirmar')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => dispatch(go('NuevoRecibo2'))}
          className="items-center py-3 mb-10"
          accessibilityLabel={t('resumen_recibo_corregir')}
          accessibilityRole="button"
          accessibilityHint={t('resumen_recibo_volver_hint')}
        >
          <Text className="text-blue-600 dark:text-blue-400 text-sm"><Text accessibilityElementsHidden={true}>{'\u270F'}</Text> {t('resumen_recibo_corregir')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
