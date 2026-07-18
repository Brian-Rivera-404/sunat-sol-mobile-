import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, Linking, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, goBack, fmt, formatearFecha, MESES } from '../store/sunatStore'
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
    const isEs = state.language === 'es'
    const title = isEs ? 'REPORTE TRIBUTARIO DE CUARTA CATEGORÍA' : 'FOURTH CATEGORY TAX REPORT'
    const subtitle = isEs ? 'SUNAT SOL Móvil - Reporte Oficial' : 'SUNAT SOL Mobile - Official Report'
    const section1 = isEs ? 'Resumen Anual' : 'Annual Summary'
    const section2 = isEs ? 'Principales Clientes' : 'Top Clients'
    
    const lines: string[] = []
    lines.push('<!DOCTYPE html><html><head><meta charset="utf-8">')
    lines.push('<title>' + title + '</title>')
    lines.push('<style>')
    lines.push('body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; line-height: 1.6; }')
    lines.push('.header { border-bottom: 3px solid #1B4FBF; padding-bottom: 20px; margin-bottom: 30px; }')
    lines.push('.logo-text { font-size: 26px; font-weight: bold; color: #0A2240; letter-spacing: 1px; }')
    lines.push('.logo-sub { font-size: 13px; color: #64748B; margin-top: 4px; text-transform: uppercase; font-weight: 600; }')
    lines.push('.report-title { font-size: 20px; font-weight: 800; color: #1E293B; margin-top: 30px; margin-bottom: 10px; text-transform: uppercase; }')
    lines.push('.card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 30px; }')
    lines.push('.row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E2E8F0; }')
    lines.push('.row:last-child { border-bottom: none; }')
    lines.push('.label { font-size: 14px; color: #64748B; font-weight: 500; }')
    lines.push('.value { font-size: 15px; color: #0F172A; font-weight: 700; }')
    lines.push('.table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }')
    lines.push('.table th { background-color: #0A2240; color: #ffffff; text-align: left; padding: 12px; font-size: 13px; font-weight: 600; }')
    lines.push('.table td { padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #334155; }')
    lines.push('.table tr:nth-child(even) td { background-color: #F8FAFC; }')
    lines.push('.footer { border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 50px; text-align: center; }')
    lines.push('.disclaimer { font-size: 11px; color: #94A3B8; line-height: 1.5; margin-bottom: 10px; }')
    lines.push('.date { font-size: 11px; color: #64748B; font-weight: 500; }')
    lines.push('</style></head>')
    lines.push('<body>')
    
    // Header
    lines.push('<div class="header">')
    lines.push('<div class="logo-text">SUNAT</div>')
    lines.push('<div class="logo-sub">' + subtitle + '</div>')
    lines.push('</div>')
    
    // Title
    lines.push('<div class="report-title">' + title + '</div>')
    
    // User info
    lines.push('<div style="margin-bottom: 25px; font-size: 13px; color: #475569;">')
    lines.push('<strong>Contribuyente:</strong> ' + state.user.nombre + ' | <strong>RUC:</strong> ' + state.user.dni + '<br/>')
    lines.push('<strong>Fecha de Emisión:</strong> ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString())
    lines.push('</div>')
    
    // Summary Card
    lines.push('<div class="report-title">' + section1 + '</div>')
    lines.push('<div class="card">')
    lines.push('<div class="row"><div class="label">' + t('declarar_ingresos') + '</div><div class="value">' + fmt(totalIngresos) + '</div></div>')
    lines.push('<div class="row"><div class="label">' + t('reportes_recibos_emitidos') + '</div><div class="value">' + emitidos.length + '</div></div>')
    lines.push('<div class="row"><div class="label">' + t('reportes_promedio') + '</div><div class="value">' + fmt(promedio) + '</div></div>')
    lines.push('<div class="row"><div class="label">' + t('simulator_withholdings') + '</div><div class="value">' + fmt(totalRetenciones) + '</div></div>')
    lines.push('<div class="row"><div class="label">' + t('simulator_expenses') + '</div><div class="value">' + fmt(totalGastos) + '</div></div>')
    lines.push('</div>')
    
    // Top Clients Table
    lines.push('<div class="report-title">' + section2 + '</div>')
    lines.push('<table class="table">')
    lines.push('<thead><tr><th>#</th><th>' + t('mis_recibos_cliente') + '</th><th style="text-align:right;">Recibos</th><th style="text-align:right;">Total</th></tr></thead>')
    lines.push('<tbody>')
    topClientes.forEach(function(c: any, index: number) {
      lines.push('<tr>')
      lines.push('<td>' + (index + 1) + '</td>')
      lines.push('<td><strong>' + c.nombre + '</strong></td>')
      lines.push('<td style="text-align:right;">' + c.count + '</td>')
      lines.push('<td style="text-align:right; font-weight:700; color:#0A2240;">' + fmt(c.total) + '</td>')
      lines.push('</tr>')
    })
    lines.push('</tbody>')
    lines.push('</table>')
    
    // Footer
    lines.push('<div class="footer">')
    lines.push('<div class="disclaimer">' + t('simulator_not_official') + '</div>')
    lines.push('<div class="date">' + t('reportes_generated') + ': ' + new Date().toLocaleDateString() + '</div>')
    lines.push('</div>')
    
    lines.push('</body></html>')
    return lines.join('')
  }
  const handleExportPDF = async () => {
    vibrateLight()
    try {
      if (Platform.OS === 'web') {
        const { jsPDF } = require('jspdf')
        const doc = new jsPDF()
        const isEs = state.language === 'es'
        
        // --- 1. HEADER BANNER ---
        doc.setFillColor(0, 47, 93) // SUNAT Blue
        doc.rect(0, 0, 210, 40, 'F')
        
        doc.setFillColor(253, 184, 19) // SUNAT Gold
        doc.rect(0, 40, 210, 3, 'F')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(22)
        doc.setTextColor(255, 255, 255)
        doc.text('SUNAT SOL', 20, 26)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(230, 240, 255)
        doc.text(isEs ? 'Reporte Tributario Oficial - Renta de 4ta Categoría' : 'Official Tax Report - 4th Category Income', 20, 34)
        
        // --- 2. CONTRIBUYENTE INFO CARD ---
        doc.setFillColor(245, 247, 250)
        doc.roundedRect(20, 52, 170, 35, 3, 3, 'F')
        doc.setDrawColor(218, 225, 233)
        doc.setLineWidth(0.5)
        doc.roundedRect(20, 52, 170, 35, 3, 3, 'D')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(15, 23, 42)
        doc.text(isEs ? 'INFORMACIÓN DEL CONTRIBUYENTE' : 'TAXPAYER INFORMATION', 25, 60)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(71, 85, 105)
        doc.text(`${isEs ? 'Nombre' : 'Name'}: ${state.user.nombre}`, 25, 68)
        doc.text(`RUC: ${state.user.dni || '10456789123'}`, 25, 74)
        doc.text(`${isEs ? 'Fecha de Generación' : 'Date Generated'}: ${new Date().toLocaleString('es-PE')}`, 25, 80)
        
        doc.text(`${isEs ? 'Dirección' : 'Address'}: ${state.user.direccion}`, 105, 68)
        doc.text(`${isEs ? 'Correo' : 'Email'}: ${state.user.email}`, 105, 74)
        doc.text(`${isEs ? 'Teléfono' : 'Phone'}: ${state.user.tel}`, 105, 80)
        
        // --- 3. RESUMEN DE INGRESOS Y GASTOS ---
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(0, 47, 93)
        doc.text(isEs ? 'Resumen Financiero Anual' : 'Annual Financial Summary', 20, 102)
        
        doc.setFillColor(0, 47, 93)
        doc.rect(20, 106, 170, 8, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(255, 255, 255)
        doc.text(isEs ? 'Concepto' : 'Concept', 25, 111)
        doc.text(isEs ? 'Monto Acumulado' : 'Accumulated Amount', 185, 111, { align: 'right' })
        
        const summaryRows = [
          { label: t('declarar_ingresos'), val: fmt(totalIngresos) },
          { label: t('reportes_recibos_emitidos'), val: String(emitidos.length) },
          { label: t('reportes_promedio'), val: fmt(promedio) },
          { label: t('simulator_withholdings'), val: fmt(totalRetenciones) },
          { label: t('simulator_expenses'), val: fmt(totalGastos) }
        ]
        
        let yPos = 120
        summaryRows.forEach((row, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(245, 247, 250)
            doc.rect(20, yPos - 5, 170, 8, 'F')
          }
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(71, 85, 105)
          doc.text(row.label, 25, yPos)
          
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(15, 23, 42)
          doc.text(row.val, 185, yPos, { align: 'right' })
          
          doc.setDrawColor(230, 235, 242)
          doc.line(20, yPos + 3, 190, yPos + 3)
          
          yPos += 8
        })
        
        // --- 4. TOP CLIENTES TABLE ---
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(0, 47, 93)
        doc.text(isEs ? 'Principales Clientes (Top 5)' : 'Top 5 Clients', 20, 170)
        
        doc.setFillColor(0, 47, 93)
        doc.rect(20, 174, 170, 8, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(255, 255, 255)
        doc.text('#', 23, 179)
        doc.text(isEs ? 'Razón Social / Cliente' : 'Client Name', 35, 179)
        doc.text(isEs ? 'Recibos' : 'Receipts', 145, 179, { align: 'right' })
        doc.text('Total', 185, 179, { align: 'right' })
        
        let tableY = 188
        topClientes.forEach((c: any, index: number) => {
          if (index % 2 === 1) {
            doc.setFillColor(245, 247, 250)
            doc.rect(20, tableY - 5, 170, 8, 'F')
          }
          
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(71, 85, 105)
          doc.text(String(index + 1), 23, tableY)
          doc.text(c.nombre.substring(0, 45), 35, tableY)
          doc.text(String(c.count), 145, tableY, { align: 'right' })
          
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(15, 23, 42)
          doc.text(fmt(c.total), 185, tableY, { align: 'right' })
          
          doc.setDrawColor(230, 235, 242)
          doc.line(20, tableY + 3, 190, tableY + 3)
          tableY += 8
        })
        
        // --- 5. FOOTER / BARCODE ---
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.line(20, 255, 190, 255)
        
        doc.setFillColor(71, 85, 105)
        let barX = 20
        for (let i = 0; i < 40; i++) {
          const w = Math.random() > 0.5 ? 1.5 : 0.5
          doc.rect(barX, 258, w, 6, 'F')
          barX += w + (Math.random() > 0.5 ? 1 : 0.5)
        }
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(148, 163, 184)
        doc.text(isEs ? 'Reporte informativo autogenerado localmente. Sin firma legal requerida.' : 'Information report auto-generated locally. No legal signature required.', 20, 271)
        doc.text(isEs ? 'SUNAT - Superintendencia Nacional de Aduanas y de Administración Tributaria' : 'SUNAT - National Superintendency of Customs and Tax Administration', 20, 276)
        
        doc.setFont('helvetica', 'normal')
        doc.text('Página 1 de 1', 185, 276, { align: 'right' })
        
        doc.save('sunat-reporte.pdf')
        vibrateSuccess()
        return
      }
      
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
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Reportes')

      if (Platform.OS === 'web') {
        XLSX.writeFile(wb, 'sunat-reporte.xlsx')
        vibrateSuccess()
        return
      }

      const FileSystem = require('expo-file-system')
      const Sharing = require('expo-sharing')
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
        <TouchableOpacity onPress={() => dispatch(goBack())} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('reportes_title')}</Text>
      </HeaderBar>
      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('reportes_resumen_anual')}</Text>
          <InfoRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <InfoRow label={t('reportes_recibos_emitidos')} value={String(emitidos.length)} />
          <InfoRow label={t('reportes_promedio')} value={fmt(promedio)} />
          <InfoRow label={t('simulator_withholdings')} value={fmt(totalRetenciones)} />
          <InfoRow label={t('simulator_expenses')} value={fmt(totalGastos)} />
        </View>
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4" accessibilityRole="header">{t('reportes_ingresos_mes')}</Text>
          <View className="flex-row items-end h-32 gap-1">
            {ingresosPorMes.map((monto, i) => {
              const altura = (monto / maxMes) * 80
              return (
                <View key={i} className="flex-1 items-center h-full justify-end" accessibilityLabel={MESES[i] + ': ' + fmt(monto)}>
                  <View className="w-full bg-[#0A2240] dark:bg-blue-400 rounded-t-sm" style={{ height: (Math.max(altura, 2) + '%') as any }} />
                  <Text className="text-[10px] text-gray-400 dark:text-gray-400 mt-1">{MESES[i]}</Text>
                </View>
              )
            })}
          </View>
        </View>
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3 shadow-sm">
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
              <Text 
                numberOfLines={1} 
                adjustsFontSizeToFit 
                className="text-xl font-extrabold text-[#0A2240] dark:text-blue-300 flex-shrink-0 text-right min-w-[100px]"
              >
                {fmt(c.total)}
              </Text>
            </View>
          ))}
        </View>
        {totalIngresos > 0 && (
          <View className="bg-amber-50 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-[18px] px-4 py-3 mb-3" accessibilityRole="alert">
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
            <Text className="text-gray-400 text-xs mt-1">{t('reportes_send_accountant_desc')}</Text>
          </View>
          <Text className="text-gray-300 text-[22px]">{'\u203A'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2.5 gap-2" accessibilityLabel={label + ': ' + value}>
      <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1 mr-2">{label}</Text>
      <Text 
        numberOfLines={1} 
        adjustsFontSizeToFit 
        className="text-xl font-extrabold text-[#0A2240] dark:text-blue-300 flex-shrink-0 text-right min-w-[100px]"
      >
        {value}
      </Text>
    </View>
  )
}
