import React from 'react'
import { Text as RNText, TextProps } from 'react-native'

export function Text(props: TextProps) {
  return <RNText {...props} maxFontSizeMultiplier={props.maxFontSizeMultiplier ?? 1.5} />
}

export function Heading(props: TextProps) {
  return <RNText {...props} maxFontSizeMultiplier={props.maxFontSizeMultiplier ?? 1.3} accessibilityRole="header" />
}
