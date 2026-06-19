import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

const UIT = 5150
const DEDUCCION = 7 * UIT

export default function DeclararScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [acepto, setAcepto] = useState(false)

  const emitidos = useMemo(() => state.recibos.filter((r) => r.estado === 'emitido'), [state.recibos])

  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const rentaNeta = useMemo(() => Math.max(0, totalIngresos - DEDUCCION), [totalIngresos])
  const impuesto = rentaNeta * 0.08
  const retenciones = useMemo(() => emitidos.reduce((s, r) => s + r.retencion, 0), [emitidos])
  const saldoAPagar = Math.max(0, impuesto - retenciones)

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity
          className="mr-3 py-2.5"
          onPress={() => dispatch(go('Home'))}
          accessibilityLabel={t('general_volver')}
          accessibilityRole="button"
          accessibilityHint={t('general_volver_hint')}
        >
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">{t('declarar_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('declarar_anual')}</Text>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4">
          <InfoRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <InfoRow label={t('declarar_deduccion')} value={fmt(DEDUCCION)} />
          <InfoRow label={t('declarar_renta_neta')} value={fmt(rentaNeta)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-2" />
          <InfoRow label={t('declarar_impuesto')} value={fmt(impuesto)} />
          <InfoRow label={t('declarar_retenciones')} value={fmt(retenciones)} />
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-2" />
          <InfoRow label={t('declarar_saldo')} value={fmt(saldoAPagar)} isBold />
        </View>

        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-4">
          {t('declarar_info')}
        </Text>

        <View className="flex-row items-start mb-6">
          <Switch
            value={acepto}
            onValueChange={setAcepto}
            trackColor={{ false: '#d1d5db', true: '#002f5d' }}
            thumbColor={acepto ? '#fff' : '#f4f3f4'}
            accessibilityLabel={t('declarar_acepto')}
            accessibilityHint={t('declarar_acepto_hint')}
          />
          <Text className="text-sm text-gray-700 dark:text-gray-300 ml-3 flex-1">
            {t('declarar_acepto_text')}
          </Text>
        </View>

        <TouchableOpacity
          className={`rounded-xl py-4 items-center mb-10 ${acepto ? 'bg-[#002f5d]' : 'bg-gray-300 dark:bg-gray-600'}`}
          onPress={() => { vibrateSuccess(); dispatch(go('DeclaracionExitosa')) }}
          disabled={!acepto}
          accessibilityLabel={acepto ? t('declarar_presentar') : t('declarar_presentar_disabled')}
          accessibilityRole="button"
          accessibilityState={{ disabled: !acepto }}
          accessibilityHint={acepto ? t('declarar_presentar_hint') : t('declarar_presentar_disabled_hint')}
        >
          <Text className={`font-bold text-base ${acepto ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {t('declarar_presentar')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <View className="flex-row justify-between items-center py-1.5">
      <Text className={`text-sm text-gray-600 dark:text-gray-400 flex-1 ${isBold ? 'font-bold' : ''}`}>{label}</Text>
      <Text className={`text-sm text-gray-900 dark:text-gray-100 ${isBold ? 'font-bold' : ''}`}>{value}</Text>
    </View>
  )
}
