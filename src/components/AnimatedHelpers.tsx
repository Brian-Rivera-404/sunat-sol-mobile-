import React, { useRef, useCallback } from 'react'
import { Animated, TouchableOpacity, TouchableOpacityProps } from 'react-native'

export function FadeInView({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(12)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, translateY, delay])

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  )
}

export function StaggeredFade({ children, itemCount }: { children: (index: number) => React.ReactNode; itemCount: number }) {
  const items = Array.from({ length: itemCount }, (_, i) => i)
  return (
    <>
      {items.map((i) => (
        <React.Fragment key={i}>{children(i)}</React.Fragment>
      ))}
    </>
  )
}

export function PressableScale({ onPress, children, style, ...props }: TouchableOpacityProps & { children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start()
  }, [scale])

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start()
  }, [scale])

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.95}
      style={style}
      {...props}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}

export function SkeletonBlock({ width = '100%', height = 16, className = '' }: { width?: number | string; height?: number; className?: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [opacity])

  return (
    <Animated.View
      className={`rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width: width as any, height, opacity }}
    />
  )
}
