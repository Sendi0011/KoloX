'use client'

import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { StacksProvider } from '@stacks/connect'

interface StacksContextType {
  isConnected: boolean
  userAddress: string | null
}

const StacksContext = createContext<StacksContextType | undefined>(undefined)

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  useEffect(() => {
    // Check if user was previously connected
    const storedAddress = typeof window !== 'undefined' ? localStorage.getItem('stacksAddress') : null
    if (storedAddress) {
      setUserAddress(storedAddress)
      setIsConnected(true)
    }
  }, [])

  return (
    <StacksContext.Provider value={{ isConnected, userAddress }}>
      <StacksProvider appDetails={{
        name: 'KoloX',
        icon: 'https://avatars.githubusercontent.com/u/37784886',
      }}>
        {children}
      </StacksProvider>
    </StacksContext.Provider>
  )
}

export function useStacksContext() {
  const context = useContext(StacksContext)
  if (!context) {
    throw new Error('useStacksContext must be used within AppKitProvider')
  }
  return context
}
