import { configureStore } from '@reduxjs/toolkit'
import sysSettingReducer from './slices/sysSetting'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    sysSetting: sysSettingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
