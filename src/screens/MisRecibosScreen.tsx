import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../components/AccessibleText'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { useStore, go, fmt, formatearFecha, showModal, marcarReciboPagado } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { FadeInView } from '../components/AnimatedHelpers'
import { C, SHADOWS } from '../styles/theme'

const ESTADO_LABEL: Record<string, string> = { emitido: 'Emitido', pendiente_pago: 'Pendiente pago', pagado: 'Pagado', anulado: 'Anulado', revertido: 'Revertido' }

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  emitido: { color: '#16A34A', bg: '#DCFCE7' },
  pendiente_pago: { color: '#D97706', bg: '#FEF3C7' },
  pagado: { color: '#16A34A', bg: '#DCFCE7' },
  revertido: { color: '#DC2626', bg: '#FEE2E2' },
  anulado: { color: '#94A3B8', bg: '#F1F5F9' },
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
  const [filterEstado, setFilterEstado] = useState<string | null>(null)
  const emitidos = (state.recibos ?? []).filter((r) => !['revertido', 'anulado'].includes(r.estado))
  const revertidos = (state.recibos ?? []).filter((r) => ['revertido', 'anulado'].includes(r.estado))
  const filtered = filterEstado ? emitidos.filter((r) => r.estado === filterEstado) : emitidos

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
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1">{t('mis_recibos_title')}</Text>
        <View className="bg-white/20 rounded-full px-3 py-1">
          <Text className="text-white text-sm font-semibold">{emitidos.length}</Text>
        </View>
      </HeaderBar>

      {emitidos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="document-text-outline" size={56} color={C.s300} style={{ marginBottom: 16 }} />
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
          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 6 }}>
            {[
              { key: null, label: t('general_all') },
              { key: 'pendiente_pago', label: t('mis_recibos_pendientes') },
              { key: 'emitido', label: t('estado_emitido') },
              { key: 'pagado', label: t('estado_pagado') },
            ].map((f) => (
              <TouchableOpacity
                key={f.key ?? 'all'}
                className={`px-4 py-2 rounded-full ${filterEstado === f.key ? 'bg-[#002f5d]' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'}`}
                onPress={() => setFilterEstado(f.key)}
                accessibilityLabel={f.label}
                accessibilityRole="button"
                accessibilityState={{ selected: filterEstado === f.key }}
              >
                <Text className={`text-xs font-semibold ${filterEstado === f.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filtered.map((recibo, idx) => (
            <FadeInView key={recibo.id} delay={idx * 50}>
            <View
              className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5"
              style={SHADOWS.card}
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
                  {recibo.estado === 'pendiente_pago' && (
                    <TouchableOpacity
                      className="rounded-xl px-3 py-1.5" style={{ backgroundColor: '#DCFCE7' }}
                      onPress={() => { dispatch(marcarReciboPagado(recibo.id)); vibrateSuccess() }}
                      accessibilityLabel={t('mis_recibos_marcar_pagado')}
                      accessibilityRole="button"
                    >
                      <Text className="text-xs font-semibold" style={{ color: '#16A34A' }}>{t('mis_recibos_marcar_pagado')}</Text>
                    </TouchableOpacity>
                  )}
                  {recibo.estado === 'emitido' && (
                    <TouchableOpacity
                      className="rounded-xl px-3 py-1.5" style={{ backgroundColor: '#FEE2E2' }}
                      onPress={() => handleRevert(recibo.id)}
                      accessibilityLabel={`${t('revert_button')} ${recibo.id}`}
                      accessibilityRole="button"
                    >
                      <Text className="text-xs font-semibold" style={{ color: '#DC2626' }}>{t('revert_button')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            </FadeInView>
          ))}

          {revertidos.length > 0 && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 mt-4">{t('revert_reverted_list')}</Text>
              {revertidos.map((recibo, idx) => (
                <FadeInView key={recibo.id} delay={idx * 50}>
                <View
                  className="bg-white dark:bg-gray-800 rounded-[18px] p-3 mb-2 opacity-60"
                  style={SHADOWS.card}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm font-bold text-gray-500">{recibo.id}</Text>
                      <Text className="text-xs text-gray-400">{recibo.cliente}</Text>
                    </View>
                    <StatusPill status={recibo.estado} />
                  </View>
                </View>
                </FadeInView>
              ))}
            </View>
          )}

          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  )
}
