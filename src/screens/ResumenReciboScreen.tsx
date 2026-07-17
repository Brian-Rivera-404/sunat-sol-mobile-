import React, { useState, useRef } from 'react'
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStore, go, fmt, emitirRecibo } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import * as Speech from 'expo-speech'

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
  const [summaryFullyRead, setSummaryFullyRead] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const resumenTexto =
    `${t('resumen_recibo_monto_bruto')}: ${fmt(monto)}. ` +
    `${t('resumen_recibo_retencion')}: ${fmt(retencionMonto)}. ` +
    `${t('resumen_recibo_neto')}: ${fmt(neto)}. ` +
    `${t('resumen_recibo_forma_pago')}: ${FORMA_PAGO_LABEL[formaPago] || formaPago}.`

  const sugerenciaRetencion = retencionMonto * 0.08
  const sugerenciaTexto = sugerenciaRetencion > 0
    ? `${t('resumen_apartado')}: ${fmt(sugerenciaRetencion)} (8%)`
    : null

  function handleEscucharResumen() {
    setSummaryFullyRead(false)
    setIsSpeaking(true)
    Speech.speak(resumenTexto, {
      rate: state.assistantSettings.ttsSpeed === 'fast' ? 0.9 : state.assistantSettings.ttsSpeed === 'slow' ? 0.4 : 0.6,
      language: state.language,
      onDone: () => {
        setSummaryFullyRead(true)
        setIsSpeaking(false)
      },
      onError: () => {
        setSummaryFullyRead(true)
        setIsSpeaking(false)
      },
    })
  }

  function handleConfirmar() {
    Alert.alert(
      t('resumen_recibo_alerta_title'),
      t('resumen_recibo_alerta_body'),
      [
        { text: t('general_cancelar'), style: 'cancel' },
        {
          text: t('resumen_recibo_confirmar'),
          style: 'destructive',
          onPress: () => {
            dispatch(emitirRecibo())
            vibrateSuccess()
            dispatch(go('ReciboEmitido'))
          },
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('NuevoRecibo2'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('resumen_recibo_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{t('resumen_recibo_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-4">
        <View className="flex-row mb-2">
          <View className="flex-1 h-1 bg-blue-500 rounded-full mr-1" />
          <View className="flex-1 h-1 bg-blue-500 rounded-full ml-1" />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-blue-600 font-medium">Datos del cliente</Text>
          <Text className="text-xs text-blue-600 font-medium">Confirmación</Text>
        </View>
      </View>

      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1" accessibilityRole="header">{t('resumen_recibo_verificar')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-6">{t('resumen_recibo_revisa')}</Text>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 shadow-sm mb-4" accessibilityLabel={`${t('resumen_recibo_resumen')}: RUC ${ruc}, ${t('resumen_recibo_cliente')} ${cliente}, ${t('resumen_recibo_monto_bruto')} ${fmt(monto)}, ${t('resumen_recibo_retencion')} ${fmt(retencionMonto)}, ${t('resumen_recibo_forma_pago')} ${FORMA_PAGO_LABEL[formaPago] || formaPago}, ${t('resumen_recibo_neto')} ${fmt(neto)}`}>
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
          <View className="h-px bg-gray-200 dark:bg-gray-600 my-1" />
          <View className="flex-row justify-between mt-2" accessibilityLabel={`${t('resumen_recibo_neto')}: ${fmt(neto)}`}>
            <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">{t('resumen_recibo_neto')}</Text>
            <Text className="text-xl font-extrabold" style={{ color: C.navy }}>{fmt(neto)}</Text>
          </View>
        </View>

        {sugerenciaTexto && (
          <View className="bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-xl px-4 py-3 mb-4" accessibilityRole="alert">
            <Text className="text-green-700 dark:text-green-300 text-sm leading-5">
              {'\uD83D\uDCA1'} {sugerenciaTexto}
            </Text>
            <Text className="text-green-600 dark:text-green-400 text-xs mt-1">{t('resumen_apartado_info')}</Text>
          </View>
        )}

        <View className="bg-amber-50 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-4 mb-4" accessibilityRole="alert" accessibilityLiveRegion="assertive" importantForAccessibility="yes">
          <Text className="text-amber-800 dark:text-amber-200 font-bold text-sm mb-1">{'\u26A0\uFE0F'} {t('resumen_recibo_alerta_title')}</Text>
          <Text className="text-amber-700 dark:text-amber-300 text-sm leading-5">{t('resumen_recibo_alerta_body')}</Text>
        </View>

        <TouchableOpacity
          className="bg-[#002f5d] rounded-xl py-3.5 items-center mb-3"
          onPress={handleEscucharResumen}
          activeOpacity={0.8}
          accessibilityLabel={t('resumen_listen')}
          accessibilityRole="button"
          accessibilityHint={t('resumen_listen_hint')}
        >
          <Text className="text-white font-bold text-base">{isSpeaking ? '\uD83C\uDF99\uFE0F ' : '\uD83D\uDD0A '}{t('resumen_listen')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#002f5d] rounded-xl py-3.5 items-center mb-3"
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
