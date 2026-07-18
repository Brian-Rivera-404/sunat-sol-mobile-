import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../components/AccessibleText'
import { useStore, go, formatearFecha, addTramite } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess, vibrateError } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'
import { FadeInView } from '../components/AnimatedHelpers'
import { C, SHADOWS } from '../styles/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

const TRAMITE_STATUS: Record<string, { color: string; bg: string; labelKey: string }> = {
  en_revision: { color: C.amberDark, bg: C.amberBg, labelKey: 'tramites_status_review' },
  aprobado: { color: C.greenDark, bg: C.greenBg, labelKey: 'tramites_status_approved' },
  rechazado: { color: C.redDark, bg: C.redBg, labelKey: 'tramites_status_rejected' },
  subsanacion: { color: C.blue, bg: C.blueBg, labelKey: 'tramites_status_correction' },
}

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'Tramites'>

export default function TramitesScreen({ navigation }: { navigation: ScreenNav }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [showForm, setShowForm] = useState(false)
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const tramites = state.tramites ?? []

  const handleSubmit = () => {
    if (!tipo.trim() || !descripcion.trim()) {
      setError(t('login_errors_required'))
      vibrateError()
      return
    }
    setError(null)
    dispatch(addTramite({
      id: `TR-${Date.now()}`,
      tipo: tipo.trim(),
      descripcion: descripcion.trim(),
      fechaPresentacion: new Date().toISOString().split('T')[0],
      estado: 'en_revision',
    }))
    vibrateSuccess()
    setShowForm(false)
    setTipo('')
    setDescripcion('')
  }

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1" accessibilityRole="header">{t('tramites_title')}</Text>
        <TouchableOpacity
          className="bg-white/20 rounded-xl min-w-[48px] min-h-[48px] items-center justify-center"
          onPress={() => { vibrateLight(); setError(null); setTipo(''); setDescripcion(''); setShowForm(true) }}
          accessibilityLabel={t('tramites_new')}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </HeaderBar>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {tramites.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="clipboard-outline" size={56} color={C.s300} style={{ marginBottom: 16 }} />
            <Text className="text-gray-500 dark:text-gray-400 text-center">{t('tramites_empty')}</Text>
          </View>
        ) : (
          tramites.map((tr, idx) => {
            const s = TRAMITE_STATUS[tr.estado] ?? { color: C.s500, bg: C.s100, labelKey: tr.estado }
            return (
              <FadeInView key={tr.id} delay={idx * 50}>
              <View className="bg-white dark:bg-gray-800 rounded-[18px] p-4 mb-3" style={SHADOWS.card}>
                <View className="flex-row justify-between items-start mb-2.5">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr.tipo}</Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-300 mt-1">{tr.descripcion}</Text>
                  </View>
                  <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg }}>
                    <Text className="text-xs font-bold" style={{ color: s.color }}>{t(s.labelKey)}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Text className="text-xs text-gray-400 dark:text-gray-300">{t('tramites_presentacion')}: {formatearFecha(tr.fechaPresentacion)}</Text>
                  {tr.observacion && (
                    <TouchableOpacity
                      className="bg-amber-50 dark:bg-amber-900 rounded-lg px-2 py-1 flex-row items-center"
                      onPress={() => {
                        vibrateLight()
                        Alert.alert(t('tramites_observacion'), tr.observacion)
                      }}
                      accessibilityLabel={`${t('tramites_observacion')}: ${tr.observacion}`}
                      accessibilityRole="button"
                    >
                      <Ionicons name="document-text-outline" size={14} color="#D97706" style={{ marginRight: 2 }} />
                      <Text className="text-amber-700 dark:text-amber-300 text-xs font-semibold">{t('tramites_observacion')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              </FadeInView>
            )
          })
        )}
        <View className="h-12" />
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pb-10">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('tramites_new')}</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('tramites_type')}</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 mb-4"
              value={tipo}
              onChangeText={setTipo}
              placeholder="Ej: Suspensión de Retenciones"
              accessibilityLabel={t('tramites_type')}
            />
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('register_name')}</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 mb-6"
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe tu solicitud..."
              multiline
              numberOfLines={3}
              accessibilityLabel={t('register_name')}
            />
            {error && (
              <Text className="text-red-500 dark:text-red-400 text-sm font-semibold mb-4" accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl min-h-[48px] justify-center items-center"
                onPress={() => setShowForm(false)}
                accessibilityLabel={t('general_cancelar') + ' ' + t('tramites_new').toLowerCase()}
                accessibilityRole="button"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-base">{t('general_cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-[#002f5d] rounded-xl min-h-[48px] justify-center items-center"
                onPress={handleSubmit}
                accessibilityLabel={t('general_save') + ' ' + t('tramites_new').toLowerCase()}
                accessibilityRole="button"
              >
                <Text className="text-white font-bold text-base">{t('general_save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
