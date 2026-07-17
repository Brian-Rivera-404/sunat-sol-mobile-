jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}))

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  RN.Platform.OS = 'web'
  return RN
})
