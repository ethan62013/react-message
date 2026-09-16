import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SysLanguage = 'zh-CN' | 'en-US'

type SysSettingState = {
  sysLanguage: SysLanguage
}

const initialState: SysSettingState = {
  sysLanguage: 'zh-CN',
}

const sysSettingSlice = createSlice({
  name: 'sysSetting',
  initialState,
  reducers: {
    setSysLanguage(state, action: PayloadAction<SysLanguage>) {
      state.sysLanguage = action.payload
    },
    toggleSysLanguage(state) {
      state.sysLanguage = state.sysLanguage === 'zh-CN' ? 'en-US' : 'zh-CN'
    },
  },
})

export const { setSysLanguage, toggleSysLanguage } = sysSettingSlice.actions
export default sysSettingSlice.reducer
