import React, { useCallback, useRef } from 'react'
import { TouchableOpacity, ActivityIndicator, View, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from './AccessibleText'
import { C } from '../styles/theme'
import { SHADOWS } from '../styles/shadows'
import { vibrateLight } from '../utils/haptics'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'

type Props = {
  title: string
  onPress: () => void
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
  haptic?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string; gradient?: [string, string] }> = {
  primary: { bg: '#0A2240', text: '#FFFFFF', gradient: ['#0A2240', '#1B4FBF'] },
  secondary: { bg: '#1B4FBF', text: '#FFFFFF', gradient: ['#1B4FBF', '#2563EB'] },
  outline: { bg: 'transparent', text: '#0A2240', border: '#CBD5E1' },
  danger: { bg: '#DC2626', text: '#FFFFFF', gradient: ['#DC2626', '#EF4444'] },
  ghost: { bg: 'transparent', text: '#1B4FBF' },
}

export default function Button({ title, onPress, variant = 'primary', disabled, loading, icon, className = '', haptic = true, fullWidth = true }: Props) {
  const vs = variantStyles[variant]
  const isDisabled = disabled || loading
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      damping: 12,
      stiffness: 300,
    }).start()
  }, [scale])

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 300,
    }).start()
  }, [scale])

  const handlePress = useCallback(() => {
    if (haptic) vibrateLight()
    onPress()
  }, [haptic, onPress])

  const useGradient = vs.gradient && !isDisabled && (variant === 'primary' || variant === 'secondary' || variant === 'danger')

  const buttonStyle = {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderColor: isDisabled ? '#E2E8F0' : (vs.border ?? 'transparent'),
    opacity: isDisabled ? 0.55 : 1,
    overflow: 'hidden' as const,
    ...(variant !== 'ghost' && variant !== 'outline' && !isDisabled ? SHADOWS.button : {}),
  }

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={{
            color: isDisabled ? (variant === 'outline' || variant === 'ghost' ? '#94A3B8' : '#FFFFFF') : vs.text,
            fontWeight: '800',
            fontSize: 15,
            letterSpacing: 0.3,
          }}>{title}</Text>
        </>
      )}
    </>
  )

  return (
    <Animated.View style={{ transform: [{ scale }], alignSelf: fullWidth ? 'stretch' : 'auto' }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={isDisabled}
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        className={className}
      >
        {useGradient ? (
          <LinearGradient
            colors={vs.gradient!}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={buttonStyle}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={{ ...buttonStyle, backgroundColor: isDisabled ? (variant === 'outline' || variant === 'ghost' ? 'transparent' : '#CBD5E1') : vs.bg }}>
            {content}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}
