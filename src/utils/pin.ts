import * as Crypto from 'expo-crypto'

export async function hashPin(pin: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin)
  return digest
}

export async function verifyPin(input: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(input)
  return hash === storedHash
}

export function getLockoutDuration(attempts: number): number {
  const backoffMinutes = [5, 15, 30, 60, 120]
  const index = Math.min(Math.floor((attempts - 5) / 5), backoffMinutes.length - 1)
  return (backoffMinutes[index] || 120) * 60 * 1000
}
