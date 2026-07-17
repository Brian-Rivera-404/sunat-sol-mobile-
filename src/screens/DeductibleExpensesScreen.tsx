import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, ScrollView, TextInput, Image, Alert, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, addExpense, removeExpense, fmt, formatearFecha } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess, vibrateError } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { localFAQ } from '../services/localFAQ'

const CATEGORIAS = [
  'oficina_alquiler',
  'oficina_servicios',
  'capacitacion',
  'salud',
  'educacion',
  'movilidad',
  'utiles',
  'equipamiento',
  'otros',
]

const UIT = 5150

const CATEGORIA_KEYWORDS: Record<string, string[]> = {
  capacitacion: ['curso', 'taller', 'capacitacion', 'seminario', 'diplomado', 'certificacion'],
  salud: ['medico', 'doctor', 'clinica', 'hospital', 'farmacia', 'dental', 'medicina'],
  educacion: ['colegio', 'universidad', 'instituto', 'academia', 'clases', 'estudio'],
  movilidad: ['taxi', 'uber', 'pasaje', 'combustible', 'gasolina', 'estacionamiento', 'peaje'],
  utiles: ['libreria', 'papeleria', 'lapiz', 'cuaderno', 'oficina', 'escritorio'],
  equipamiento: ['computadora', 'laptop', 'monitor', 'teclado', 'mouse', 'impresora', 'celular'],
  oficina_alquiler: ['alquiler', 'oficina', 'local', 'renta'],
  oficina_servicios: ['luz', 'agua', 'internet', 'telefono', 'electricidad'],
}

function sugerirCategoria(texto: string): string | null {
  const t = texto.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
    if (keywords.some((k) => t.includes(k))) return cat
  }
  return null
}

const EXPENSES_DB: Array<{ id: string; ruc: string; nombre: string; categoria: string }> = [
  { id: 'cat1', ruc: '20123456789', nombre: 'Centro de Capacitación Perú S.A.C.', categoria: 'capacitacion' },
  { id: 'cat2', ruc: '20123456790', nombre: 'Farmacia Universal S.A.', categoria: 'salud' },
  { id: 'cat3', ruc: '20123456791', nombre: 'Colegio San José S.A.C.', categoria: 'educacion' },
  { id: 'cat4', ruc: '20123456792', nombre: 'Taxi Seguro E.I.R.L.', categoria: 'movilidad' },
  { id: 'cat5', ruc: '20123456793', nombre: 'Librería Central S.A.', categoria: 'utiles' },
]

