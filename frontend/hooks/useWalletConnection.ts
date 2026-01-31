'use client'

import { useCallback, useState, useEffect } from 'react'
import { useConnect, useAuth } from '@stacks/connect-react'

export function useWalletConnection() {
  const { doOpenAuth } = useConnect()
  const { isSignedIn, userData } = useAuth()
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (isSignedIn && userData) {
      setUserAddress(userData.profile.stxAddress.mainnet)
      localStorage.setItem('stacksAddress', userData.profile.stxAddress.mainnet)
    }
  }, [isSignedIn, userData])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      console.log('[v0] Opening auth dialog')
      doOpenAuth(false, () => {
        console.log('[v0] Auth completed')
        setIsConnecting(false)
      })
    } catch (error) {
      console.error('[v0] Connection error:', error)
      setIsConnecting(false)
    }
  }, [doOpenAuth])

  const disconnect = useCallback(() => {
    localStorage.removeItem('stacksAddress')
    setUserAddress(null)
    console.log('[v0] Wallet disconnected')
  }, [])

  return {
    userAddress,
    isConnected: !!userAddress,
    isConnecting,
    isSignedIn,
    connect,
    disconnect,
  }
}
