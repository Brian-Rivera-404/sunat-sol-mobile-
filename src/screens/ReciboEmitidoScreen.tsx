import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStore, go, fmt, formatearFecha } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const FORMA_PAGO_LABEL: Record<string, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  cheque: 'Cheque',
  deposito: 'Dep\u00F3sito',
}

const ESTADO_LABEL: Record<string, string> = {
  emitido: 'Emitido',
  anulado: 'Anulado',
}

const ESTADO_COLOR: Record<string, string> = {
  emitido: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900',
  anulado: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900',
}

type Props = { navigation: NativeStackNavigationProp<any> }

export default function ReciboEmitidoScreen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const recibo = state.recibos[state.recibos.length - 1]

  useEffect(() => { vibrateSuccess() }, [])

  if (!recibo) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-4">
        <Text className="text-gray-500 dark:text-gray-400">{t('recibo_emitido_no_encontrado')}</Text>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mt-4" accessibilityLabel={t('general_ir_inicio')} accessibilityRole="button" accessibilityHint={t('recibo_emitido_ir_inicio_hint')}>
          <Text className="text-blue-600 dark:text-blue-400">{t('general_ir_inicio')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <View className="flex-1 items-center">
          <Text className="text-white text-lg font-bold" accessibilityRole="header">{t('recibo_emitido_title')}</Text>
        </View>
      </HeaderBar>

      <View className="items-center px-4 pt-8 pb-4">
        <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-4">
          <Text className="text-green-500 dark:text-green-400 text-4xl" accessibilityElementsHidden={true}>{'\u2713'}</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100" accessibilityRole="header">{t('recibo_emitido_exito')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-1">{t('recibo_emitido_mensaje')}</Text>
      </View>

      <View className="px-4">
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-5 mb-6 shadow-sm" accessibilityLabel={`${t('recibo_emitido_recibo')} ${recibo.id}, ${t('recibo_emitido_fecha')} ${formatearFecha(recibo.fecha)}, RUC ${recibo.ruc}, ${t('recibo_emitido_cliente')} ${recibo.cliente}, ${t('recibo_emitido_monto_bruto')} ${fmt(recibo.montoBruto)}, ${t('recibo_emitido_neto')} ${fmt(recibo.montoNeto)}, ${t('recibo_emitido_estado')} ${ESTADO_LABEL[recibo.estado] || recibo.estado}`}>
          <View className="items-center mb-4">
            <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('recibo_emitido_codigo')}</Text>
            <Text className="text-xl font-bold text-[#002f5d] dark:text-blue-300 mt-1">{recibo.id}</Text>
          </View>

          <View className="h-px bg-gray-200 dark:bg-gray-600 my-1" />

          <View className="flex-row justify-between mb-3 mt-3" accessibilityLabel={`${t('recibo_emitido_fecha')}: ${formatearFecha(recibo.fecha)}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('recibo_emitido_fecha')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{formatearFecha(recibo.fecha)}</Text>
          </View>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`RUC: ${recibo.ruc}`}>
            <Text className="text-gray-500 dark:text-gray-400">RUC</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{recibo.ruc}</Text>
          </View>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`${t('recibo_emitido_cliente')}: ${recibo.cliente}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('recibo_emitido_cliente')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium flex-1 text-right">{recibo.cliente}</Text>
          </View>
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
          <View className="flex-row justify-between mb-3 mt-2" accessibilityLabel={`${t('recibo_emitido_monto_bruto')}: ${fmt(recibo.montoBruto)}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('recibo_emitido_monto_bruto')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{fmt(recibo.montoBruto)}</Text>
          </View>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`${t('recibo_emitido_retencion')}: ${fmt(recibo.retencion)}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('recibo_emitido_retencion')}</Text>
            <Text className="text-red-500 dark:text-red-400 font-medium">-{fmt(recibo.retencion)}</Text>
          </View>
          <View className="flex-row justify-between mb-3" accessibilityLabel={`${t('recibo_emitido_forma_pago')}: ${FORMA_PAGO_LABEL[recibo.formaPago] || recibo.formaPago}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('recibo_emitido_forma_pago')}</Text>
            <Text className="text-gray-800 dark:text-gray-200 font-medium">{FORMA_PAGO_LABEL[recibo.formaPago] || recibo.formaPago}</Text>
          </View>
          <View className="h-px bg-gray-300 dark:bg-gray-600 my-1" />
          <View className="flex-row justify-between mt-2 mb-3" accessibilityLabel={`${t('recibo_emitido_neto')}: ${fmt(recibo.montoNeto)}`}>
            <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">{t('recibo_emitido_neto')}</Text>
            <Text className="text-[#002f5d] dark:text-blue-300 font-bold text-lg">{fmt(recibo.montoNeto)}</Text>
          </View>
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
          <View className="flex-row justify-between mt-3" accessibilityLabel={`${t('recibo_emitido_estado')}: ${ESTADO_LABEL[recibo.estado] || recibo.estado}`}>
            <Text className="text-gray-500 dark:text-gray-400">{t('recibo_emitido_estado')}</Text>
            <View className={`px-3 py-1 rounded-full ${ESTADO_COLOR[recibo.estado] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              <Text className={`text-xs font-semibold ${ESTADO_COLOR[recibo.estado]?.split(' ')[0] || 'text-gray-600 dark:text-gray-400'}`}>
                {ESTADO_LABEL[recibo.estado] || recibo.estado}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-[#002f5d] rounded-lg py-4 items-center mb-3"
          onPress={() => dispatch(go('Home'))}
          activeOpacity={0.8}
          accessibilityLabel={t('general_ir_inicio')}
          accessibilityRole="button"
          accessibilityHint={t('recibo_emitido_ir_inicio_hint')}
        >
          <Text className="text-white font-bold text-base">{t('general_ir_inicio')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => dispatch(go('MisRecibos'))}
          className="items-center py-3 mb-10"
          accessibilityLabel={t('recibo_emitido_ver_recibos')}
          accessibilityRole="button"
          accessibilityHint={t('recibo_emitido_ver_recibos_hint')}
        >
          <Text className="text-blue-600 dark:text-blue-400 text-sm"><Text accessibilityElementsHidden={true}>{'\uD83D\uDCCB'}</Text> {t('recibo_emitido_ver_recibos')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
