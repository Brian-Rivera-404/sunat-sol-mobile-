import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, formatearFecha, setCCI } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess, vibrateError } from '../utils/haptics'
import { sanitizeInput } from '../utils/validators'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'MyRuc'>

export default function MyRucScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const { user } = state
  const recibos = state.recibos ?? []
  const [showCCIModal, setShowCCIModal] = useState(false)
  const [cciInput, setCciInput] = useState(state.cci || '')
  const [showFullCCI, setShowFullCCI] = useState(false)

  const initial = (user?.nombre || 'U').charAt(0).toUpperCase()

  const emitidos = useMemo(() => recibos.filter((r) => r.estado === 'emitido'), [recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const impuestoEstimado = useMemo(() => Math.max(0, totalIngresos - 7 * 5150) * 0.08, [totalIngresos])

  const handleSaveCCI = () => {
    const clean = sanitizeInput(cciInput).replace(/\s/g, '')
    if (clean.length !== 20 || !/^\d{20}$/.test(clean)) {
      vibrateError()
      return
    }
    dispatch(setCCI(clean))
    vibrateSuccess()
    setShowCCIModal(false)
  }

  const fields = [
    { label: t('miruc_ruc'), value: '10456789123' },
    { label: t('miruc_razon_social'), value: user?.nombre?.toUpperCase() || '' },
    { label: t('miruc_regimen'), value: t('miruc_regimen_value') },
    { label: t('miruc_estado'), value: '\u25CF ' + t('miruc_estado_value') },
    { label: t('miruc_direccion'), value: user?.direccion || '' },
    { label: t('miruc_correo'), value: user?.email || '' },
    { label: t('miruc_celular'), value: user?.tel || '' },
    { label: t('miruc_cci'), value: state.cci ? `BCP ${showFullCCI ? state.cci : '****' + state.cci.slice(-4)}` : t('miruc_cci_empty') },
  ]

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold" accessibilityRole="header">{t('miruc_title')}</Text>
      </HeaderBar>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-[18] flex-row items-center gap-4 mb-3 shadow-sm">
          <View className="w-[58] h-[58] rounded-full items-center justify-center" style={{ backgroundColor: C.blue }}>
            <Text className="text-white text-2xl font-extrabold">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold" style={{ color: C.navy }}>{user?.nombre || ''}</Text>
            <Text className="text-xs font-bold mt-0.5" style={{ color: '#16A34A' }}>{'\u25CF'} {t('miruc_estado_value')}</Text>
          </View>
        </View>

        {/* Fields card */}
        <View className="bg-white dark:bg-gray-800 rounded-[18px] shadow-sm overflow-hidden">
          {fields.map((f, i) => (
            <View
              key={f.label}
              className="flex-row justify-between items-center px-4"
              style={{ paddingVertical: 10, borderBottomWidth: i < fields.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}
            >
              <Text className="text-xs" style={{ color: C.s500 }}>{f.label}</Text>
              <Text className="text-xs font-semibold text-right max-w-[58%]" style={{ color: '#1E293B' }}>{f.value}</Text>
            </View>
          ))}
        </View>

        {/* CCI toggle */}
        {state.cci && (
          <TouchableOpacity
            className="mt-2 mb-1 px-1 py-2"
            onPress={() => setShowFullCCI(!showFullCCI)}
            accessibilityLabel={showFullCCI ? t('cci_hide_full') : t('cci_show_full')}
            accessibilityRole="button"
          >
            <Text className="text-xs font-semibold" style={{ color: C.blue }}>{showFullCCI ? t('general_hide') : t('general_show')} CCI</Text>
          </TouchableOpacity>
        )}

        {/* Actualizar datos button */}
        <TouchableOpacity
          className="w-full mt-4 rounded-[16px] py-3.5 items-center"
          style={{ backgroundColor: C.s100, borderWidth: 1.5, borderColor: C.s200 }}
          onPress={() => { vibrateLight(); setCciInput(state.cci || ''); setShowCCIModal(true) }}
          accessibilityLabel={t('miruc_actualizar')}
          accessibilityRole="button"
        >
          <Text className="text-sm font-bold" style={{ color: '#475569' }}>{t('miruc_actualizar')}</Text>
        </TouchableOpacity>

        <View className="h-8" />
      </ScrollView>

      {/* CCI Modal */}
      <Modal visible={showCCIModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t('cci_register')}</Text>
            <Text className="text-xs text-gray-500 mb-4">{t('cci_desc')}</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100"
              keyboardType="number-pad"
              maxLength={20}
              value={cciInput}
              onChangeText={setCciInput}
              accessibilityLabel={t('cci_register')}
            />
            <Text className="text-xs text-gray-400 mt-1 mb-4">{t('cci_hint')}</Text>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => setShowCCIModal(false)}
                accessibilityLabel={t('general_cancelar')}
                accessibilityRole="button"
              >
                <Text className="text-gray-500 font-semibold">{t('general_cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg" style={{ backgroundColor: C.navy }}
                onPress={handleSaveCCI}
                accessibilityLabel={t('general_guardar')}
                accessibilityRole="button"
              >
                <Text className="text-white font-semibold">{t('general_guardar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
