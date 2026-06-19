# SUNAT SOL Móvil

Sistema de Operaciones en Línea — Recibos por Honorarios Electrónicos (RHE)

## Stack

- **React Native** 0.81.5 + **Expo SDK 54**
- **NativeWind v4** (Tailwind CSS)
- **React Navigation v7** (Native Stack)
- **TypeScript 5.9**
- **AsyncStorage** (persistencia)

## Accesibilidad

WCAG 2.1 Nivel AA — 29/29 criterios cumplidos.

## Características

- 14 pantallas navegables
- Internacionalización ES/EN (~280 strings)
- Modo oscuro con `dark:` variantes
- Autenticación biométrica (huella/rostro)
- Feedback háptico (`expo-haptics`)
- Sonidos WAF generados en memoria (`expo-av`)
- Notch/status bar seguro (`SafeAreaProvider`)
- Pull to Refresh
- Reducción de movimiento (WCAG)
- Anuncio de rutas para lectores de pantalla

## Ejecutar

```bash
cd sunat-sol-mobile
npx expo start --tunnel --clear
```

Escanea el código QR con Expo Go (Android/iOS).

## Integrantes

- Rivera Bautista, Brian Alexis - U22222615
- Santamaria Suyón, Darwin Joel - U22235835
- Ramirez Mendez, Juan Aldair - U20201597

Curso: Interacción Hombre Máquina - UTP 2026
