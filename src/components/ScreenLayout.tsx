import React from 'react'
import { View, StatusBar, Platform, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {
  children: React.ReactNode
  style?: ViewStyle
  dark?: boolean
}

export default function ScreenLayout({ children, style, dark }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={style}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={dark ? '#002f5d' : '#f9fafb'}
      />
      {children}
    </SafeAreaView>
  )
}
