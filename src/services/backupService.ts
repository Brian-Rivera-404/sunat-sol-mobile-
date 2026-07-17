import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import { useStore } from '../store/sunatStore'

const BACKUP_KEY = 'sunat_sol_backup'
const STORE_KEY = 'sunat_sol_data'

export type BackupData = {
  version: number
  timestamp: string
  user: {
    nombre: string
    dni: string
    email: string
    tel: string
    direccion: string
  }
  recibos: Array<{
    id: string
    ruc: string
    cliente: string
    fecha: string
    montoBruto: number
    retencion: number
    montoNeto: number
    formaPago: string
    estado: string
  }>
  nextId: number
  expenses: Array<{
    id: string
    monto: number
    categoria: string
    comprobanteUri?: string
    establecimientoValidado: boolean
    descripcion: string
    fecha: string
  }>
  declarations: Array<{
    id: string
    periodo: string
    estado: 'pendiente' | 'pagado' | 'vencido'
    fechaLimite: string
    monto: number
  }>
  conversations: Array<{
    id: string
    pregunta: string
    respuesta: string
    moduloDeOrigen: string
    modo: 'local' | 'remote'
    fecha: string
    lowConfidence?: boolean
  }>
  assistantSettings: {
    modality: 'text_only' | 'text_voice' | 'hands_free'
    ttsSpeed: 'slow' | 'normal' | 'fast'
    useLocalOnly: boolean
    language: 'es' | 'en'
  }
  clients: Array<{
    id: string
    ruc: string
    nombre: string
    frecuente: boolean
  }>
  inbox: Array<{
    id: string
    titulo: string
    cuerpo: string
    fecha: string
    leido: boolean
    modulo: string
  }>
  onboardingSeen: boolean
  sessionTimeoutMinutes: number
  pinHash: string | null
  cci: string | null
  language: string
  darkMode: boolean
  biometricEnabled: boolean
  highContrast: boolean
}

export async function exportBackup(): Promise<{ success: boolean; fileUri?: string; error?: string }> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY)
    if (!raw) {
      return { success: false, error: 'No hay datos para respaldar' }
    }

    const stored = JSON.parse(raw)
    const backup: BackupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      user: stored.user,
      recibos: stored.recibos || [],
      nextId: stored.nextId || 1,
      expenses: stored.expenses || [],
      declarations: stored.declarations || [],
      conversations: stored.conversations || [],
      assistantSettings: stored.assistantSettings || {
        modality: 'text_voice',
        ttsSpeed: 'normal',
        useLocalOnly: true,
        language: 'es',
      },
      clients: stored.clients || [],
      inbox: stored.inbox || [],
      onboardingSeen: stored.onboardingSeen || false,
      sessionTimeoutMinutes: stored.sessionTimeoutMinutes || 10,
      pinHash: stored.pinHash || null,
      cci: stored.cci || null,
      language: stored.language || 'es',
      darkMode: stored.darkMode || false,
      biometricEnabled: stored.biometricEnabled || false,
      highContrast: stored.highContrast || false,
    }

    const jsonString = JSON.stringify(backup, null, 2)
    const fileName = `sunat-sol-backup-${new Date().toISOString().split('T')[0]}.json`
    const fileUri = `${FileSystem.documentDirectory}${fileName}`

    await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Guardar respaldo SUNAT SOL' })
    }

    await AsyncStorage.setItem(BACKUP_KEY, jsonString)

    return { success: true, fileUri }
  } catch (error) {
    console.error('[backupService] Error exportando:', error)
    return { success: false, error: String(error) }
  }
}

export async function importBackup(fileUri: string): Promise<{ success: boolean; error?: string }> {
  try {
    const jsonString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 })
    const backup: BackupData = JSON.parse(jsonString)

    if (!backup.version || !backup.timestamp) {
      return { success: false, error: 'Archivo de respaldo inválido' }
    }

    const dataToStore = {
      user: backup.user,
      recibos: backup.recibos,
      nextId: backup.nextId,
      expenses: backup.expenses,
      declarations: backup.declarations,
      conversations: backup.conversations,
      assistantSettings: backup.assistantSettings,
      clients: backup.clients,
      inbox: backup.inbox,
      onboardingSeen: backup.onboardingSeen,
      sessionTimeoutMinutes: backup.sessionTimeoutMinutes,
      pinHash: backup.pinHash,
      cci: backup.cci,
      language: backup.language,
      darkMode: backup.darkMode,
      biometricEnabled: backup.biometricEnabled,
      highContrast: backup.highContrast,
    }

    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(dataToStore))
    await AsyncStorage.setItem(BACKUP_KEY, jsonString)

    return { success: true }
  } catch (error) {
    console.error('[backupService] Error importando:', error)
    return { success: false, error: String(error) }
  }
}

export async function pickAndImportBackup(): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await (window as any).showOpenFilePicker?.()
    if (!result) {
      return { success: false, error: 'Cancelado por el usuario' }
    }
    const file = await result[0].getFile()
    const text = await file.text()
    const uri = FileSystem.documentDirectory + 'temp-import.json'
    await FileSystem.writeAsStringAsync(uri, text, { encoding: FileSystem.EncodingType.UTF8 })
    return await importBackup(uri)
  } catch (error) {
    console.error('[backupService] Error en import:', error)
    return { success: false, error: String(error) }
  }
}

export async function getLastBackupInfo(): Promise<{ timestamp?: string; version?: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(BACKUP_KEY)
    if (!raw) return null
    const backup = JSON.parse(raw)
    return { timestamp: backup.timestamp, version: backup.version }
  } catch {
    return null
  }
}

export function createCloudSyncInterface() {
  return {
    async push(data: BackupData): Promise<void> {
      // TODO: Implementar sincronización con backend real
      // Esta interfaz está diseñada para que cloudSyncService.ts
      // pueda reemplazarla sin tocar el resto de la app.
      throw new Error('Cloud sync no implementado - Roadmap: fuera de alcance del PROY por restricción de presupuesto')
    },
    async pull(): Promise<BackupData | null> {
      throw new Error('Cloud sync no implementado - Roadmap: fuera de alcance del PROY por restricción de presupuesto')
    },
    async resolveConflict(local: BackupData, remote: BackupData): Promise<BackupData> {
      return local
    },
  }
}