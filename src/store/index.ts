import { configureStore, createAction, createReducer, PayloadAction } from '@reduxjs/toolkit'

export const connect = createAction<string>('connect')
export const disconnect = createAction('disconnect')
export const setZkLoginData = createAction<unknown>('setZkLoginData')
export const setIsZkLogin = createAction<boolean>('setIsZkLogin')
export const setIsWalletLogin = createAction<number>('setIsWalletLogin')
export const clearLoginData = createAction('clearLoginData')

// Global loading actions
export const showLoading = createAction<string | undefined>('showLoading')
export const hideLoading = createAction('hideLoading')

export const setSigninOpen = createAction<boolean>('signin/setOpen')
export const setSigninLoading = createAction<boolean>('signin/setOpenLoading')

// USDH Balance actions
export const setUsdhBalance = createAction<{
  balance: string
  rawBalance: string
}>('usdh/setBalance')
export const clearUsdhBalance = createAction('usdh/clearBalance')

export const setMemberId = createAction<number>('member/setId')
export const clearMemberId = createAction('member/clearId')

export type AuthState = {
  connect: boolean
  account: string
  zkLoginData: unknown | null
  isZkLogin: boolean
  isWalletLogin: 0 | 1 | 2 | number
  memberId: number
  loading: {
    isLoading: boolean
    message?: string
  }
  signinModal: {
    open: boolean
    openLoading: boolean
  }
  usdhBalance: {
    balance: string
    rawBalance: string
  }
}

const initialState: AuthState = {
  connect: false,
  account: '',
  zkLoginData: (typeof window !== 'undefined' && window.localStorage.getItem('zkloginData'))
    ? JSON.parse(window.localStorage.getItem('zkloginData') || 'null')
    : null,
  isZkLogin: (typeof window !== 'undefined' && window.localStorage.getItem('isZkLogin') === '1') ? true : false,
  isWalletLogin: (typeof window !== 'undefined' && window.localStorage.getItem('isWalletLogin') === '1') ? 1 : 0,
  memberId: 0,
  loading: {
    isLoading: false,
    message: undefined
  },
  signinModal: {
    open: false,
    openLoading: false,
  },
  usdhBalance: {
    balance: '0.00',
    rawBalance: '0',
  },
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
        state.isWalletLogin = 0
      }
    })
    .addCase(setIsWalletLogin, (state, action: PayloadAction<number>) => {
      state.isWalletLogin = action.payload
      if (action.payload) {
        state.zkLoginData = null
        state.isZkLogin = false
      }
    })
    .addCase(clearLoginData, (state) => {
      state.zkLoginData = null
      state.isZkLogin = false
      state.isWalletLogin = 0
      state.memberId = 0
    })
    .addCase(showLoading, (state, action: PayloadAction<string | undefined>) => {
      state.loading.isLoading = true
      state.loading.message = action.payload
    })
    .addCase(hideLoading, (state) => {
      state.loading.isLoading = false
      state.loading.message = undefined
    })
    .addCase(setSigninOpen, (state, action: PayloadAction<boolean>) => {
      state.signinModal.open = action.payload
    })
    .addCase(setSigninLoading, (state, action: PayloadAction<boolean>) => {
      state.signinModal.openLoading = action.payload
    })
    .addCase(setUsdhBalance, (state, action: PayloadAction<{ balance: string; rawBalance: string }>) => {
      state.usdhBalance.balance = action.payload.balance
      state.usdhBalance.rawBalance = action.payload.rawBalance
    })
    .addCase(clearUsdhBalance, (state) => {
      state.usdhBalance.balance = '0.00'
      state.usdhBalance.rawBalance = '0'
    })
    .addCase(setMemberId, (state, action: PayloadAction<number>) => {
      state.memberId = action.payload
    })
    .addCase(clearMemberId, (state) => {
      state.memberId = 0
    })
)

export const store = configureStore({ reducer })

// ---------- Typed helpers ----------
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const SigninModal = {
  open: () => store.dispatch(setSigninOpen(true)),
  close: () => store.dispatch(setSigninOpen(false)),
  showLoading: () => store.dispatch(setSigninLoading(true)),
  hideLoading: () => store.dispatch(setSigninLoading(false)),
}

export const Member = {
  save(id: number) {
    store.dispatch(setMemberId(id))
  },
  get(): number {
    return (store.getState() as RootState).memberId
  },
  clear() {
    store.dispatch(clearMemberId())
  },
}

// 可选：仅在浏览器订阅变化并持久化（防止 reducer 内侧写 localStorage）
function setupPersistence() {
  if (typeof window === 'undefined') return
  let ticking = false
  store.subscribe(() => {
    if (ticking) return
    ticking = true
    queueMicrotask(() => {
      try {
        const state = store.getState() as RootState
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
        if (state.memberId && state.memberId > 0) {
          localStorage.setItem('memberId', String(state.memberId))
        } else {
          localStorage.removeItem('memberId')
        }
      } catch (e) {
        console.warn('persist error:', e)
      } finally {
        ticking = false
      }
    })
  })

  try {
    const cachedMemberId = localStorage.getItem('memberId')
    if (cachedMemberId) {
      const n = Number(cachedMemberId)
      if (Number.isFinite(n) && n > 0) {
        store.dispatch(setMemberId(n))
      }
    }
  } catch {}
}
setupPersistence()
