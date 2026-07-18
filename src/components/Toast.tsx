import React, { useEffect, useRef, useState } from 'react'
import { View, Animated, AccessibilityInfo } from 'react-native'
import { Text } from './AccessibleText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStore } from '../store/sunatStore'

export default function Toast() {
  const { state } = useStore()
  const insets = useSafeAreaInsets()
  const opacity = useRef(new Animated.Value(0)).current
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (state.toast) {
      const config = { useNativeDriver: true, duration: reduceMotion ? 0 : 300 }
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, ...config }),
        Animated.delay(reduceMotion ? 1000 : 3000),
        Animated.timing(opacity, { toValue: 0, ...config }),
      ]).start()
    }
  }, [state.toast, opacity, reduceMotion])

  if (!state.toast) return null

  return (
    <Animated.View
      className="absolute left-6 right-6 bg-gray-800 dark:bg-gray-700 rounded-xl py-3 px-4 z-50"
      style={{ opacity, bottom: 56 + insets.bottom + 12 }}
      accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
      importantForAccessibility="yes"
    >
      <Text className="text-white text-center font-medium text-sm">{state.toast}</Text>
    </Animated.View>
  )
}
