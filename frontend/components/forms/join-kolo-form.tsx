'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface JoinKoloFormProps {
  koloId: number
  koloName: string
  maxMembers: number
  currentMembers: number
  onSubmit: () => Promise<void>
  isLoading?: boolean
}

export function JoinKoloForm({
  koloId,
  koloName,
  maxMembers,
  currentMembers,
  onSubmit,
  isLoading = false,
}: JoinKoloFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isFull = currentMembers >= maxMembers

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isFull) {
      setError('This Kolo is full')
      return
    }

    try {
      await onSubmit()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join Kolo')
    }
  }

  if (success) {
    return (
      <Card className="p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Successfully Joined!</h3>
        <p className="text-muted-foreground">
          You are now a member of {koloName}. Check your dashboard for next steps.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Join Kolo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kolo Name
          </label>
          <div className="px-4 py-2 bg-muted rounded-lg text-foreground">
            {koloName}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Members
          </label>
          <div className="px-4 py-2 bg-muted rounded-lg text-foreground">
            {currentMembers} / {maxMembers}
          </div>
        </div>

        {isFull && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">This Kolo is full and cannot accept new members</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            By joining, you agree to contribute the fixed amount each {currentMembers > 0 ? 'period' : 'period'} and follow the Kolo rules.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isFull}
        >
          {isLoading ? 'Joining...' : 'Join Kolo'}
        </Button>
      </form>
    </Card>
  )
}
