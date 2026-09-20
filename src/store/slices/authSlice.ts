import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SysUser } from '../../api/auth'
import { AUTH_STORAGE_KEY } from '../../api/session'

export type AuthState = {
  token: string | null
  user: SysUser | null
}

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    const parsed = JSON.parse(raw) as Partial<AuthState>
    if (parsed.token && parsed.user) {
      return { token: parsed.token, user: parsed.user }
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
  return { token: null, user: null }
}

function persistAuth(state: AuthState) {
  if (state.token && state.user) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: state.token, user: state.user }),
    )
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuth(),
  reducers: {
    setSession(state, action: PayloadAction<{ token: string; user: SysUser }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      persistAuth({ token: action.payload.token, user: action.payload.user })
    },
    clearSession(state) {
      state.token = null
      state.user = null
      persistAuth({ token: null, user: null })
    },
  },
})

export const { setSession, clearSession } = authSlice.actions
export default authSlice.reducer
