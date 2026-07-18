import React from 'react'
import { View, TextInput, TextInputProps } from 'react-native'
import { Text } from './AccessibleText'

interface Props extends TextInputProps {
  label?: string
  error?: string
  prefix?: string
  rightElement?: React.ReactNode
}

export default function TextField({ label, error, prefix, rightElement, style, ...inputProps }: Props) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</Text>
      )}
      <View
        className="flex-row items-center rounded-xl bg-white dark:bg-gray-800 border px-4"
        style={{
          borderColor: error ? '#DC2626' : '#E2E8F0',
          minHeight: 48,
        }}
      >
        {prefix && (
          <Text className="text-gray-500 dark:text-gray-400 font-bold mr-2">{prefix}</Text>
        )}
        <TextInput
          className="flex-1 text-sm text-gray-900 dark:text-gray-100 py-3"
          placeholderTextColor="#94A3B8"
          {...inputProps}
          style={style}
        />
        {rightElement && <View className="ml-2">{rightElement}</View>}
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>
      )}
    </View>
  )
}
