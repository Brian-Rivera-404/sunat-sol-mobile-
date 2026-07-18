import React, { useRef, useEffect } from 'react'
import { View, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AccessibleText'
import { useStore, go } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight } from '../utils/haptics'
import { C } from '../styles/theme'

const NAV_ITEMS = [
  { id: 'Home' as const, icon: 'home-outline', iconActive: 'home', labelKey: 'bottomnav_home' },
  { id: 'MisRecibos' as const, icon: 'document-text-outline', iconActive: 'document-text', labelKey: 'bottomnav_recibos' },
  { id: 'Declarations' as const, icon: 'bar-chart-outline', iconActive: 'bar-chart', labelKey: 'bottomnav_declarar' },
  { id: 'Inbox' as const, icon: 'mail-outline', iconActive: 'mail', labelKey: 'bottomnav_buzon' },
]

const MAIN_SCREENS = ['Home', 'MisRecibos', 'Declarations', 'Inbox']

function NavItem({ item, isActive, unreadCount, onPress, label }: { item: typeof NAV_ITEMS[number]; isActive: boolean; unreadCount: number; onPress: () => void; label: string }) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1 : 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start()
  }, [isActive, scale])

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start()
  }

  return (
    <TouchableOpacity
      className="flex-1 items-center pt-2.5 pb-3"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={item.labelKey}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {item.id === 'Inbox' && unreadCount > 0 && (
          <View className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full z-10 border-2 border-white dark:border-gray-800" style={{ backgroundColor: '#E85E1E' }} />
        )}
        <Ionicons
          name={(isActive ? item.iconActive : item.icon) as any}
          size={24}
          color={isActive ? C.blue : C.s400}
        />
        <Text className="text-[10.5px] font-bold mt-0.5 text-center" style={{ color: isActive ? C.blue : C.s400 }}>{label}</Text>
      </Animated.View>
      {isActive && (
        <View className="absolute bottom-0 w-8 h-[3] rounded-t-sm" style={{ backgroundColor: '#1B4FBF' }} />
      )}
    </TouchableOpacity>
  )
}

export default function BottomNav() {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const active = state.screen
  const unreadCount = (state.inbox ?? []).filter((m) => !m.leido).length

  if (!MAIN_SCREENS.includes(active)) return null

  return (
    <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-row" style={{ paddingBottom: 0 }}>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={active === item.id}
          unreadCount={unreadCount}
          label={t(item.labelKey)}
          onPress={() => { if (active !== item.id) { dispatch(go(item.id)); vibrateLight() } }}
        />
      ))}
    </View>
  )
}
