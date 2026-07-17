import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from './AccessibleText'
import { useStore, go } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'

const NAV_ITEMS = [
  { id: 'Home' as const, icon: '\uD83C\uDFE0', labelKey: 'bottomnav_home' },
  { id: 'MisRecibos' as const, icon: '\uD83D\uDCC4', labelKey: 'bottomnav_recibos' },
  { id: 'Declarations' as const, icon: '\uD83D\uDCCA', labelKey: 'bottomnav_declarar' },
  { id: 'Inbox' as const, icon: '\uD83D\uDCEB', labelKey: 'bottomnav_buzon' },
]

const MAIN_SCREENS = ['Home', 'MisRecibos', 'Declarations', 'Inbox']

export default function BottomNav() {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const active = state.screen
  const unreadCount = (state.inbox ?? []).filter((m) => !m.leido).length

  if (!MAIN_SCREENS.includes(active)) return null

  return (
    <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-row">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id
        return (
          <TouchableOpacity
            key={item.id}
            className="flex-1 items-center pt-2.5 pb-3"
            onPress={() => { if (!isActive) { dispatch(go(item.id)); vibrateLight() } }}
            accessibilityLabel={t(item.labelKey)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            {item.id === 'Inbox' && unreadCount > 0 && (
              <View className="absolute top-1.5 left-[55%] w-2 h-2 rounded-full z-10" style={{ backgroundColor: '#E85E1E', borderWidth: 2, borderColor: '#FFFFFF' }} />
            )}
            <Text className="text-[22px]" style={{ opacity: isActive ? 1 : 0.35 }}>{item.icon}</Text>
            <Text className="text-[10.5px] font-bold mt-0.5" style={{ color: isActive ? '#1B4FBF' : '#94A3B8' }}>{t(item.labelKey)}</Text>
            {isActive && (
              <View className="absolute bottom-0 w-8 h-[3] rounded-t-sm" style={{ backgroundColor: '#1B4FBF' }} />
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
