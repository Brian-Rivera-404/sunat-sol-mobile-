import React from 'react'

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <React.Fragment>
          {/* Minimal fallback so user sees something */}
          <>{this.props.children}</>
        </React.Fragment>
      )
    }
    return this.props.children
  }
}
