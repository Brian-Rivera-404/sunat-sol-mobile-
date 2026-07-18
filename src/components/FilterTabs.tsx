import React, { useRef, useEffect } from 'react'
import { ScrollView, TouchableOpacity, Platform } from 'react-native'
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
  const scrollRef = useRef<any>(null)

  useEffect(() => {
    if (Platform.OS !== 'web' || !scrollRef.current) return

    const el = scrollRef.current.getScrollableNode
      ? scrollRef.current.getScrollableNode()
      : scrollRef.current

    if (!el) return

    let isDown = false
    let startX: number
    let scrollLeft: number

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      el.style.cursor = 'grabbing'
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }

    const onMouseLeave = () => {
      isDown = false
      el.style.cursor = 'grab'
    }

    const onMouseUp = () => {
      isDown = false
      el.style.cursor = 'grab'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5
      el.scrollLeft = scrollLeft - walk
    }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)

    el.style.cursor = 'grab'
    el.style.userSelect = 'none'

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <ScrollView
      ref={scrollRef}
      horizontal={true}
      showsHorizontalScrollIndicator={Platform.OS === 'web'}
      className="mb-3.5 mt-1"
      style={{ width: '100%' }}
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
