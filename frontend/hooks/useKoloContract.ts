'use client'

import { useCallback, useState } from 'react'
import { Kolo, Member, CreateKoloFormData } from '@/lib/types'
import * as walletLib from '@/lib/wallet'

// This hook manages smart contract interactions with the Stacks blockchain using @stacks/transactions
// It provides wrappers around wallet functions with loading and error states

export function useKoloContract() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createKolo = useCallback(async (data: CreateKoloFormData, userAddress: string): Promise<number | null> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Creating Kolo with data:', data)
      await walletLib.createKolo(data, userAddress)
      // The actual kolo ID will be available from the transaction receipt
      return null // Return null to indicate async completion
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create Kolo'
      setError(message)
      console.error('[v0] Create Kolo error:', message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const joinKolo = useCallback(async (koloId: number, userAddress: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Joining Kolo:', koloId)
      await walletLib.joinKolo(koloId, userAddress)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join Kolo'
      setError(message)
      console.error('[v0] Join Kolo error:', message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const contribute = useCallback(async (koloId: number, amount: number, userAddress: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Contributing to Kolo:', koloId, 'Amount:', amount)
      await walletLib.contribute(koloId, amount, userAddress)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to contribute'
      setError(message)
      console.error('[v0] Contribution error:', message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerPayout = useCallback(async (koloId: number, userAddress: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Triggering payout for Kolo:', koloId)
      await walletLib.triggerPayout(koloId, userAddress)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to trigger payout'
      setError(message)
      console.error('[v0] Payout error:', message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const sendSTX = useCallback(async (recipientAddress: string, amount: number, userAddress: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Sending STX:', amount, 'to', recipientAddress)
      await walletLib.sendSTX(recipientAddress, amount, userAddress)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send STX'
      setError(message)
      console.error('[v0] STX transfer error:', message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getKolo = useCallback(async (koloId: number): Promise<Kolo | null> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Fetching Kolo:', koloId)
      // TODO: Implement read-only contract call to fetch kolo data
      // This would use @stacks/transactions to create a read-only function call
      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Kolo'
      setError(message)
      console.error('[v0] Fetch Kolo error:', message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createKolo,
    joinKolo,
    contribute,
    triggerPayout,
    sendSTX,
    getKolo,
  }
}
