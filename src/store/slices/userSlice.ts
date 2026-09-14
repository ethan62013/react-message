import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Gender = 'male' | 'female' | 'other'
export type AgeUnit = 'years' | 'months'

export type User = {
  id: string
  username: string
  gender: Gender
  birthDate: string
  ageUnit: AgeUnit
  age: number
  ageText: string
  phone: string
  email: string
  address: string
}

type UserState = {
  list: User[]
}

const initialState: UserState = {
  list: [],
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<User>) {
      state.list.push(action.payload)
    },
    removeUser(state, action: PayloadAction<string>) {
      state.list = state.list.filter((user) => user.id !== action.payload)
    },
    clearUsers(state) {
      state.list = []
    },
  },
})

export const { addUser, removeUser, clearUsers } = userSlice.actions
export default userSlice.reducer
