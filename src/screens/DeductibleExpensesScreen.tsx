import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native'
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
        comprobanteUri: undefined,
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
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('expenses_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">{(state.expenses ?? []).length} {t('expenses_count')}</Text>
          <TouchableOpacity
            className="bg-[#002f5d] rounded-lg px-5 py-2.5"
            onPress={() => { vibrateLight(); setShowForm(!showForm) }}
            accessibilityLabel={t('expenses_add')}
            accessibilityRole="button"
            accessibilityHint={t('expenses_add_hint')}
          >
            <Text className="text-white font-semibold text-sm">{t('expenses_add')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between mb-4 shadow-sm"
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
          <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4" accessibilityRole="none">
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
            <TouchableOpacity
              className="bg-[#002f5d] rounded-lg py-3 items-center"
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
            <View key={exp.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm" accessibilityLabel={`${t('expenses_description')}: ${exp.descripcion}, ${t('expenses_amount')}: ${fmt(exp.monto)}, ${t('expenses_category')}: ${t('expenses_cat_' + exp.categoria)}, ${formatearFecha(exp.fecha)}`}>
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{exp.descripcion}</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('expenses_cat_' + exp.categoria)}</Text>
                </View>
                <Text className="text-sm font-bold text-red-500">{fmt(exp.monto)}</Text>
              </View>
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