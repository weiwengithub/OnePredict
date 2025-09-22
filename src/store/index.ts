import { configureStore, createAction, createReducer, PayloadAction } from '@reduxjs/toolkit'

export const connect = createAction<string>('connect')
export const disconnect = createAction('disconnect')
export const setZkLoginData = createAction<unknown>('setZkLoginData')
export const setIsZkLogin = createAction<boolean>('setIsZkLogin')
export const setIsWalletLogin = createAction<boolean>('setIsWalletLogin')
export const clearLoginData = createAction('clearLoginData')

export type AuthState = {
  connect: boolean
  account: string
  zkLoginData: unknown | null
  isZkLogin: boolean
  isWalletLogin: boolean
}

const initialState: AuthState = {
  connect: false,
  account: '',
  zkLoginData: null,       // 这里不再从 localStorage 取，避免 SSR 报错
  isZkLogin: false,
  isWalletLogin: false,
}

const reducer = createReducer(initialState, (builder) =>
  builder
    .addCase(connect, (state, action: PayloadAction<string>) => {
      state.connect = true
      state.account = action.payload
    })
    .addCase(disconnect, (state) => {
      state.connect = false
      state.account = ''
    })
    .addCase(setZkLoginData, (state, action: PayloadAction<unknown>) => {
      state.zkLoginData = action.payload
    })
    .addCase(setIsZkLogin, (state, action: PayloadAction<boolean>) => {
      state.isZkLogin = action.payload
      if (action.payload) {
        state.isWalletLogin = false
      }
    })
    .addCase(setIsWalletLogin, (state, action: PayloadAction<boolean>) => {
      state.isWalletLogin = action.payload
      if (action.payload) {
        state.zkLoginData = null
        state.isZkLogin = false
      }
    })
    .addCase(clearLoginData, (state) => {
      state.zkLoginData = null
      state.isZkLogin = false
      state.isWalletLogin = false
    })
)

export const store = configureStore({ reducer })

// ---------- Typed helpers ----------
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 可选：仅在浏览器订阅变化并持久化（防止 reducer 内侧写 localStorage）
function setupPersistence() {
  if (typeof window === 'undefined') return
  // 简单节流，避免频繁写入
  let ticking = false
  store.subscribe(() => {
    if (ticking) return
    ticking = true
    queueMicrotask(() => {
      try {
        const state = store.getState() as RootState
        // 只持久化必要字段
        if (state.isZkLogin) {
          localStorage.setItem('isZkLogin', '1')
          if (state.zkLoginData) {
            localStorage.setItem('zkloginData', JSON.stringify(state.zkLoginData))
          }
        } else {
          localStorage.removeItem('isZkLogin')
          localStorage.removeItem('zkloginData')
        }

        if (state.isWalletLogin) {
          localStorage.setItem('isWalletLogin', '1')
        } else {
          localStorage.removeItem('isWalletLogin')
        }
      } catch (e) {
        // 忽略持久化异常（例如 Safari 隐私模式）
        console.warn('persist error:', e)
      } finally {
        ticking = false
      }
    })
  })
}
setupPersistence()
