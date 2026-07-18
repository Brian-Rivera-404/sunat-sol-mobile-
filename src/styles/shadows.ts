import { Platform } from 'react-native'

export const SHADOWS = {
  card: Platform.select({
    ios: {
      shadowColor: '#0A2240',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
  }),
  elevated: Platform.select({
    ios: {
      shadowColor: '#0A2240',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
  }),
  modal: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
    android: { elevation: 16 },
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#1B4FBF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
  }),
}
