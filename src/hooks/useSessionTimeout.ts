import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import { useStore, go, setPinHash, setCCI } from '../store/sunatStore'
import { secureDeletePinHash } from '../services/secureStorage'

export function useSessionTimeout() {
  const { state, dispatch } = useStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef(Date.now())

  const resetTimer = () => {
    lastActivityRef.current = Date.now()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(handleTimeout, state.sessionTimeoutMinutes * 60 * 1000)
  }

  const handleTimeout = () => {
    if (state.screen === 'Login') return
    secureDeletePinHash()
    dispatch(setPinHash(null))
    dispatch(setCCI(null))
    dispatch(go('Login'))
  }

  useEffect(() => {
    if (state.screen === 'Login') {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    resetTimer()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [state.sessionTimeoutMinutes, state.screen])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed >= state.sessionTimeoutMinutes * 60 * 1000) {
          handleTimeout()
        } else if (state.screen !== 'Login') {
          resetTimer()
        }
      }
    })
    return () => sub.remove()
  }, [state.sessionTimeoutMinutes, state.screen])
}