export default function DeductibleExpensesScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [showForm, setShowForm] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [comprobanteUri, setComprobanteUri] = useState<string | null>(null)

  const totalGastos = (state.expenses ?? []).reduce((s, e) => s + e.monto, 0)

  useEffect(() => {
    if (descripcion.trim().length >= 3) {
      const sugerida = sugerirCategoria(descripcion)
      if (sugerida && sugerida !== categoria) {
        setCategoria(sugerida)
      }
    }
  }, [descripcion])

  const handlePickImage = async () => {
    try {
      const { launchImageLibraryAsync, MediaTypeOptions } = require('expo-image-picker')
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      })
      if (!result.canceled && result.assets?.[0]) {
        setComprobanteUri(result.assets[0].uri)
      }
    } catch {}
  }

  const handleTakePhoto = async () => {
    try {
      const { launchCameraAsync } = require('expo-image-picker')
      const perm = await require('expo-image-picker').requestCameraPermissionsAsync()
      if (!perm.granted) {
        Alert.alert(t('general_error'), t('expenses_camera_perm'))
        return
      }
      const result = await launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      })
      if (!result.canceled && result.assets?.[0]) {
        setComprobanteUri(result.assets[0].uri)
      }
    } catch {}
  }

  const handleAdd = () => {
    const montoNum = parseFloat(monto)
    if (!descripcion.trim() || isNaN(montoNum) || montoNum <= 0) {
      vibrateError()
      return
    }

    const suggestedMatch = localFAQ.find(
      (faq) =>
        faq.modulo === 'gastos' &&
        descripcion.toLowerCase().includes(faq.tags[0] || '')
    )

    dispatch(
      addExpense({
        id: `EXP-${Date.now()}`,
        monto: montoNum,
        categoria,
        comprobanteUri: comprobanteUri || undefined,
        establecimientoValidado: false,
        descripcion: descripcion.trim(),
        fecha: new Date().toISOString().split('T')[0],
      })
    )
    vibrateSuccess()
    setShowForm(false)
    setDescripcion('')
    setMonto('')
    setCategoria(CATEGORIAS[0])
    setComprobanteUri(null)
  }

  return (
    <ScrollView className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('expenses_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('expenses_used')}</Text>
            <Text className="text-xl font-extrabold" style={{ color: '#0A2240' }}>{fmt(totalGastos)} / S/ {fmt(3 * UIT)}</Text>
          </View>
          <View className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View className="h-2.5 bg-[#002f5d] rounded-full" style={{ width: `${Math.min(100, (totalGastos / (3 * UIT)) * 100)}%` }} />
          </View>
        </View>

        {/* Fotografiar comprobante — prototype parity */}
        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-[16px] py-3.5 px-4 flex-row items-center justify-center mb-2.5 shadow-sm"
          style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1' }}
          onPress={handlePickImage}
          accessibilityLabel={t('expenses_scan_receipt')}
          accessibilityRole="button"
          accessibilityHint={t('expenses_scan_receipt_hint')}
        >
          <Text className="text-[22px] mr-2">{'\uD83D\uDCF8'}</Text>
          <Text className="text-sm font-bold" style={{ color: '#1B4FBF' }}>{t('expenses_scan_receipt')}</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">{(state.expenses ?? []).length} {t('expenses_count')}</Text>
          <TouchableOpacity
            className="bg-[#002f5d] rounded-xl px-5 py-3.5 items-center"
            onPress={() => { vibrateLight(); setShowForm(!showForm) }}
            accessibilityLabel={t('expenses_add')}
            accessibilityRole="button"
            accessibilityHint={t('expenses_add_hint')}
          >
            <Text className="text-white font-semibold text-sm">{t('expenses_add')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-[18px] p-4 flex-row items-center justify-between mb-2.5 shadow-sm"
          onPress={() => { vibrateLight(); dispatch(go('ValidarEstablecimientos')) }}
          accessibilityLabel={t('expenses_validate_business')}
          accessibilityRole="button"
          accessibilityHint={t('expenses_validate_business_hint')}
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{'\uD83D\uDD0D'}</Text>
            <View>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">{t('expenses_validate_business')}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">{t('expenses_validate_business_desc')}</Text>
            </View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-lg">{'\u203A'}</Text>
        </TouchableOpacity>

        {showForm && (
          <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm" accessibilityRole="none">
            <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">{t('expenses_new')}</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('expenses_description')}</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 mb-3"
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder={t('expenses_description_placeholder')}
              accessibilityLabel={t('expenses_description')}
              accessibilityHint={t('expenses_description_hint')}
            />
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('expenses_amount')}</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 mb-3"
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              placeholder="0.00"
              accessibilityLabel={t('expenses_amount')}
              accessibilityHint={t('expenses_amount_hint')}
            />
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('expenses_category')}</Text>
            <View className="flex-row flex-wrap mb-4">
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={`mr-2 mb-2 px-3 py-1.5 rounded-lg ${categoria === cat ? 'bg-[#002f5d]' : 'bg-gray-100 dark:bg-gray-700'}`}
                  onPress={() => setCategoria(cat)}
                  accessibilityLabel={t('expenses_cat_' + cat)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: categoria === cat }}
                >
                  <Text className={`text-xs font-semibold ${categoria === cat ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t('expenses_cat_' + cat)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('expenses_comprobante')}</Text>
            <View className="flex-row mb-4 space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl py-3.5 items-center"
                onPress={handlePickImage}
                accessibilityLabel={t('expenses_comprobante_gallery')}
                accessibilityRole="button"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{'\uD83D\uDDBC\uFE0F '}{t('expenses_comprobante_gallery')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl py-3.5 items-center border border-dashed border-gray-400 dark:border-gray-500"
                onPress={handleTakePhoto}
                accessibilityLabel={t('expenses_comprobante_camera')}
                accessibilityRole="button"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{'\uD83D\uDCF7 '}{t('expenses_comprobante_camera')}</Text>
              </TouchableOpacity>
            </View>
            {comprobanteUri && (
              <View className="mb-4" accessibilityLabel={t('expenses_comprobante_attached')}>
                <Image source={{ uri: comprobanteUri }} className="w-full h-32 rounded-lg mb-1" resizeMode="cover" />
                <TouchableOpacity onPress={() => setComprobanteUri(null)} accessibilityLabel={t('general_delete')}>
                  <Text className="text-red-500 text-xs text-center">{t('general_delete')}</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              className="bg-[#002f5d] rounded-xl py-3.5 items-center"
              onPress={handleAdd}
              accessibilityLabel={t('expenses_save')}
              accessibilityRole="button"
            >
              <Text className="text-white font-semibold">{t('expenses_save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {(state.expenses ?? []).length === 0 && !showForm ? (
          <View className="items-center justify-center py-16">
            <Text className="text-5xl mb-4">{'\uD83D\uDCCB'}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center">{t('expenses_empty')}</Text>
          </View>
        ) : (
          (state.expenses ?? []).map((exp) => (
            <View key={exp.id} className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-2.5 shadow-sm" accessibilityLabel={`${t('expenses_description')}: ${exp.descripcion}, ${t('expenses_amount')}: ${fmt(exp.monto)}, ${t('expenses_category')}: ${t('expenses_cat_' + exp.categoria)}, ${formatearFecha(exp.fecha)}`}>
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-row flex-1 mr-2">
                  <Text className="text-lg mr-2">{exp.establecimientoValidado ? '\u2705' : '\u274C'}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{exp.descripcion}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('expenses_cat_' + exp.categoria)}</Text>
                  </View>
                </View>
                <Text className="text-xl font-extrabold" style={{ color: '#0A2240' }}>{fmt(exp.monto)}</Text>
              </View>
              {exp.comprobanteUri && (
                <View className="mt-2">
                  <Image source={{ uri: exp.comprobanteUri }} className="w-full h-20 rounded-lg" resizeMode="cover" />
                </View>
              )}
              <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Text className="text-xs text-gray-400 dark:text-gray-500">{formatearFecha(exp.fecha)}</Text>
                <TouchableOpacity
                  className="bg-red-50 dark:bg-red-900 px-3 py-1 rounded-lg"
                  onPress={() => { dispatch(removeExpense(exp.id)); vibrateLight() }}
                  accessibilityLabel={`${t('general_delete')} ${exp.descripcion}`}
                  accessibilityRole="button"
                >
                  <Text className="text-red-600 dark:text-red-400 text-xs font-semibold">{t('general_delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </View>
    </ScrollView>
  )
}