import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { useStore, go, RUC_DB, setReciboData } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateError } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'NuevoRecibo1'> }

const FORMA_PAGO = [
  { key: 'transferencia', label: 'Transferencia', icon: '\uD83C\uDFE6' },
  { key: 'efectivo', label: 'Efectivo', icon: '\uD83D\uDCB5' },
  { key: 'cheque', label: 'Cheque', icon: '\uD83D\uDCC4' },
  { key: 'deposito', label: 'Dep\u00F3sito', icon: '\uD83C\uDFE5' },
]

export default function NuevoRecibo1Screen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [ruc, setRuc] = useState('')
  const [monto, setMonto] = useState('')
  const [formaPago, setFormaPago] = useState('transferencia')
  const [retencion, setRetencion] = useState(true)
  const [showHelpTooltip, setShowHelpTooltip] = useState(false)

  const cliente = ruc.length === 11 ? RUC_DB[ruc] || null : null
  const rucValido = ruc.length === 11 && cliente !== null
  const montoNum = parseFloat(monto) || 0
  const retencionMonto = retencion ? montoNum * 0.08 : 0
  const neto = montoNum - retencionMonto

  function handleContinuar() {
    if (ruc.length !== 11 || !cliente) {
      alert(t('nuevo_recibo_invalid_ruc'))
      vibrateError()
      return
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      alert(t('nuevo_recibo_invalid_monto'))
      vibrateError()
      return
    }
    dispatch(setReciboData({ ruc, cliente, monto: montoNum, formaPago, retencion }))
    vibrateLight()
    dispatch(go('ResumenRecibo'))
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
          <View className="flex-1 h-1 bg-blue-500 rounded-full" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2" accessibilityRole="header">{t('nuevo_recibo_title')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-6">{t('nuevo_recibo_subtitle')}</Text>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 shadow-sm mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('nuevo_recibo_ruc_label')}</Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base mb-2 text-gray-900 dark:text-gray-100"
            placeholder={t('nuevo_recibo_ruc_placeholder')}
            keyboardType="number-pad"
            maxLength={11}
            value={ruc}
            onChangeText={setRuc}
            accessibilityLabel={t('nuevo_recibo_ruc_label')}
            accessibilityHint={t('nuevo_recibo_ruc_hint')}
          />
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('nuevo_recibo_ruc_example')}</Text>
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

          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('nuevo_recibo_monto_label')}</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 mb-4">
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

          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('nuevo_recibo2_forma_pago')}</Text>
          <View className="flex-row flex-wrap justify-between mb-3">
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
                  <Text className="text-2xl mb-2" accessibilityElementsHidden={true}>{fp.icon}</Text>
                  <Text className={`font-semibold ${selected ? 'text-[#002f5d] dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {fp.label}
                  </Text>
                  {selected && <Text className="text-[#002f5d] dark:text-blue-300 text-lg mt-1" accessibilityElementsHidden={true}>{'\u25CF'}</Text>}
                </TouchableOpacity>
              )
            })}
          </View>

          <View className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Text className="text-base font-semibold text-gray-700 dark:text-gray-300 mr-2">{t('nuevo_recibo2_aplicar_retencion')}</Text>
                <TouchableOpacity
                  onPress={() => setShowHelpTooltip(!showHelpTooltip)}
                  className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center"
                  accessibilityLabel={t('general_help')}
                  accessibilityRole="button"
                  accessibilityHint={t('general_help_hint')}
                >
                  <Text className="text-blue-600 dark:text-blue-400 text-sm font-bold">?</Text>
                </TouchableOpacity>
              </View>
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
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {retencion ? t('nuevo_recibo2_retencion_on') : t('nuevo_recibo2_retencion_off')}
            </Text>
            {showHelpTooltip && (
              <View className="mt-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3" accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Text className="text-blue-700 dark:text-blue-300 text-sm leading-5 mb-2">
                  {t('retencion_help_text')}
                </Text>
                <TouchableOpacity
                  className="bg-[#002f5d] rounded-lg py-2 px-4 self-start"
                  onPress={() => {
                    setShowHelpTooltip(false)
                    dispatch(go('AssistantChat'))
                  }}
                  accessibilityLabel={t('retencion_ask_more')}
                  accessibilityRole="button"
                >
                  <Text className="text-white font-semibold text-xs">{t('retencion_ask_more')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {montoNum > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 shadow-sm mb-4" accessibilityLabel={`${t('nuevo_recibo2_resumen')}: ${t('nuevo_recibo2_monto_bruto')} S/ ${montoNum}, ${t('nuevo_recibo2_retencion')} ${retencion ? fmt(retencionMonto) : t('resumen_recibo_zero')}, ${t('nuevo_recibo2_neto')} S/ ${neto}`}>
            <Text className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('nuevo_recibo2_resumen')}</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500 dark:text-gray-400">{t('nuevo_recibo2_monto_bruto')}</Text>
              <Text className="text-gray-800 dark:text-gray-200 font-medium">{fmt(montoNum)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500 dark:text-gray-400">{t('nuevo_recibo2_retencion')} (8%)</Text>
              <Text className="text-red-500 dark:text-red-400 font-medium">-{fmt(retencionMonto)}</Text>
            </View>
            <View className="h-px bg-gray-200 dark:bg-gray-600 my-3" />
            <View className="flex-row justify-between">
              <Text className="text-gray-800 dark:text-gray-100 font-bold">{t('nuevo_recibo2_neto')}</Text>
              <Text className="text-xl font-extrabold" style={{ color: C.navy }}>{fmt(neto)}</Text>
            </View>
          </View>
        )}

        <View className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3 mt-4">
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

function fmt(n: number): string {
  return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
