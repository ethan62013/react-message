import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { LANG_STORAGE_KEY, type AppLanguage } from '../../i18n/constants'

export type SysLanguage = AppLanguage
export type SysTheme = 'dark' | 'light'

type SysSettingState = {
  sysLanguage: SysLanguage
  theme: SysTheme
}

const THEME_KEY = 'sys.theme'

function load(): SysSettingState {
  const language = localStorage.getItem(LANG_STORAGE_KEY)
  const theme = localStorage.getItem(THEME_KEY)
  return {
    sysLanguage: language === 'en-US' ? 'en-US' : 'zh-CN',
    theme: theme === 'light' ? 'light' : 'dark',
  }
}

const sysSettingSlice = createSlice({
  name: 'sysSetting',
  initialState: load(),
  reducers: {
    setSysLanguage(state, action: PayloadAction<SysLanguage>) {
      state.sysLanguage = action.payload
      localStorage.setItem(LANG_STORAGE_KEY, action.payload)
    },
    toggleSysLanguage(state) {
      state.sysLanguage = state.sysLanguage === 'zh-CN' ? 'en-US' : 'zh-CN'
      localStorage.setItem(LANG_STORAGE_KEY, state.sysLanguage)
    },
    setTheme(state, action: PayloadAction<SysTheme>) {
      state.theme = action.payload
      localStorage.setItem(THEME_KEY, action.payload)
    },
  },
})

export const { setSysLanguage, toggleSysLanguage, setTheme } = sysSettingSlice.actions
export default sysSettingSlice.reducer
