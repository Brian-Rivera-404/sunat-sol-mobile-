import { Platform, Vibration } from 'react-native'
import { playSuccess, playError, playClick, playNotification } from './sounds'

let Haptics: any = null
try {
  Haptics = require('expo-haptics')
} catch {}

export async function vibrateSuccess() {
  try { await playSuccess() } catch {}
  if (Haptics?.NotificationFeedbackType?.Success) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  } else {
    Vibration.vibrate(Platform.OS === 'ios' ? 50 : 100)
  }
}

export async function vibrateError() {
  try { await playError() } catch {}
  if (Haptics?.NotificationFeedbackType?.Error) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  } else {
    Vibration.vibrate(Platform.OS === 'ios' ? [0, 50, 30, 80] : 200)
  }
}

export async function vibrateWarning() {
  try { await playError() } catch {}
  if (Haptics?.NotificationFeedbackType?.Warning) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  } else {
    Vibration.vibrate(Platform.OS === 'ios' ? [0, 30, 20, 30] : 100)
  }
}

export async function vibrateLight() {
  try { await playClick() } catch {}
  if (Haptics?.ImpactFeedbackStyle?.Light) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  } else {
    Vibration.vibrate(Platform.OS === 'ios' ? 30 : 50)
  }
}

export async function vibrateSelection() {
  try { await playClick() } catch {}
  if (Haptics?.selectionAsync) {
    Haptics.selectionAsync()
  }
}

export async function vibrateNotification() {
  try { await playNotification() } catch {}
  Vibration.vibrate(Platform.OS === 'ios' ? [0, 30, 20, 40, 20, 30] : [0, 100, 50, 100])
}
