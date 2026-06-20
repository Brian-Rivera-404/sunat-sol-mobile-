import React from 'react'
import { AccessibilityInfo } from 'react-native'

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    AccessibilityInfo.announceForAccessibility('Error en la aplicación: ' + error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <React.Fragment>
          <>{this.props.children}</>
        </React.Fragment>
      )
    }
    return this.props.children
  }
}
