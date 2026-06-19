import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useStore, go } from '../store/sunatStore'
import { useTranslate } from '../i18n/useTranslate'
import { vibrateSuccess, vibrateError } from '../utils/haptics'
import HeaderBar from '../components/HeaderBar'

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const { dispatch } = useStore()
  const { t } = useTranslate()
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const err: Record<string, string> = {}
    if (!nombre) err.nombre = 'Ingresa tu nombre.'
    if (!dni || !/^\d{8}$|^\d{11}$/.test(dni)) err.dni = 'DNI (8) o RUC (11) válido.'
    if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) err.email = 'Correo inválido.'
    if (pass.length < 8) err.pass = 'Mínimo 8 caracteres.'
    if (pass !== pass2) err.pass2 = 'No coinciden.'
    setErrors(err)
    if (Object.keys(err).length === 0) {
      vibrateSuccess()
      dispatch(go('Login'))
    } else {
      vibrateError()
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white dark:bg-gray-900" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <HeaderBar dark>
        <TouchableOpacity onPress={() => dispatch(go('Login'))} className="mr-3 py-2.5" accessibilityLabel={t('general_volver')} accessibilityRole="button" accessibilityHint="Regresa a la pantalla de inicio de sesión">
          <Text className="text-white text-2xl">{'\u2190'}</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">{t('register_title')}</Text>
          <Text className="text-blue-200 text-sm">{t('register_subtitle')}</Text>
        </View>
      </HeaderBar>
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Field label={t('register_name')} value={nombre} onChange={setNombre} error={errors.nombre} hint={t('register_name_example')} />
        <Field label={t('register_dni')} value={dni} onChange={setDni} error={errors.dni} keyboardType="numeric" hint={t('register_dni_example')} />
        <Field label={t('register_email')} value={email} onChange={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" hint={t('register_email_example')} />
        <Field label={t('register_phone')} value={tel} onChange={setTel} keyboardType="phone-pad" hint={t('register_phone_example')} />
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('register_pass')}</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <TextInput className="flex-1 px-4 py-3 text-base text-gray-900 dark:text-gray-100" placeholder={t('register_pass_hint')} secureTextEntry={!showPass} value={pass} onChangeText={t => { setPass(t); setErrors(e => ({ ...e, pass: '' })) }} accessibilityLabel={t('register_pass')} accessibilityHint={t('register_pass_hint')} />
            <TouchableOpacity className="px-3 py-3" onPress={() => setShowPass(!showPass)} accessibilityLabel={showPass ? t('login_hide_pass') : t('login_show_pass')} accessibilityRole="button" accessibilityHint={showPass ? 'Oculta la contraseña' : 'Muestra la contraseña'}>
              <Text className="text-lg" accessibilityElementsHidden={true}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('register_pass_hint')}</Text>
          {errors.pass ? <Text className="text-red-600 text-xs mt-1" accessibilityLiveRegion="polite" importantForAccessibility="yes">{errors.pass}</Text> : null}
        </View>
        <Field label={t('register_confirm_pass')} value={pass2} onChange={setPass2} error={errors.pass2} secureTextEntry />
        <View className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
          <Text className="text-xs text-gray-500 dark:text-gray-400">{t('register_terms')}</Text>
        </View>
        <TouchableOpacity className="bg-[#002f5d] rounded-xl py-4 items-center mb-10" onPress={handleSubmit} accessibilityLabel={t('register_create')} accessibilityRole="button" accessibilityHint="Registra tus datos en el sistema SOL">
          <Text className="text-white font-bold text-base">{t('register_create')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, value, onChange, error, keyboardType, autoCapitalize, secureTextEntry, hint }: {
  label: string; value: string; onChange: (t: string) => void; error?: string; keyboardType?: any; autoCapitalize?: any; secureTextEntry?: boolean; hint?: string
}) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</Text>
      <TextInput className={`border rounded-lg px-4 py-3 text-base ${error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-gray-100`} value={value} onChangeText={t => { onChange(t) }} keyboardType={keyboardType} autoCapitalize={autoCapitalize} secureTextEntry={secureTextEntry} accessibilityLabel={label} accessibilityHint={hint} />
      {hint ? <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</Text> : null}
      {error ? <Text className="text-red-600 dark:text-red-400 text-xs mt-1" accessibilityLiveRegion="polite" importantForAccessibility="yes">{error}</Text> : null}
    </View>
  )
}
