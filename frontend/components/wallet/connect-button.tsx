'use client'

import { useState, useEffect } from 'react'
import { useConnect } from '@stacks/connect-react'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ConnectButton() {
  const [mounted, setMounted] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const { doOpenAuth } = useConnect()

  useEffect(() => {
    setMounted(true)
    // Check if user was previously connected
    const storedAddress = localStorage.getItem('stacksAddress')
    if (storedAddress) {
      setUserAddress(storedAddress)
    }
  }, [])

  const handleConnect = async () => {
    try {
      doOpenAuth(false, () => {
        console.log('[v0] Auth window opened')
      })
    } catch (error) {
      console.error('[v0] Failed to open auth:', error)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('stacksAddress')
    setUserAddress(null)
  }

  if (!mounted) {
    return <div className="w-32 h-10 bg-muted rounded-lg animate-pulse" />
  }

  if (!userAddress) {
    return (
      <Button
        onClick={handleConnect}
        className="gap-2 bg-primary hover:bg-primary/90"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Wallet className="w-4 h-4" />
          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(userAddress)
          }}
        >
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-destructive focus:text-destructive"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
