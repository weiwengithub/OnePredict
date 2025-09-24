'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setIsWalletLogin, setIsZkLogin, setZkLoginData, clearLoginData } from '@/store'
import { ZKLOGIN_EXPIRE_DAY, ZKLOGIN_EXPIRE_END } from '@/assets/config/constant'

export default function InitAuth() {
  const dispatch = useDispatch()

  useEffect(() => {
    try {
      const isZkLogin = localStorage.getItem('isZkLogin') === '1'
      const isWalletLogin = localStorage.getItem('isWalletLogin') === '1'
      const zkLoginDataRaw = localStorage.getItem('zkloginData')
      const expireEndRaw = localStorage.getItem(ZKLOGIN_EXPIRE_END)

      // 过期判断
      const now = Date.now()
      const expireEnd = expireEndRaw ? Number(expireEndRaw) : 0
      const isExpired = expireEnd > 0 && now > expireEnd

      if (isExpired) {
        // 过期则彻底清理
        dispatch(clearLoginData())
        localStorage.removeItem('zkloginData')
        localStorage.removeItem('isZkLogin')
        localStorage.removeItem('isWalletLogin')
        localStorage.removeItem(ZKLOGIN_EXPIRE_END)
        return
      }

      if (isZkLogin) {
        dispatch(setIsZkLogin(true))
        if (zkLoginDataRaw) {
          try {
            dispatch(setZkLoginData(JSON.parse(zkLoginDataRaw)))
          } catch {}
        }
        // 若没有过期时间，则补写一个（向后兼容）
        if (!expireEndRaw) {
          localStorage.setItem(
            ZKLOGIN_EXPIRE_END,
            (now + ZKLOGIN_EXPIRE_DAY * 24 * 60 * 60 * 1000).toString()
          )
        }
      } else if (isWalletLogin) {
        dispatch(setIsWalletLogin(1))
      }
    } catch (e) {
      console.warn('InitAuth restore error:', e)
    }
  }, [dispatch])

  return null
}
