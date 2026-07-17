import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const CCI_KEY = 'sunat_cci'
const PIN_KEY = 'sunat_pin_hash'

export async function secureSaveCCI(cci: string): Promise<void> {
  if (Platform.OS === 'web') return
  await SecureStore.setItemAsync(CCI_KEY, cci)
}

export async function secureGetCCI(): Promise<string | null> {
  if (Platform.OS === 'web') return null
  try {
    return await SecureStore.getItemAsync(CCI_KEY)
  } catch {
    return null
  }
}

export async function secureDeleteCCI(): Promise<void> {
  if (Platform.OS === 'web') return
  await SecureStore.deleteItemAsync(CCI_KEY)
}

export async function secureSavePinHash(hash: string): Promise<void> {
  if (Platform.OS === 'web') return
  await SecureStore.setItemAsync(PIN_KEY, hash)
}

export async function secureGetPinHash(): Promise<string | null> {
  if (Platform.OS === 'web') return null
  try {
    return await SecureStore.getItemAsync(PIN_KEY)
  } catch {
    return null
  }
}

export async function secureDeletePinHash(): Promise<void> {
  if (Platform.OS === 'web') return
  await SecureStore.deleteItemAsync(PIN_KEY)
}

export async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  return SecureStore.isAvailableAsync()
}
