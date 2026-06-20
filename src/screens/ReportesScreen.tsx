import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, MESES } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import HeaderBar from '../components/HeaderBar'

export default function ReportesScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()

  const emitidos = useMemo(() => state.recibos.filter((r) => r.estado === 'emitido'), [state.recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const promedio = useMemo(() => (emitidos.length > 0 ? totalIngresos / emitidos.length : 0), [emitidos, totalIngresos])

  const ingresosPorMes = useMemo(() => {
    const meses = Array(12).fill(0)
    emitidos.forEach((r) => {
      const mes = parseInt(r.fecha.split('-')[1], 10) - 1
      if (mes >= 0 && mes < 12) meses[mes] += r.montoBruto
    })
    return meses
  }, [emitidos])

  const maxMes = useMemo(() => Math.max(...ingresosPorMes, 1), [ingresosPorMes])

  const topClientes = useMemo(() => {
    const map: Record<string, { nombre: string; total: number; count: number }> = {}
    emitidos.forEach((r) => {
      if (!map[r.ruc]) map[r.ruc] = { nombre: r.cliente, total: 0, count: 0 }
      map[r.ruc].total += r.montoBruto
      map[r.ruc].count += 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [emitidos])

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
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('reportes_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('reportes_resumen_anual')}</Text>
          <InfoRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <InfoRow label={t('reportes_recibos_emitidos')} value={String(emitidos.length)} />
          <InfoRow label={t('reportes_promedio')} value={fmt(promedio)} />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4" accessibilityRole="header">{t('reportes_ingresos_mes')}</Text>
          <View className="flex-row items-end h-32 gap-1">
            {ingresosPorMes.map((monto, i) => {
              const altura = (monto / maxMes) * 100
              return (
                <View key={i} className="flex-1 items-center" accessibilityLabel={`${MESES[i]}: ${fmt(monto)}`}>
                  <View
                    className="w-full bg-[#002f5d] dark:bg-blue-400 rounded-t-sm"
                    style={{ height: `${Math.max(altura, 2)}%` }}
                  />
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{MESES[i]}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-10">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('reportes_principales_clientes')}</Text>
          {topClientes.map((c, i) => (
            <View key={i} className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0" accessibilityLabel={`${i + 1}. ${c.nombre}, ${c.count} ${t('reportes_recibo')}${c.count !== 1 ? 's' : ''}, ${t('reportes_total')} ${fmt(c.total)}`}>
              <View className="w-7 h-7 rounded-full bg-[#002f5d] dark:bg-blue-600 items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100" numberOfLines={1}>
                  {c.nombre}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">{c.count} {t('reportes_recibo')}{c.count !== 1 ? 's' : ''}</Text>
              </View>
              <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(c.total)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-1.5" accessibilityLabel={`${label}: ${value}`}>
      <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
      <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</Text>
    </View>
  )
}
