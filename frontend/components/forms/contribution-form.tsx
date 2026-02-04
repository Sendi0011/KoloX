'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface ContributionFormProps {
  koloId: number
  koloName: string
  contributionAmount: number
  onSubmit: (amount: number) => Promise<void>
  isLoading?: boolean
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

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Make Contribution</h2>

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
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Contribute'}
        </Button>
      </form>
    </Card>
  )
}
