import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, formatearFecha, setCCI } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess, vibrateError } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

export default function MyRucScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const { user } = state
  const recibos = state.recibos ?? []
  const [showCCIModal, setShowCCIModal] = useState(false)
  const [cciInput, setCciInput] = useState(state.cci || '')

  const emitidos = useMemo(() => recibos.filter((r) => r.estado === 'emitido'), [recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const impuestoEstimado = useMemo(() => Math.max(0, totalIngresos - 7 * 5150) * 0.08, [totalIngresos])

  const handleSaveCCI = () => {
    const clean = cciInput.replace(/\s/g, '')
    if (clean.length !== 20 || !/^\d{20}$/.test(clean)) {
      vibrateError()
      return
    }
    dispatch(setCCI(clean))
    vibrateSuccess()
    setShowCCIModal(false)
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('miruc_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4" accessibilityLabel={`DNI: ${user.dni}, Tipo: ${t('miruc_tipo')}`}>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-widest">{user.dni}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('miruc_tipo')}</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4">
          <SectionRow label={t('miruc_nombre')} value={user.nombre} module="ruc" />
          <SectionRow label={t('miruc_tipo_contribuyente')} value={t('miruc_tipo_contribuyente_val')} module="ruc" />
          <View className="flex-row justify-between items-center py-2" accessibilityLabel={`${t('miruc_estado')}: ${t('miruc_activo')}`}>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-500 dark:text-gray-400">{t('miruc_estado')}</Text>
              <TouchableOpacity className="ml-1" accessibilityLabel={`${t('general_help')} ${t('miruc_estado')}`} accessibilityRole="button" accessibilityHint={t('general_help_hint')}>
                <Text className="text-blue-500 text-base font-bold">?</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
              <Text className="text-green-700 dark:text-green-400 text-xs font-bold">{t('miruc_activo')}</Text>
            </View>
          </View>
          <SectionRow label={t('miruc_condicion')} value={t('miruc_habido')} module="ruc" />
          <SectionRow label={t('miruc_inicio')} value="02/01/2024" module="ruc" />
          <SectionRow label={t('miruc_direccion')} value={user.direccion} module="ruc" />
          <SectionRow label={t('miruc_actividad_economica')} value={`6201 — ${t('miruc_actividad_val')}`} module="ruc" />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('miruc_resumen')}</Text>
          <SectionRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <SectionRow label={t('miruc_recibos_emitidos')} value={String(emitidos.length)} />
          <SectionRow label={t('miruc_impuesto_estimado')} value={fmt(impuestoEstimado)} />
        </View>

        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between mb-4 shadow-sm"
          onPress={() => { setCciInput(state.cci || ''); setShowCCIModal(true); vibrateLight() }}
          accessibilityLabel={t('cci_register')}
          accessibilityRole="button"
          accessibilityHint={t('cci_register_hint')}
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{'\uD83C\uDFE6'}</Text>
            <View>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">{t('cci_register')}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">{state.cci ? `${t('cci_registered')}: ****${state.cci.slice(-4)}` : t('cci_not_registered')}</Text>
            </View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-lg">{'\u203A'}</Text>
        </TouchableOpacity>

        <View className="h-10" />
      </View>

      <Modal visible={showCCIModal} transparent animationType="slide" onRequestClose={() => setShowCCIModal(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-2xl p-6" accessibilityViewIsModal onAccessibilityEscape={() => setShowCCIModal(false)}>
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2" accessibilityRole="header">{t('cci_register')}</Text>
            <View className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3 mb-4">
              <Text className="text-blue-700 dark:text-blue-300 text-sm leading-5">{'\uD83D\uDCA1'} {t('cci_explanation')}</Text>
            </View>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('cci_label')}</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 mb-1"
              placeholder="**** **** **** **** ****"
              keyboardType="number-pad"
              maxLength={20}
              value={cciInput}
              onChangeText={setCciInput}
              accessibilityLabel={t('cci_label')}
              accessibilityHint={t('cci_hint')}
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('cci_example')}: 00215100345678901234</Text>
            {cciInput.length === 20 && !/^\d{20}$/.test(cciInput.replace(/\s/g, '')) && (
              <Text className="text-red-500 text-sm mb-2" accessibilityRole="alert" accessibilityLiveRegion="polite">{t('cci_invalid')}</Text>
            )}
            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-3.5 items-center" onPress={() => setShowCCIModal(false)} accessibilityLabel={t('general_cancelar')} accessibilityRole="button">
                <Text className="text-gray-700 dark:text-gray-300 font-semibold">{t('general_cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-[#002f5d] rounded-lg py-3.5 items-center" onPress={handleSaveCCI} accessibilityLabel={t('general_save')} accessibilityRole="button" accessibilityHint={t('cci_save_hint')}>
                <Text className="text-white font-semibold">{t('general_save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

function SectionRow({ label, value, module }: { label: string; value: string; module?: string }) {
  const { dispatch } = useStore()
  const { t } = useTranslate()
  return (
    <View className="py-2 flex-row items-start" accessibilityLabel={`${label}: ${value}`}>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
        <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5 flex-1">{value}</Text>
      </View>
      <TouchableOpacity
        className="ml-2 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center"
        onPress={() => { dispatch(go('AssistantChat')); vibrateLight() }}
        accessibilityLabel={`${t('general_help')} ${label}`}
        accessibilityRole="button"
        accessibilityHint={t('general_help_hint')}
      >
        <Text className="text-blue-600 dark:text-blue-400 text-sm font-bold">?</Text>
      </TouchableOpacity>
    </View>
  )
}