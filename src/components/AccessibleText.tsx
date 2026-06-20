import React from 'react'
import { Text as RNText, TextProps } from 'react-native'

export function Text(props: TextProps) {
  return <RNText {...props} maxFontSizeMultiplier={props.maxFontSizeMultiplier ?? 2.5} />
}

export function Heading(props: TextProps) {
  return <RNText {...props} maxFontSizeMultiplier={props.maxFontSizeMultiplier ?? 2.0} accessibilityRole="header" />
}
