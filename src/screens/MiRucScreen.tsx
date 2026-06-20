import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import HeaderBar from '../components/HeaderBar'

export default function MiRucScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const { user, recibos } = state

  const emitidos = useMemo(() => recibos.filter((r) => r.estado === 'emitido'), [recibos])
  const totalIngresos = useMemo(() => emitidos.reduce((s, r) => s + r.montoBruto, 0), [emitidos])
  const impuestoEstimado = useMemo(() => Math.max(0, totalIngresos - 7 * 5150) * 0.08, [totalIngresos])

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
        <Text className="text-white text-xl font-bold" accessibilityRole="header">{t('miruc_title')}</Text>
      </HeaderBar>

      <View className="px-4 pt-6">
        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4" accessibilityLabel={`DNI: ${user.dni}, Tipo: ${t('miruc_tipo')}`}>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-widest">{user.dni}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('miruc_tipo')}</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4">
          <SectionRow label={t('miruc_nombre')} value={user.nombre} />
          <SectionRow label={t('miruc_tipo_contribuyente')} value={t('miruc_tipo_contribuyente_val')} />
          <View className="flex-row justify-between items-center py-2" accessibilityLabel={`${t('miruc_estado')}: ${t('miruc_activo')}`}>
            <Text className="text-sm text-gray-500 dark:text-gray-400">{t('miruc_estado')}</Text>
            <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
              <Text className="text-green-700 dark:text-green-400 text-xs font-bold">{t('miruc_activo')}</Text>
            </View>
          </View>
          <SectionRow label={t('miruc_condicion')} value={t('miruc_habido')} />
          <SectionRow label={t('miruc_inicio')} value="02/01/2024" />
          <SectionRow label={t('miruc_direccion')} value={user.direccion} />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4" accessibilityLabel={`${t('miruc_actividad_economica')}: 6201 ${t('miruc_actividad_val')}`}>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('miruc_actividad_economica')}</Text>
          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            6201 — {t('miruc_actividad_val')}
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-10">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3" accessibilityRole="header">{t('miruc_resumen')}</Text>
          <SectionRow label={t('declarar_ingresos')} value={fmt(totalIngresos)} />
          <SectionRow label={t('miruc_recibos_emitidos')} value={String(emitidos.length)} />
          <SectionRow label={t('miruc_impuesto_estimado')} value={fmt(impuestoEstimado)} />
        </View>
      </View>
    </ScrollView>
  )
}

function SectionRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-2" accessibilityLabel={`${label}: ${value}`}>
      <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{value}</Text>
    </View>
  )
}
