import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SysStyle = 'light' | 'dark'
export type SysLanguage = 'zh-CN' | 'en-US'

type SysSettingState = {
  sysStyle: SysStyle
  sysLanguage: SysLanguage
}

const initialState: SysSettingState = {
  sysStyle: 'light',
  sysLanguage: 'zh-CN',
}

const sysSettingSlice = createSlice({
  name: 'sysSetting',
  initialState,
  reducers: {
    setSysStyle(state, action: PayloadAction<SysStyle>) {
      state.sysStyle = action.payload
    },
    setSysLanguage(state, action: PayloadAction<SysLanguage>) {
      state.sysLanguage = action.payload
    },
    toggleSysStyle(state) {
      state.sysStyle = state.sysStyle === 'light' ? 'dark' : 'light'
    },
    toggleSysLanguage(state) {
      state.sysLanguage = state.sysLanguage === 'zh-CN' ? 'en-US' : 'zh-CN'
    },
  },
})

export const {
  setSysStyle,
  setSysLanguage,
  toggleSysStyle,
  toggleSysLanguage,
} = sysSettingSlice.actions
export default sysSettingSlice.reducer
