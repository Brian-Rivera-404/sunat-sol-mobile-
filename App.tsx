import './src/styles/global.css'
import React, { useEffect, useRef, useCallback } from 'react'
import { View, TouchableOpacity, ActivityIndicator, AccessibilityInfo, Appearance } from 'react-native'
import { Text } from './src/components/AccessibleText'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StoreProvider, useStore, go } from './src/store/sunatStore'
import { useTranslate } from './src/i18n/useTranslate'
import { vibrateLight } from './src/utils/haptics'
import type { RootStackParamList } from './src/types/navigation'

// Polyfill: setColorScheme no existe en react-native-web
if (typeof Appearance.setColorScheme !== 'function') {
  ;(Appearance as any).setColorScheme = () => {}
}

import RegisterScreen from './src/screens/RegisterScreen'
import HomeScreen from './src/screens/HomeScreen'
import NuevoRecibo1Screen from './src/screens/NuevoRecibo1Screen'
import ResumenReciboScreen from './src/screens/ResumenReciboScreen'
import ReciboEmitidoScreen from './src/screens/ReciboEmitidoScreen'
import MisRecibosScreen from './src/screens/MisRecibosScreen'
import MyRucScreen from './src/screens/MyRucScreen'
import ReportesScreen from './src/screens/ReportesScreen'
import DeclaracionExitosaScreen from './src/screens/DeclaracionExitosaScreen'
import DeclarationsScreen from './src/screens/DeclarationsScreen'
import AnnualTaxScreen from './src/screens/AnnualTaxScreen'
import TaxCalendarScreen from './src/screens/TaxCalendarScreen'
import DeductibleExpensesScreen from './src/screens/DeductibleExpensesScreen'
import ValidarEstablecimientosScreen from './src/screens/ValidarEstablecimientosScreen'
import InboxScreen from './src/screens/InboxScreen'
import TaxSimulatorScreen from './src/screens/TaxSimulatorScreen'
import AssistantOnboardingScreen from './src/screens/AssistantOnboardingScreen'
import AssistantChatScreen from './src/screens/AssistantChatScreen'
import AssistantHistoryScreen from './src/screens/AssistantHistoryScreen'
import AssistantSettingsScreen from './src/screens/AssistantSettingsScreen'
import TaxDebtScreen from './src/screens/TaxDebtScreen'
import TramitesScreen from './src/screens/TramitesScreen'
import DevolucionScreen from './src/screens/DevolucionScreen'
import ModalRecibo from './src/components/ModalRecibo'
import Toast from './src/components/Toast'
import BottomNav from './src/components/BottomNav'

const Stack = createNativeStackNavigator<RootStackParamList>()

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
}

function AppNavigator() {
  const { state, dispatch } = useStore()
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null)
  const { t } = useTranslate()

  useEffect(() => {
    if (navigationRef.current && state.screen) {
      navigationRef.current.navigate(state.screen)
    }
  }, [state.screen])

  useEffect(() => {
    Appearance.setColorScheme(state.highContrast || state.darkMode ? 'dark' : 'light')
  }, [state.darkMode, state.highContrast])

  const announceRoute = useCallback((routeName?: string) => {
    if (!routeName) return
    const names: Record<string, string> = {
      Register: 'Crear cuenta',
      Home: 'Inicio',
      NuevoRecibo1: 'Nuevo recibo',
      ResumenRecibo: 'Resumen de recibo',
      ReciboEmitido: 'Recibo emitido',
      MisRecibos: 'Mis recibos',
      MyRuc: 'Mi RUC',
      Reportes: 'Reportes',
      DeclaracionExitosa: 'Declaración exitosa',
      Declarations: 'Declaraciones y pagos',
      AnnualTax: 'Renta anual',
      TaxCalendar: 'Calendario tributario',
      DeductibleExpenses: 'Gastos deducibles',
      ValidarEstablecimientos: 'Validar establecimientos',
      Inbox: 'Buzón electrónico',
      TaxSimulator: 'Simulador de impuestos',
      AssistantOnboarding: 'Asistente',
      AssistantChat: 'Asistente tributario',
      AssistantHistory: 'Historial del asistente',
      AssistantSettings: 'Ajustes del asistente',
      TaxDebt: 'Deuda tributaria',
      Tramites: 'Trámites y solicitudes',
      Devolucion: 'Devolución de impuestos',
    }
    AccessibilityInfo.announceForAccessibility(names[routeName] || routeName)
  }, [])

  if (!state.loaded) {
    return (
      <View className="flex-1 bg-[#002f5d] items-center justify-center">
        <Text className="text-4xl font-bold text-white mb-4">SUNAT SOL</Text>
        <ActivityIndicator size="large" color="#93c5fd" />
      </View>
    )
  }

  const showAI = state.screen !== 'Register'

  return (
    <View className="flex-1" accessibilityLanguage="es">
      <NavigationContainer
        ref={navigationRef}
        onStateChange={(navState) => {
          announceRoute(navState?.routes[navState?.index]?.name)
        }}
      >
        <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="NuevoRecibo1" component={NuevoRecibo1Screen} />
          <Stack.Screen name="ResumenRecibo" component={ResumenReciboScreen} />
          <Stack.Screen name="ReciboEmitido" component={ReciboEmitidoScreen} />
          <Stack.Screen name="MisRecibos" component={MisRecibosScreen} />
          <Stack.Screen name="MyRuc" component={MyRucScreen} />
          <Stack.Screen name="Reportes" component={ReportesScreen} />
          <Stack.Screen name="DeclaracionExitosa" component={DeclaracionExitosaScreen} />
          <Stack.Screen name="Declarations" component={DeclarationsScreen} />
          <Stack.Screen name="AnnualTax" component={AnnualTaxScreen} />
          <Stack.Screen name="TaxCalendar" component={TaxCalendarScreen} />
          <Stack.Screen name="DeductibleExpenses" component={DeductibleExpensesScreen} />
          <Stack.Screen name="ValidarEstablecimientos" component={ValidarEstablecimientosScreen} />
          <Stack.Screen name="Inbox" component={InboxScreen} />
          <Stack.Screen name="TaxSimulator" component={TaxSimulatorScreen} />
          <Stack.Screen name="AssistantOnboarding" component={AssistantOnboardingScreen} />
          <Stack.Screen name="AssistantChat" component={AssistantChatScreen} />
          <Stack.Screen name="AssistantHistory" component={AssistantHistoryScreen} />
          <Stack.Screen name="AssistantSettings" component={AssistantSettingsScreen} />
          <Stack.Screen name="TaxDebt" component={TaxDebtScreen} />
          <Stack.Screen name="Tramites" component={TramitesScreen} />
          <Stack.Screen name="Devolucion" component={DevolucionScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <BottomNav />

      {showAI && (
        <TouchableOpacity
          className="absolute bottom-20 right-4 w-[58] h-[58] rounded-full items-center justify-center shadow-lg z-40"
          style={{ backgroundColor: '#6366F1' }}
          onPress={() => { dispatch(go('AssistantChat')); vibrateLight() }}
          accessibilityLabel={t('assistant_title')}
          accessibilityRole="button"
        >
          <Text className="text-white text-2xl">{'\u2726'}</Text>
        </TouchableOpacity>
      )}

      {state.modalId && <ModalRecibo />}
      <Toast />
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <AppNavigator />
      </StoreProvider>
    </SafeAreaProvider>
  )
}