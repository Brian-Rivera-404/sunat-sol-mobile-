import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, Linking, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, formatearFecha, MESES } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { C } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

const REFERENCIA_MERCADO = 0.12

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'Reportes'>

export default function ReportesScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()

  const emitidos = useMemo(() => (state.recibos ?? []).filter((r) => r.estado === 'emitido'), [state.recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const totalRetenciones = useMemo(() => emitidos.reduce((s, r) => s + r.retencion, 0), [emitidos])
  const totalGastos = useMemo(() => (state.expenses ?? []).reduce((s, e) => s + e.monto, 0), [state.expenses])
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

  const FORMA_PAGO_LABEL: Record<string, string> = {
    transferencia: 'Transferencia',
    efectivo: 'Efectivo',
    cheque: 'Cheque',
    deposito: 'Depósito',
  }

  function buildPDFHtml(): string {
    const lines: string[] = []
    lines.push('<!DOCTYPE html><html><head><meta charset="utf-8">')
    lines.push('<title>' + t('reportes_title') + '</title></head>')
    lines.push('<body style="font-family:sans-serif;padding:20px;">')
    lines.push('<h1>' + t('reportes_title') + '</h1>')
    lines.push('<h2>' + t('reportes_resumen_anual') + '</h2>')
    lines.push('<p>' + t('declarar_ingresos') + ': ' + fmt(totalIngresos) + '</p>')
    lines.push('<p>' + t('reportes_recibos_emitidos') + ': ' + emitidos.length + '</p>')
    lines.push('<p>' + t('reportes_promedio') + ': ' + fmt(promedio) + '</p>')
    lines.push('<p>' + t('simulator_withholdings') + ': ' + fmt(totalRetenciones) + '</p>')
    lines.push('<p>' + t('simulator_expenses') + ': ' + fmt(totalGastos) + '</p>')
    lines.push('<h2>' + t('reportes_principales_clientes') + '</h2>')
    lines.push('<ul>')
    topClientes.forEach(function(c: any) {
      lines.push('<li>' + c.nombre + ' - ' + c.count + ' recibos - ' + fmt(c.total) + '</li>')
    })
    lines.push('</ul>')
    lines.push('<p style="color:#666;font-size:12px;">' + t('simulator_not_official') + '</p>')
    lines.push('<p style="color:#999;font-size:10px;">' + t('reportes_generated') + ': ' + new Date().toLocaleDateString() + '</p>')
    lines.push('</body></html>')
    return lines.join('')
  }

  const handleExportPDF = async () => {
    vibrateLight()
    try {
      const Print = require('expo-print')
      const Sharing = require('expo-sharing')
      const html = buildPDFHtml()
      const result = await Print.printToFileAsync({ html, base64: false })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', dialogTitle: t('reportes_export_title') })
      }
      vibrateSuccess()
    } catch (e) {
      console.warn('Error exporting PDF:', e)
    }
  }

  const handleExportExcel = async () => {
    vibrateLight()
    try {
      const XLSX = require('xlsx')
      const FileSystem = require('expo-file-system')
      const Sharing = require('expo-sharing')
      const wb = XLSX.utils.book_new()
      const data = emitidos.map(function(r: any) {
        return {
          'Recibo': r.id,
          'Cliente': r.cliente,
          'RUC': r.ruc,
          'Fecha': formatearFecha(r.fecha),
          'Monto Bruto': r.montoBruto,
          'Retencion': r.retencion,
          'Neto': r.montoNeto,
          'Pago': FORMA_PAGO_LABEL[r.formaPago] || r.formaPago,
          'Estado': r.estado,
        }
      })
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, 'Reportes')
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })
      const uri = FileSystem.documentDirectory + 'sunat-reporte.xlsx'
      await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: t('reportes_export_title') })
      }
      vibrateSuccess()
    } catch (e) {
      console.warn('Error exporting Excel:', e)
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('reportes_title')}</Text>
      </HeaderBar>
      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('reportes_resumen_anual')}</Text>
          <InfoRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <InfoRow label={t('reportes_recibos_emitidos')} value={String(emitidos.length)} />
          <InfoRow label={t('reportes_promedio')} value={fmt(promedio)} />
          <InfoRow label={t('simulator_withholdings')} value={fmt(totalRetenciones)} />
          <InfoRow label={t('simulator_expenses')} value={fmt(totalGastos)} />
        </View>
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4" accessibilityRole="header">{t('reportes_ingresos_mes')}</Text>
          <View className="flex-row items-end h-32 gap-1">
            {ingresosPorMes.map((monto, i) => {
              const altura = (monto / maxMes) * 100
              return (
                <View key={i} className="flex-1 items-center" accessibilityLabel={MESES[i] + ': ' + fmt(monto)}>
                  <View className="w-full bg-[#0A2240] dark:bg-blue-400 rounded-t-sm" style={{ height: Math.max(altura, 2) as any + '%' as any }} />
                  <Text className="text-xs text-gray-400 dark:text-gray-400 mt-1">{MESES[i]}</Text>
                </View>
              )
            })}
          </View>
        </View>
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('reportes_principales_clientes')}</Text>
          {topClientes.map((c, i) => (
            <View key={i} className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0" accessibilityLabel={i + 1 + '. ' + c.nombre + ', ' + c.count + ' recibos, total ' + fmt(c.total)}>
              <View className="w-7 h-7 rounded-full bg-[#0A2240] dark:bg-blue-600 items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100" numberOfLines={1}>{c.nombre}</Text>
                <Text className="text-xs text-gray-400 dark:text-gray-400">{c.count} recibos</Text>
              </View>
              <Text className="text-xl font-extrabold" style={{ color: C.navy }}>{fmt(c.total)}</Text>
            </View>
          ))}
        </View>
        {totalIngresos > 0 && (
          <View className="bg-amber-50 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-[18px] px-4 py-3 mb-2.5" accessibilityRole="alert">
            <Text className="text-amber-800 dark:text-amber-200 text-xs leading-5">
              {'\u2139\uFE0F'} {t('simulator_market_ref')}: ~{Math.round(REFERENCIA_MERCADO * 100)}% ({fmt(totalIngresos * REFERENCIA_MERCADO)})
            </Text>
            <Text className="text-amber-700 dark:text-amber-300 text-xs mt-1">{t('simulator_not_official')}</Text>
          </View>
        )}
        <View className="flex-row mb-10">
          <TouchableOpacity className="flex-1 bg-[#0A2240] rounded-xl py-4 items-center mr-2" onPress={handleExportPDF} accessibilityLabel={t('reportes_export_pdf')} accessibilityRole="button" accessibilityHint={t('reportes_export_hint')}>
            <Text className="text-white font-bold text-sm">{'\uD83D\uDCC4'} {t('reportes_export_pdf')}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-[#0A2240] rounded-xl py-4 items-center ml-2" onPress={handleExportExcel} accessibilityLabel={t('reportes_export_excel')} accessibilityRole="button" accessibilityHint={t('reportes_export_hint')}>
            <Text className="text-white font-bold text-sm">{'\uD83D\uDCCA'} {t('reportes_export_excel')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-[18px] p-4 flex-row items-center mb-10 shadow-sm"
          onPress={() => {
            const body = encodeURIComponent(
              `Reporte tributario SUNAT SOL\n\n` +
              `${t('declarar_ingresos')}: ${fmt(totalIngresos)}\n` +
              `${t('reportes_recibos_emitidos')}: ${emitidos.length}\n` +
              `${t('reportes_promedio')}: ${fmt(promedio)}\n` +
              `${t('simulator_withholdings')}: ${fmt(totalRetenciones)}\n` +
              `${t('simulator_expenses')}: ${fmt(totalGastos)}\n\n` +
              `${t('reportes_generated')}: ${new Date().toLocaleDateString()}`
            )
            const url = Platform.OS === 'android'
              ? `https://wa.me/51999000000?text=${body}`
              : `mailto:?subject=${encodeURIComponent(t('reportes_title'))}&body=${body}`
            Linking.openURL(url).catch(() => Alert.alert(t('assistant_contact_error')))
          }}
          accessibilityLabel={t('reportes_send_accountant')}
          accessibilityRole="button"
        >
          <View className="w-[46] h-[46] rounded-[14] items-center justify-center mr-3.5" style={{ backgroundColor: '#1B4FBF18' }}>
            <Text className="text-[22px]">{'\uD83D\uDC64'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-800 dark:text-gray-200 font-bold text-sm">{t('reportes_send_accountant')}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{t('reportes_send_accountant_desc')}</Text>
          </View>
          <Text className="text-gray-300 text-[22px]">{'\u203A'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-1.5" accessibilityLabel={label + ': ' + value}>
      <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
      <Text className="text-xl font-extrabold" style={{ color: C.navy }}>{value}</Text>
    </View>
  )
}
