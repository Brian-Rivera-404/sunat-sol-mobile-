import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, TouchableOpacity, TextInput, ScrollView, Alert, Linking, Platform } from 'react-native'
import { Text } from '../components/AccessibleText'
import { useStore, go, addConversation } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateLight, vibrateSuccess } from '../utils/haptics'
import { askAssistant } from '../services/assistantApi'
import HeaderBar from '../components/HeaderBar'
import * as Speech from 'expo-speech'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

type Message = {
  id: string
  text: string
  sender: 'user' | 'assistant'
  lowConfidence?: boolean
}

const FAQ_CHIPS = [
  'faq_chip_retencion',
  'faq_chip_cobre_menos',
  'faq_chip_equivoco',
]

type ScreenNav = NativeStackNavigationProp<RootStackParamList, 'AssistantChat'>

export default function AssistantChatScreen({ navigation, route }: { navigation: ScreenNav; route?: { params?: { initialMessage?: string; modulo?: string } } }) {
  const { state, dispatch } = useStore()
  const { t } = useTranslate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState(route?.params?.initialMessage || '')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (route?.params?.initialMessage) {
      handleSend(route.params.initialMessage)
    }
  }, [route?.params?.initialMessage])

  const handleSend = useCallback(async (text?: string) => {
    const question = (text || inputText).trim()
    if (!question || isProcessing) return

    setIsProcessing(true)
    setInputText('')
    vibrateLight()

    const userMsg: Message = { id: `u-${Date.now()}`, text: question, sender: 'user' }
    setMessages((prev) => [...prev, userMsg])

    try {
      const result = await askAssistant({
        question,
        context: { ruc: state.reciboData.ruc, monto: state.reciboData.monto, retencion: state.reciboData.retencion ? 8 : 0, formaPago: state.reciboData.formaPago, cliente: state.reciboData.cliente },
        settings: state.assistantSettings,
        conversationHistory: state.conversations,
      })

      const respuesta = result.lowConfidence
        ? `${result.answer}\n\n⚠️ Esta es una explicación informativa, no un cálculo oficial.`
        : result.answer

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        text: respuesta,
        sender: 'assistant',
        lowConfidence: result.lowConfidence,
      }
      setMessages((prev) => [...prev, assistantMsg])

      dispatch(
        addConversation({
          id: `conv-${Date.now()}`,
          pregunta: question,
          respuesta: result.answer,
          moduloDeOrigen: route?.params?.modulo || 'asistente',
          modo: result.mode,
          fecha: new Date().toISOString(),
          lowConfidence: result.lowConfidence,
        })
      )

      if (state.assistantSettings.modality !== 'text_only' && !isListening) {
        Speech.speak(respuesta.replace(/[⚠️*#]/g, ''), {
          rate: state.assistantSettings.ttsSpeed === 'fast' ? 0.9 : state.assistantSettings.ttsSpeed === 'slow' ? 0.4 : 0.6,
          language: state.language,
        })
      }
    } catch (error) {
      const errorMsg: Message = {
        id: `a-err-${Date.now()}`,
        text: t('assistant_error'),
        sender: 'assistant',
        lowConfidence: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    }

    setIsProcessing(false)
  }, [inputText, isProcessing, state.reciboData, state.assistantSettings, state.language, state.conversations, dispatch, t, route?.params?.modulo])

  const handleVoice = useCallback(async () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      setIsListening(true)

      if (Platform.OS === 'web') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition()
          recognition.lang = state.language === 'es' ? 'es-PE' : 'en-US'
          recognition.interimResults = false
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setInputText(transcript)
            setIsListening(false)
            handleSend(transcript)
          }
          recognition.onerror = () => setIsListening(false)
          recognition.start()
        } else {
          setIsListening(false)
        }
        return
      }

      try {
        const Voice = require('@react-native-voice/voice')
        Voice.onSpeechResults = (e: any) => {
          if (e.value?.[0]) {
            setInputText(e.value[0])
            handleSend(e.value[0])
          }
          setIsListening(false)
        }
        Voice.onSpeechError = () => setIsListening(false)
        Voice.start(state.language === 'es' ? 'es-PE' : 'en-US')
      } catch {
        setIsListening(false)
      }
    } catch {
      setIsListening(false)
    }
  }, [isListening, state.language, handleSend])

  const speakResponse = useCallback((text: string) => {
    Speech.speak(text.replace(/[⚠️*#]/g, ''), {
      rate: state.assistantSettings.ttsSpeed === 'fast' ? 0.9 : state.assistantSettings.ttsSpeed === 'slow' ? 0.4 : 0.6,
      language: state.language,
    })
  }, [state.assistantSettings.ttsSpeed, state.language])

  const handleTalkToAccountant = useCallback((duda: string) => {
    const phone = '51999000000'
    const body = encodeURIComponent(
      `Hola, necesito ayuda con un tema tributario:\n\n"Duda: ${duda}"\n\n---\nEnviado desde SUNAT SOL Móvil`
    )
    const url = Platform.OS === 'android'
      ? `https://wa.me/${phone}?text=${body}`
      : `mailto:contador@ejemplo.com?subject=Consulta tributaria&body=${body}`
    Linking.openURL(url).catch(() => {
      Alert.alert(t('assistant_contact_error'))
    })
  }, [t])

  const lastAssistantMsg = messages.filter((m) => m.sender === 'assistant').slice(-1)[0]

  return (
    <View className="flex-1 bg-[#EEF2FF] dark:bg-gray-900">
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Home'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint={t('general_volver_hint')}>
          <Text className="text-white text-2xl">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1">{t('assistant_title')}</Text>
        <TouchableOpacity onPress={() => dispatch(go('AssistantSettings'))} className="ml-2 py-2.5" accessibilityLabel={t('assistant_settings')} accessibilityRole="button">
          <Text className="text-white text-xl">{'\u2699\uFE0F'}</Text>
        </TouchableOpacity>
      </HeaderBar>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-4"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        accessibilityLiveRegion="polite"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`mb-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
            accessibilityLabel={`${msg.sender === 'user' ? t('assistant_you') : t('assistant_label')}: ${msg.text}`}
          >
            <View
              className={`rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-[#1B4FBF] rounded-tr-sm'
                  : 'bg-white dark:bg-gray-800 rounded-[18px] shadow-sm'
              }`}
            >
              <Text
                className={`text-sm leading-5 ${msg.sender === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}
                accessibilityLiveRegion={msg.sender === 'assistant' ? 'polite' : undefined}
              >
                {msg.text}
              </Text>
            </View>
            {msg.sender === 'assistant' && (
              <View className="flex-row mt-1 ml-1">
                <TouchableOpacity
                  className="mr-3 py-1"
                  onPress={() => speakResponse(msg.text)}
                  accessibilityLabel={t('assistant_listen')}
                  accessibilityRole="button"
                >
                  <Text className="text-blue-500 text-sm">{'\uD83D\uDD0A'}</Text>
                </TouchableOpacity>
                {msg.lowConfidence && (
                  <TouchableOpacity
                    className="py-1"
                    onPress={() => handleTalkToAccountant(msg.text)}
                    accessibilityLabel={t('assistant_talk_accountant')}
                    accessibilityRole="button"
                  >
                    <Text className="text-blue-500 text-sm">{'\uD83D\uDC64'} {t('assistant_talk_accountant')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
        {isProcessing && (
          <View className="self-start mb-3 bg-white dark:bg-gray-800 rounded-[18px] p-4 shadow-sm">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('general_cargando')}...</Text>
          </View>
        )}
      </ScrollView>

      {messages.length === 0 && (
        <View className="px-4 flex-row flex-wrap mb-2">
          {FAQ_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 mr-2 mb-2 shadow-sm"
              onPress={() => handleSend(t(chip))}
              accessibilityLabel={t(chip)}
              accessibilityRole="button"
            >
              <Text className="text-sm text-gray-700 dark:text-gray-300">{t(chip)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {lastAssistantMsg?.lowConfidence && (
        <View className="px-4 mb-2">
          <TouchableOpacity
            className="bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg py-3 items-center"
            onPress={() => handleTalkToAccountant(lastAssistantMsg.text)}
            accessibilityLabel={t('assistant_talk_accountant')}
            accessibilityRole="button"
          >
            <Text className="text-green-700 dark:text-green-300 font-semibold text-sm">{'\uD83D\uDC64'} {t('assistant_talk_accountant')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-gray-100 mr-2"
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('assistant_placeholder')}
            placeholderTextColor="#9ca3af"
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            accessibilityLabel={t('assistant_input')}
            accessibilityHint={t('assistant_input_hint')}
            editable={!isProcessing}
          />
          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isListening ? 'bg-red-500' : isProcessing ? 'bg-gray-300 dark:bg-gray-600' : 'bg-[#1B4FBF]'
            }`}
            onPress={handleVoice}
            disabled={isProcessing}
            accessibilityLabel={isListening ? t('assistant_listening') : isProcessing ? t('assistant_processing') : t('assistant_voice')}
            accessibilityRole="button"
            accessibilityHint={t('assistant_voice_hint')}
          >
            <Text className="text-white text-xl">
              {isListening ? '\uD83C\uDF99\uFE0F' : isProcessing ? '\u23F3' : '\uD83C\uDFA4'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-[#1B4FBF] items-center justify-center ml-2"
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isProcessing}
            accessibilityLabel={t('assistant_send')}
            accessibilityRole="button"
          >
            <Text className="text-white text-xl">{'\u27A1\uFE0F'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}