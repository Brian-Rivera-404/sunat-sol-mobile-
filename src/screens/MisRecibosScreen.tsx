import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native'
import { Text } from '../components/AccessibleText'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { useStore, go, fmt, formatearFecha, showModal } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'

const ESTADO_LABEL: Record<string, string> = { emitido: 'Emitido', anulado: 'Anulado', revertido: 'Revertido' }

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  emitido: { color: '#16A34A', bg: '#DCFCE7' },
  revertido: { color: '#DC2626', bg: '#FEE2E2' },
  anulado: { color: '#D97706', bg: '#FEF3C7' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { color: C.s500, bg: C.s100 }
  return (
    <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg }}>
      <Text className="text-xs font-bold" style={{ color: s.color }}>{ESTADO_LABEL[status] || status}</Text>
    </View>
  )
}

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'MisRecibos'> }

export default function MisRecibosScreen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [refreshing, setRefreshing] = useState(false)
  const emitidos = (state.recibos ?? []).filter((r) => r.estado === 'emitido')
  const revertidos = (state.recibos ?? []).filter((r) => r.estado === 'revertido')

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }, [])

  const handleRevert = (reciboId: string) => {
    Alert.alert(
      t('revert_title'),
      t('revert_first_confirm'),
      [
        { text: t('general_cancelar'), style: 'cancel' },
        {
          text: t('revert_continue'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('revert_second_title'),
              t('revert_second_confirm'),
              [
                { text: t('general_cancelar'), style: 'cancel' },
                {
                  text: t('revert_confirm_final'),
                  style: 'destructive',
                  onPress: () => {
                    dispatch({ type: 'REVERT_RECIBO', payload: reciboId } as any)
                    vibrateSuccess()
                  },
                },
              ],
              { cancelable: true }
            )
          },
        },
      ],
      { cancelable: true }
    )
  }

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('mis_recibos_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1">{t('mis_recibos_title')}</Text>
        <View className="bg-white/20 rounded-full px-3 py-1">
          <Text className="text-white text-sm font-semibold">{emitidos.length}</Text>
        </View>
      </HeaderBar>

      {emitidos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4" accessibilityElementsHidden={true}>{'\uD83D\uDCC4'}</Text>
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('mis_recibos_empty')}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">{t('mis_recibos_empty_desc')}</Text>
          <TouchableOpacity
            className="bg-[#0A2240] rounded-lg py-4 px-8 items-center"
            onPress={() => dispatch(go('NuevoRecibo1'))}
            activeOpacity={0.8}
            accessibilityLabel={t('mis_recibos_primer_recibo')}
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base">{t('mis_recibos_primer_recibo')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A2240" />}
        >
          {emitidos.map((recibo) => (
            <View
              key={recibo.id}
              className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2.5">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">{recibo.cliente}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">#{recibo.id} · {formatearFecha(recibo.fecha)}</Text>
                </View>
                <StatusPill status={recibo.estado} />
              </View>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-xl font-extrabold" style={{ color: C.navy }}>{fmt(recibo.montoBruto)}</Text>
                  {recibo.retencion > 0 && (
                    <Text className="text-xs text-gray-400">{t('mis_recibos_retencion')}: {fmt(recibo.retencion)}</Text>
                  )}
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="rounded-xl px-3 py-1.5" style={{ backgroundColor: C.s100 }}
                    onPress={() => { vibrateLight(); dispatch(showModal(recibo.id)) }}
                    accessibilityLabel={`${t('mis_recibos_ver_detalle')} ${recibo.id}`}
                    accessibilityRole="button"
                  >
                    <Text className="text-xs font-semibold" style={{ color: '#475569' }}>{t('mis_recibos_ver_detalle')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-xl px-3 py-1.5" style={{ backgroundColor: '#FEE2E2' }}
                    onPress={() => handleRevert(recibo.id)}
                    accessibilityLabel={`${t('revert_button')} ${recibo.id}`}
                    accessibilityRole="button"
                  >
                    <Text className="text-xs font-semibold" style={{ color: '#DC2626' }}>{t('revert_button')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {revertidos.length > 0 && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 mt-4">{t('revert_reverted_list')}</Text>
              {revertidos.map((recibo) => (
                <View
                  key={recibo.id}
                  className="bg-white dark:bg-gray-800 rounded-[18px] p-3 mb-2 shadow-sm opacity-60"
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm font-bold text-gray-500">{recibo.id}</Text>
                      <Text className="text-xs text-gray-400">{recibo.cliente}</Text>
                    </View>
                    <StatusPill status={recibo.estado} />
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  )
}
