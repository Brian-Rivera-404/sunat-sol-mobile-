import React, { useEffect, useRef } from 'react'
import { View, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native'
import { Text } from './AccessibleText'
import { SHADOWS } from '../styles/shadows'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

type Props = {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function BottomSheet({ visible, onClose, title, children }: Props) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, slideAnim, fadeAnim])

  if (!visible) return null

  return (
    <View className="absolute inset-0 z-50" accessibilityViewIsModal={visible}>
      <Animated.View
        className="absolute inset-0 bg-black/40"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
        />
      </Animated.View>
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl"
        style={{
          transform: [{ translateY: slideAnim }],
          ...Platform.select({
            ios: SHADOWS.modal,
            android: { elevation: 16 },
          }),
        }}
      >
        {/* Handle bar */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </View>

        {title && (
          <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
            >
              <Text className="text-gray-500 text-lg">{'\u2715'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="px-5 pb-6 max-h-[80%]">
          {children}
        </View>
      </Animated.View>
    </View>
  )
}
