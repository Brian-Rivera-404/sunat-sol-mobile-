import React from 'react'
import { View, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SHADOWS } from '../styles/shadows'

type Props = {
  children: React.ReactNode
  dark?: boolean
}

export default function HeaderBar({ children, dark }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{
      backgroundColor: dark ? '#0A2240' : 'transparent',
      paddingTop: insets.top,
      ...(dark ? { ...Platform.select({ ios: SHADOWS.elevated, android: { elevation: 4 } }) } : {}),
    }}>
      <View className="flex-row items-center px-4 pb-4 pt-2">
        {children}
      </View>
    </View>
  )
}
