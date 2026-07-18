import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, showModal } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { SHADOWS, C } from '../styles/theme'
import { Ionicons } from '@expo/vector-icons'
import { FadeInView } from '../components/AnimatedHelpers'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { fmt, formatearFecha } from '../store/sunatStore'

const ESTADO_LABEL: Record<string, string> = {
  pendiente_pago: 'Pendiente pago',
  emitido: 'Emitido',
  pagado: 'Pagado',
  revertido: 'Revertido',
  anulado: 'Anulado',
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pendiente_pago: { color: '#D97706', bg: '#FEF3C7' },
  emitido: { color: '#2563EB', bg: '#DBEAFE' },
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

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'MisRecibos'>

export default function MisRecibosScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [refreshing, setRefreshing] = useState(false)
  const [filterEstado, setFilterEstado] = useState<string | null>(null)
  
  // Custom Reversion modal states
  const [revertModalVisible, setRevertModalVisible] = useState(false)
  const [revertingReciboId, setRevertingReciboId] = useState<string | null>(null)
  const [revertStep, setRevertStep] = useState<1 | 2>(1)

  const emitidos = (state.recibos ?? []).filter((r) => !['revertido', 'anulado'].includes(r.estado))
  const revertidos = (state.recibos ?? []).filter((r) => ['revertido', 'anulado'].includes(r.estado))
  const filtered = filterEstado ? emitidos.filter((r) => r.estado === filterEstado) : emitidos

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }, [])

  const handleRevert = (reciboId: string) => {
    vibrateLight()
    setRevertingReciboId(reciboId)
    setRevertStep(1)
    setRevertModalVisible(true)
  }

  const handleConfirmRevert = () => {
    if (revertingReciboId) {
      dispatch({ type: 'REVERT_RECIBO', payload: revertingReciboId } as any)
      vibrateSuccess()
    }
    setRevertModalVisible(false)
    setRevertingReciboId(null)
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
          {/* Filter chips - wrapped in a robust horizontal ScrollView */}
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false} 
            className="mb-3 mt-3" 
            contentContainerStyle={{ flexDirection: 'row', gap: 6 }}
          >
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
              className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3"
              style={SHADOWS.card}
            >
              <View className="flex-row justify-between items-start mb-2.5">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">{recibo.cliente}</Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-300 mt-1">#{recibo.id} · {formatearFecha(recibo.fecha)}</Text>
                </View>
                <StatusPill status={recibo.estado} />
              </View>
              <View className="flex-row justify-between items-center gap-2">
                <View className="flex-1 min-w-[100px]">
                  <Text numberOfLines={1} adjustsFontSizeToFit className="text-xl font-extrabold" style={{ color: C.navy }}>{fmt(recibo.montoBruto)}</Text>
                  {recibo.retencion > 0 && (
                    <Text numberOfLines={1} className="text-xs text-gray-400 dark:text-gray-300">{t('mis_recibos_retencion') || 'Retención'}: {fmt(recibo.retencion)}</Text>
                  )}
                </View>
                <View className="flex-row gap-1.5 flex-shrink-0">
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
                      onPress={() => { dispatch({ type: 'MARCAR_RECIBO_PAGADO', payload: recibo.id } as any); vibrateSuccess() }}
                      accessibilityLabel={t('mis_recibos_marcar_pagado')}
                      accessibilityRole="button"
                    >
                      <Text className="text-xs font-semibold" style={{ color: '#16A34A' }}>{t('mis_recibos_marcar_pagado')}</Text>
                    </TouchableOpacity>
                  )}
                  {recibo.estado === 'emitido' && (
                    <TouchableOpacity
                      className="rounded-xl px-3 py-1.5 bg-red-100 dark:bg-red-950/40"
                      onPress={() => handleRevert(recibo.id)}
                      accessibilityLabel={`${t('revert_button') || 'Revertir'} ${recibo.id}`}
                      accessibilityRole="button"
                    >
                      <Text className="text-xs font-semibold text-red-600 dark:text-red-400">{t('revert_button') || 'Revertir'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            </FadeInView>
          ))}

          {revertidos.length > 0 && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 mt-5">{t('revert_reverted_list') || 'Recibos Revertidos'}</Text>
              {revertidos.map((recibo, idx) => (
                <FadeInView key={recibo.id} delay={idx * 50}>
                <View
                  className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 opacity-60"
                  style={SHADOWS.card}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-sm font-bold text-gray-500 dark:text-gray-300">{recibo.id}</Text>
                      <Text className="text-xs text-gray-400 dark:text-gray-300">{recibo.cliente}</Text>
                    </View>
                    <StatusPill status={recibo.estado} />
                  </View>
                </View>
                </FadeInView>
              ))}
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      )}

      {/* Reversion Modal */}
      {revertModalVisible && (
        <View className="absolute inset-0 bg-black/60 z-50 items-center justify-center p-4">
          <View className="bg-white dark:bg-gray-800 rounded-[28px] p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-gray-700">
            {revertStep === 1 ? (
              <>
                <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 items-center justify-center mb-4">
                  <Ionicons name="alert-circle" size={28} color="#DC2626" />
                </View>
                <Text className="text-gray-800 dark:text-gray-100 text-lg font-bold mb-2">
                  ¿Revertir recibo?
                </Text>
                <Text className="text-gray-600 dark:text-gray-300 text-sm leading-5 mb-4">
                  Esta acción anulará de forma permanente el recibo por honorarios seleccionado.
                </Text>
                <View className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3 mb-5">
                  <Text className="text-amber-800 dark:text-amber-300 text-xs font-semibold leading-4">
                    ⚠️ Plazo de 24h hábiles: Solo está permitido revertir comprobantes dentro de las 24 horas hábiles posteriores a su emisión.
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 min-h-[48px] justify-center items-center rounded-xl bg-gray-100 dark:bg-gray-700"
                    onPress={() => setRevertModalVisible(false)}
                    accessibilityLabel={t('general_cancelar')}
                    accessibilityRole="button"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm">{t('general_cancelar')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 min-h-[48px] justify-center items-center rounded-xl bg-red-600"
                    onPress={() => setRevertStep(2)}
                    accessibilityLabel="Continuar reversión"
                    accessibilityRole="button"
                  >
                    <Text className="text-white font-bold text-sm">Continuar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 items-center justify-center mb-4">
                  <Ionicons name="warning" size={24} color="#DC2626" />
                </View>
                <Text className="text-gray-800 dark:text-gray-100 text-lg font-bold mb-2">
                  Confirmación final
                </Text>
                <Text className="text-gray-600 dark:text-gray-300 text-sm leading-5 mb-5">
                  ¿Está seguro de que desea proceder con la reversión de este recibo? Esta operación no se puede deshacer.
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 min-h-[48px] justify-center items-center rounded-xl bg-gray-100 dark:bg-gray-700"
                    onPress={() => setRevertStep(1)}
                    accessibilityLabel="Volver al paso anterior"
                    accessibilityRole="button"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm">Atrás</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 min-h-[48px] justify-center items-center rounded-xl bg-red-600"
                    onPress={handleConfirmRevert}
                    accessibilityLabel="Confirmar y revertir permanentemente"
                    accessibilityRole="button"
                  >
                    <Text className="text-white font-bold text-sm">Revertir</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  )
}
