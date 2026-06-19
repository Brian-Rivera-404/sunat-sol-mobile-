import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'

let initialized = false

async function initAudio() {
  if (initialized) return
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    })
    initialized = true
  } catch {}
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

function generateWavBase64(frequency = 800, duration = 0.15, sampleRate = 44100, volume = 0.4): string {
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, numSamples * 2, true)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const envelope = Math.min(1, (numSamples - i) / (sampleRate * 0.05))
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope
    const value = Math.round(sample * 32767 * Math.max(0, Math.min(1, volume)))
    view.setInt16(44 + i * 2, value, true)
  }

  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const audioCache: Record<string, Audio.Sound> = {}

async function playTone(key: string, freq: number, duration: number, volume?: number) {
  try {
    await initAudio()
    if (audioCache[key]) {
      await audioCache[key].replayAsync()
      return
    }
    const b64 = generateWavBase64(freq, duration, 44100, volume)
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${b64}` },
      { shouldPlay: true, volume: 1.0 },
    )
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {})
        delete audioCache[key]
      }
    })
    audioCache[key] = sound
  } catch {}
}

export async function playSuccess() {
  await playTone('success', 1200, 0.12, 0.5)
  await new Promise((r) => setTimeout(r, 80))
  await playTone('success2', 1600, 0.2, 0.5)
}

export async function playError() {
  await playTone('error', 300, 0.15, 0.6)
  await new Promise((r) => setTimeout(r, 100))
  await playTone('error2', 200, 0.25, 0.6)
}

export async function playClick() {
  await playTone('click', 1000, 0.04, 0.3)
}

export async function playNotification() {
  await playTone('notif1', 880, 0.08, 0.4)
  await new Promise((r) => setTimeout(r, 50))
  await playTone('notif2', 1100, 0.1, 0.4)
}
