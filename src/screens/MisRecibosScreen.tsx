import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStore, go, fmt, formatearFecha, showModal } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const FORMA_PAGO_LABEL: Record<string, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  cheque: 'Cheque',
  deposito: 'Dep\u00F3sito',
}

const ESTADO_COLOR: Record<string, string> = {
  emitido: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400',
  anulado: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400',
}

const ESTADO_LABEL: Record<string, string> = {
  emitido: 'Emitido',
  anulado: 'Anulado',
}

type Props = { navigation: NativeStackNavigationProp<any> }

export default function MisRecibosScreen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [refreshing, setRefreshing] = useState(false)
  const emitidos = state.recibos.filter((r) => r.estado === 'emitido')

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }, [])

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('mis_recibos_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1">{t('mis_recibos_title')}</Text>
        <View className="bg-white/20 rounded-full px-3 py-1">
          <Text className="text-white text-sm font-semibold">{emitidos.length}</Text>
        </View>
      </HeaderBar>

      <View className="flex-row justify-end px-4 py-3">
        <TouchableOpacity className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800" accessibilityLabel={t('mis_recibos_filtrar')} accessibilityRole="button" accessibilityHint={t('mis_recibos_filtrar_hint')}>
          <Text className="text-gray-600 dark:text-gray-400 text-sm mr-1" accessibilityElementsHidden={true}>{'\u2699'}</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">{t('mis_recibos_filtrar')}</Text>
        </TouchableOpacity>
      </View>

      {emitidos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4" accessibilityElementsHidden={true}>{'\uD83D\uDCC4'}</Text>
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('mis_recibos_empty')}</Text>
          <Text className="text-gray-400 dark:text-gray-500 text-center mb-6">{t('mis_recibos_empty_desc')}</Text>
          <TouchableOpacity
            className="bg-[#002f5d] rounded-lg py-4 px-8 items-center"
            onPress={() => dispatch(go('NuevoRecibo1'))}
            activeOpacity={0.8}
            accessibilityLabel={t('mis_recibos_primer_recibo')}
            accessibilityRole="button"
            accessibilityHint={t('mis_recibos_primer_recibo_hint')}
          >
            <Text className="text-white font-bold text-base">{t('mis_recibos_primer_recibo')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002f5d" />}
        >
          {emitidos.map((recibo) => (
            <View
              key={recibo.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-4 mb-3 shadow-sm"
              accessibilityLabel={`${t('mis_recibos_recibo')} ${recibo.id}, ${ESTADO_LABEL[recibo.estado] || recibo.estado}, ${t('mis_recibos_cliente')}: ${recibo.cliente}, ${t('mis_recibos_fecha')}: ${formatearFecha(recibo.fecha)}, ${t('mis_recibos_monto')}: ${fmt(recibo.montoBruto)}, ${t('mis_recibos_pago')}: ${FORMA_PAGO_LABEL[recibo.formaPago] || recibo.formaPago}`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-bold text-[#002f5d] dark:text-blue-300">{recibo.id}</Text>
                <View className={`px-2 py-0.5 rounded-full ${ESTADO_COLOR[recibo.estado] || 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Text className={`text-xs font-semibold ${ESTADO_COLOR[recibo.estado]?.split(' ')[2] || 'text-gray-600 dark:text-gray-400'}`}>
                    {ESTADO_LABEL[recibo.estado] || recibo.estado}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-800 dark:text-gray-200 font-medium mb-1" numberOfLines={1}>{recibo.cliente}</Text>
              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">{formatearFecha(recibo.fecha)}</Text>
                <Text className="text-gray-800 dark:text-gray-200 font-bold">{fmt(recibo.montoBruto)}</Text>
              </View>
              <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Text className="text-xs text-gray-400 dark:text-gray-500">{FORMA_PAGO_LABEL[recibo.formaPago] || recibo.formaPago}</Text>
                <TouchableOpacity
                  onPress={() => { vibrateLight(); dispatch(showModal(recibo.id)) }}
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-1.5"
                  accessibilityLabel={`${t('mis_recibos_ver_detalle')} ${recibo.id}`}
                  accessibilityRole="button"
                  accessibilityHint={t('mis_recibos_ver_detalle_hint')}
                >
                  <Text className="text-[#002f5d] dark:text-blue-300 text-xs font-semibold">{t('mis_recibos_ver_detalle')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  )
}
