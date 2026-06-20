import './src/styles/global.css'
import React, { useEffect, useRef, useCallback } from 'react'
import { View, ActivityIndicator, AccessibilityInfo, Appearance } from 'react-native'
import { Text } from './src/components/AccessibleText'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StoreProvider, useStore } from './src/store/sunatStore'

import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import HomeScreen from './src/screens/HomeScreen'
import NotificacionesScreen from './src/screens/NotificacionesScreen'
import NuevoRecibo1Screen from './src/screens/NuevoRecibo1Screen'
import NuevoRecibo2Screen from './src/screens/NuevoRecibo2Screen'
import ResumenReciboScreen from './src/screens/ResumenReciboScreen'
import ReciboEmitidoScreen from './src/screens/ReciboEmitidoScreen'
import MisRecibosScreen from './src/screens/MisRecibosScreen'
import DeclararScreen from './src/screens/DeclararScreen'
import MiRucScreen from './src/screens/MiRucScreen'
import BeneficiosScreen from './src/screens/BeneficiosScreen'
import ReportesScreen from './src/screens/ReportesScreen'
import DeclaracionExitosaScreen from './src/screens/DeclaracionExitosaScreen'
import ModalRecibo from './src/components/ModalRecibo'
import Toast from './src/components/Toast'

const Stack = createNativeStackNavigator()

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
}

function AppNavigator() {
  const { state } = useStore()
  const navigationRef = useRef<NavigationContainerRef<any>>(null)

  useEffect(() => {
    if (navigationRef.current && state.screen && state.screen !== 'Login') {
      navigationRef.current.navigate(state.screen)
    }
  }, [state.screen])

  useEffect(() => {
    Appearance.setColorScheme(state.highContrast || state.darkMode ? 'dark' : 'light')
  }, [state.darkMode, state.highContrast])

  const announceRoute = useCallback((routeName?: string) => {
    if (!routeName) return
    const names: Record<string, string> = {
      Login: 'Inicio de sesión',
      Register: 'Crear cuenta',
      Home: 'Inicio',
      Notificaciones: 'Notificaciones',
      NuevoRecibo1: 'Nuevo recibo, paso 1',
      NuevoRecibo2: 'Nuevo recibo, paso 2',
      ResumenRecibo: 'Resumen de recibo',
      ReciboEmitido: 'Recibo emitido',
      MisRecibos: 'Mis recibos',
      Declarar: 'Declarar impuestos',
      MiRuc: 'Mi RUC',
      Beneficios: 'Beneficios tributarios',
      Reportes: 'Reportes',
      DeclaracionExitosa: 'Declaración exitosa',
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

  return (
    <View className="flex-1" accessibilityLanguage="es">
      <NavigationContainer
        ref={navigationRef}
        onStateChange={(navState) => {
          announceRoute(navState?.routes[navState?.index]?.name)
        }}
      >
        <Stack.Navigator screenOptions={screenOptions} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
          <Stack.Screen name="NuevoRecibo1" component={NuevoRecibo1Screen} />
          <Stack.Screen name="NuevoRecibo2" component={NuevoRecibo2Screen} />
          <Stack.Screen name="ResumenRecibo" component={ResumenReciboScreen} />
          <Stack.Screen name="ReciboEmitido" component={ReciboEmitidoScreen} />
          <Stack.Screen name="MisRecibos" component={MisRecibosScreen} />
          <Stack.Screen name="Declarar" component={DeclararScreen} />
          <Stack.Screen name="MiRuc" component={MiRucScreen} />
          <Stack.Screen name="Beneficios" component={BeneficiosScreen} />
          <Stack.Screen name="Reportes" component={ReportesScreen} />
          <Stack.Screen name="DeclaracionExitosa" component={DeclaracionExitosaScreen} />
        </Stack.Navigator>
      </NavigationContainer>

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
