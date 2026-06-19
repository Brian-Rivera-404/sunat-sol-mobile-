import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'

const generarOrden = () => {
  const nums = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const pref = Array.from({ length: 3 }, () => letras[Math.floor(Math.random() * 26)]).join('')
  return `${pref}-${nums}`
}

export default function DeclaracionExitosaScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [orden] = React.useState(generarOrden)

  const emitidos = useMemo(() => state.recibos.filter((r) => r.estado === 'emitido'), [state.recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const retenciones = useMemo(() => emitidos.reduce((s, r) => s + r.retencion, 0), [emitidos])
  const rentaNeta = Math.max(0, totalIngresos - 7 * 5150)
  const impuesto = rentaNeta * 0.08
  const saldoAPagar = Math.max(0, impuesto - retenciones)

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center px-6">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-4">
          <Text className="text-4xl text-green-600 dark:text-green-400" accessibilityElementsHidden={true}>{'\u2713'}</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center" accessibilityRole="header">{t('declaracion_exitosa_text')}</Text>
      </View>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6" accessibilityLabel={`${t('declaracion_exitosa_title')}. ${t('declaracion_orden')}: ${orden}, ${t('declaracion_ejercicio')}, ${t('declarar_ingresos')}: ${fmt(totalIngresos)}, ${t('declarar_retenciones')}: ${fmt(retenciones)}, ${t('declarar_saldo')}: ${fmt(saldoAPagar)}`}>
        <View className="items-center mb-4">
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('declaracion_orden')}</Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wider">{orden}</Text>
        </View>

        <View className="flex-row justify-center mb-4">
          <View className="bg-blue-50 dark:bg-blue-900 px-4 py-1.5 rounded-full">
            <Text className="text-[#002f5d] dark:text-blue-300 text-xs font-semibold">{t('declaracion_ejercicio')}</Text>
          </View>
        </View>

        <View className="border-t border-gray-100 dark:border-gray-700 pt-3">
          <VoucherRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <VoucherRow label={t('declarar_retenciones')} value={fmt(retenciones)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
          <VoucherRow label={t('declarar_saldo')} value={fmt(saldoAPagar)} isBold />
        </View>
      </View>

      <TouchableOpacity
        className="bg-[#002f5d] rounded-xl py-4 items-center"
        onPress={() => dispatch(go('Home'))}
        accessibilityLabel={t('general_ir_inicio')}
        accessibilityRole="button"
        accessibilityHint={t('general_ir_inicio_hint')}
      >
        <Text className="text-white font-bold text-base">{t('general_ir_inicio')}</Text>
      </TouchableOpacity>
    </View>
  )
}

function VoucherRow({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <View className="flex-row justify-between items-center py-1.5" accessibilityLabel={`${label}: ${value}`}>
      <Text className={`text-sm text-gray-600 dark:text-gray-400 ${isBold ? 'font-bold' : ''}`}>{label}</Text>
      <Text className={`text-sm text-gray-900 dark:text-gray-100 ${isBold ? 'font-bold' : ''}`}>{value}</Text>
    </View>
  )
}
