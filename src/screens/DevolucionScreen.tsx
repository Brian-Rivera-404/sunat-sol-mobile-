import React, { useState, useMemo } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../components/AccessibleText'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { useStore, go, fmt, solicitarDevolucion, toastMsg } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import HeaderBar from '../components/HeaderBar'
import { vibrateSuccess } from '../utils/haptics'
import { C } from '../styles/theme'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Devolucion'> }

export default function DevolucionScreen({ navigation }: Props) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const devolucion = (state.devoluciones ?? []).find((d) => d.periodo === state.declarations?.[0]?.periodo)
  const cci = state.cci

  const declaracion = state.declarations?.[0]
  const saldoFavor = useMemo(() => {
    if (!declaracion) return 0
    const totalRetenciones = (state.recibos ?? []).reduce((sum, r) => sum + r.retencion, 0)
    const totalGastos = (state.expenses ?? []).reduce((sum, g) => sum + g.monto, 0)
    const ingresos = (state.recibos ?? []).reduce((sum, r) => sum + r.montoBruto, 0)
    const impuestoBruto = ingresos * 0.08
    const credito = totalRetenciones + totalGastos * 0.08
    return Math.max(0, impuestoBruto - credito)
  }, [declaracion, state.recibos, state.expenses])

  const sinSaldo = saldoFavor <= 0
  const solicitada = devolucion?.estado !== 'pendiente' && devolucion?.fechaSolicitud

  const handleSolicitar = () => {
    if (!cci) return
    dispatch(solicitarDevolucion({
      id: `DEV-${Date.now()}`,
      monto: saldoFavor,
      estado: 'pendiente',
      fechaSolicitud: new Date().toISOString().slice(0, 10),
      periodo: declaracion?.periodo ?? '2025',
    }))
    dispatch(toastMsg(t('devolucion_solicitada_titulo')))
    vibrateSuccess()
    navigation.goBack()
  }

  return (
    <View className="flex-1 bg-[#EBF0F7] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button">
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1">{t('menu_devolucion')}</Text>
      </HeaderBar>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-5 mb-4 mt-4 shadow-sm">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">{t('devolucion_periodo')}</Text>
          <Text className="text-gray-900 dark:text-gray-100 text-xl font-black mt-1">{declaracion?.periodo ?? '2025'}</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-5 mb-4 shadow-sm">
          <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">{t('devolucion_saldo_favor')}</Text>
          <Text className={`text-3xl font-black mt-1 ${sinSaldo ? 'text-gray-400' : 'text-[#16A34A]'}`}>{fmt(saldoFavor)}</Text>
          {sinSaldo && <Text className="text-gray-400 text-xs mt-2">{t('devolucion_sin_saldo')}</Text>}
        </View>

        {solicitada ? (
          <View className="bg-white dark:bg-gray-800 rounded-[18px] p-5 mb-4 shadow-sm">
            <Text className="text-[#16A34A] text-lg font-black">{'\u2705'} {t('devolucion_solicitada_titulo')}</Text>
            <Text className="text-gray-500 text-xs mt-1">{t('devolucion_fecha')}: {devolucion?.fechaSolicitud}</Text>
            <Text className="text-gray-500 text-xs">{t('devolucion_monto')}: {fmt(devolucion?.monto ?? 0)}</Text>
          </View>
        ) : (
          <>
            <View className="bg-white dark:bg-gray-800 rounded-[18px] p-5 mb-4 shadow-sm">
              <Text className="text-gray-800 dark:text-gray-200 font-bold text-base mb-3">{'\uD83C\uDFE6'} {t('devolucion_cci_titulo')}</Text>
              {cci ? (
                <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <Text className="text-gray-900 dark:text-gray-100 font-mono text-sm tracking-widest">{cci}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  className="bg-[#1B4FBF18] rounded-xl py-3 px-4 items-center"
                  onPress={() => navigation.navigate('MyRuc')}
                >
                  <Text className="text-[#1B4FBF] font-bold text-sm">{t('devolucion_registrar_cci')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              className={`rounded-[18px] py-4 items-center shadow-sm ${sinSaldo || !cci ? 'bg-gray-300 dark:bg-gray-700' : 'bg-[#0A2240]'}`}
              onPress={handleSolicitar}
              disabled={sinSaldo || !cci}
              accessibilityLabel={t('devolucion_solicitar')}
              accessibilityRole="button"
              accessibilityState={{ disabled: sinSaldo || !cci }}
            >
              <Text className={`font-bold text-sm ${sinSaldo || !cci ? 'text-gray-500' : 'text-white'}`}>
                {t('devolucion_solicitar')}
              </Text>
            </TouchableOpacity>
            <View className="h-10" />
          </>
        )}
      </ScrollView>
    </View>
  )
}
