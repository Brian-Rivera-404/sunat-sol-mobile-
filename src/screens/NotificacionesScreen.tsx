import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, fmt, formatearFecha } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import HeaderBar from '../components/HeaderBar'

export default function NotificacionesScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const emitidos = state.recibos.filter(r => r.estado === 'emitido')

  const items = [
    { tipo: 'warning', icono: '\u26A0', titulo: t('notif_declaracion_pendiente'), desc: t('notif_declaracion_desc'), time: t('notif_hace_1_min') },
    ...emitidos.slice(0, 5).map((r, i) => ({
      tipo: i === 0 ? 'success' : 'info',
      icono: i === 0 ? '\u2713' : '\u2139',
      titulo: t('notif_recibo') + ` ${r.id}`,
      desc: t('notif_recibo_desc').replace('{cliente}', r.cliente).replace('{monto}', fmt(r.montoBruto)),
      time: formatearFecha(r.fecha),
    })),
  ]

  const handleBack = () => {
    dispatch(go('Home'))
    navigation.goBack()
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={handleBack} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('notif_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-white font-bold text-xl" accessibilityRole="header">{t('notif_title')}</Text>
          <Text className="text-blue-200 text-sm" accessibilityLabel={`${items.length} ${t('notif_count')}`}>{items.length} {t('notif_count')}</Text>
        </View>
      </HeaderBar>
      <ScrollView className="flex-1 px-4 pt-4">
        {items.map((item, i) => (
          <View
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 flex-row items-start shadow-sm"
            accessibilityLabel={`${item.titulo}: ${item.desc}`}
          >
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${item.tipo === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' : item.tipo === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
              <Text className={`text-sm ${item.tipo === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : item.tipo === 'success' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} accessibilityElementsHidden={true}>{item.icono}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.titulo}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">{item.desc}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
