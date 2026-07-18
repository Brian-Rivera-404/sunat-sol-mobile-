import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from './AccessibleText'
import { useStore, hideModal, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'

export default function ModalRecibo() {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const recibo = (state.recibos ?? []).find(r => r.id === state.modalId)
  if (!recibo) return null

  const ret = recibo.montoBruto - recibo.montoNeto

  return (
    <View className="absolute inset-0 bg-black/50 justify-end z-50" accessibilityViewIsModal={true} onAccessibilityEscape={() => dispatch(hideModal())}>
      <View className="bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[80%]">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('detalle_title')}</Text>
          <TouchableOpacity onPress={() => dispatch(hideModal())} accessibilityLabel={t('detalle_cerrar')} accessibilityRole="button" accessibilityHint={t('detalle_cerrar')}>
            <Text className="text-2xl text-gray-500 dark:text-gray-400">{'\u2715'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Text className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">{recibo.id}</Text>
          <View className="border-t border-gray-100 dark:border-gray-700">
            <DetailRow label={t('detalle_cliente')} value={recibo.cliente} />
            <DetailRow label="RUC" value={recibo.ruc} />
            <DetailRow label={t('detalle_monto_bruto')} value={fmt(recibo.montoBruto)} />
            <DetailRow label={t('detalle_retencion')} value={fmt(ret)} />
            <DetailRow label={t('detalle_neto')} value={fmt(recibo.montoNeto)} isBold />
            <DetailRow label={t('detalle_forma_pago')} value={recibo.formaPago} />
            <DetailRow label={t('detalle_estado')} value={t('estado_emitido')} />
            <DetailRow label={t('detalle_fecha')} value={new Date(recibo.fecha).toLocaleDateString('es-PE')} />
          </View>
        </ScrollView>
        <TouchableOpacity
          className="bg-[#002f5d] rounded-xl py-4 items-center mt-4"
          onPress={() => dispatch(hideModal())}
          accessibilityLabel={t('detalle_cerrar')}
          accessibilityRole="button"
          accessibilityHint={t('detalle_cerrar')}
        >
          <Text className="text-white font-bold text-base">{t('detalle_cerrar')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function DetailRow({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <View className="flex-row justify-between py-3">
      <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      <Text className={`text-sm text-gray-900 dark:text-gray-100 ${isBold ? 'font-bold' : ''}`}>{value}</Text>
    </View>
  )
}
