'use client'

import React from "react"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { AlertCircle, Clock, Users, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface ContributionFormProps {
  koloId: number
  koloName: string
  contributionAmount: number
  onSubmit: (amount: number) => Promise<void>
  isLoading?: boolean
}

// New interface for contribution status
interface ContributionStatus {
  totalMembers: number
  contributedCount: number
  remainingCount: number
  contributors: Array<{
    address: string
    hasPaid: boolean
    position: number
  }>
  roundDeadline: number
  currentBlock: number
  blocksRemaining: number
  isDeadlinePassed: boolean
}

export function ContributionForm({
  koloId,
  koloName,
  contributionAmount,
  onSubmit,
  isLoading = false,
}: ContributionFormProps) {
  const [amount, setAmount] = useState<string>(contributionAmount.toString())
  const [error, setError] = useState<string | null>(null)
  
  // New state for real-time status
  const [status, setStatus] = useState<ContributionStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  // Fetch contribution status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoadingStatus(true)
        // This would be replaced with actual contract calls
        const mockStatus: ContributionStatus = {
          totalMembers: 5,
          contributedCount: 3,
          remainingCount: 2,
          contributors: [
            { address: 'SP2...XK9', hasPaid: true, position: 0 },
            { address: 'SP3...YF7', hasPaid: true, position: 1 },
            { address: 'SP4...ZM2', hasPaid: false, position: 2 },
            { address: 'SP5...QN4', hasPaid: true, position: 3 },
            { address: 'SP6...RL9', hasPaid: false, position: 4 },
          ],
          roundDeadline: 12345,
          currentBlock: 12300,
          blocksRemaining: 45,
          isDeadlinePassed: false,
        }
        setStatus(mockStatus)
      } catch (err) {
        console.error('Failed to fetch contribution status:', err)
      } finally {
        setLoadingStatus(false)
      }
    }

    fetchStatus()
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [koloId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (parsedAmount !== contributionAmount) {
      setError(`Contribution amount must be exactly ${contributionAmount} STX`)
      return
    }

    try {
      await onSubmit(parsedAmount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contribute')
    }
  }

  // Helper to format time from blocks
  const formatTimeRemaining = (blocks: number): string => {
    const minutes = blocks * 10 // Assuming 10 min blocks
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours`
    const days = Math.floor(hours / 24)
    return `${days} days`
  }

  // Calculate progress percentage
  const progressPercentage = status 
    ? (status.contributedCount / status.totalMembers) * 100 
    : 0

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Make Contribution</h2>

      {/* New: Real-time Status Section */}
      {loadingStatus ? (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading contribution status...</span>
        </div>
      ) : status && (
        <div className="mb-6 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">Round Progress</span>
              <span className="text-muted-foreground">
                {status.contributedCount}/{status.totalMembers} contributed
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Remaining</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {status.remainingCount}
              </p>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Deadline</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {status.blocksRemaining}
              </p>
              <p className="text-xs text-muted-foreground">
                ~{formatTimeRemaining(status.blocksRemaining)}
              </p>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs">Status</span>
              </div>
              <p className={`text-sm font-medium ${status.isDeadlinePassed ? 'text-red-500' : 'text-green-500'}`}>
                {status.isDeadlinePassed ? 'Overdue' : 'Active'}
              </p>
            </div>
          </div>

          {/* Contributors List */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Contributors</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {status.contributors.map((contributor, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{contributor.position}</span>
                    <span className="font-mono text-foreground">
                      {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                    </span>
                  </div>
                  {contributor.hasPaid ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">Paid</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Pending</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Warning if deadline approaching */}
          {!status.isDeadlinePassed && status.blocksRemaining < 30 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Deadline approaching! {status.blocksRemaining} blocks remaining 
                (~{formatTimeRemaining(status.blocksRemaining)})
              </p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kolo
          </label>
          <div className="px-4 py-2 bg-muted rounded-lg text-foreground">
            {koloName}
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
            Amount (STX) *
          </label>
          <input
            id="amount"
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Required amount: {contributionAmount} STX
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || (status?.hasPaidCurrentUser ?? false)}
        >
          {isLoading ? 'Processing...' : 
           status?.hasPaidCurrentUser ? 'Already Contributed' : 'Contribute'}
        </Button>
      </form>
    </Card>
  )
}
