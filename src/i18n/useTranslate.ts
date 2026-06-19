import { useStore, setLang } from '../store/sunatStore'
import strings, { langs } from './strings'

export function useTranslate() {
  const { state, dispatch } = useStore()
  const lang = state.language || 'es'

  const t = (key: string): string => strings[lang]?.[key] ?? strings['es']?.[key] ?? key

  const switchLang = () => {
    const next = lang === 'es' ? 'en' : 'es'
    dispatch(setLang(next))
  }

  const currentLangLabel = langs[lang as keyof typeof langs] || 'Español'
  const nextLangLabel = lang === 'es' ? 'English' : 'Español'

  return { t, lang, switchLang, currentLangLabel, nextLangLabel, langs }
}
