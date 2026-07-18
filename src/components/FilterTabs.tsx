import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Text } from './AccessibleText'

interface TabItem<T> {
  key: T
  label: string
}

interface FilterTabsProps<T> {
  items: TabItem<T>[]
  selectedKey: T
  onSelect: (key: T) => void
  accessibilityLabelPrefix?: string
}

export default function FilterTabs<T extends string | null>({
  items,
  selectedKey,
  onSelect,
  accessibilityLabelPrefix = ''
}: FilterTabsProps<T>) {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      className="mb-3.5 mt-1"
      contentContainerStyle={{
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: 8,
        paddingHorizontal: 2,
        paddingVertical: 4
      }}
    >
      {items.map((item) => {
        const isSelected = selectedKey === item.key
        return (
          <TouchableOpacity
            key={item.key ?? 'all'}
            className={`px-4 py-2.5 rounded-full border ${
              isSelected
                ? 'bg-[#002f5d] border-[#002f5d]'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
            }`}
            onPress={() => onSelect(item.key)}
            accessibilityLabel={accessibilityLabelPrefix ? `${accessibilityLabelPrefix} ${item.label}` : item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`text-xs font-semibold ${
                isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}
