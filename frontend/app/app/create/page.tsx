'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CreateKoloPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'weekly',
    members: '',
    startDate: '',
  })

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    console.log('Creating Kolo with:', formData)
    // Handle smart contract interaction here
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/app/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Create a Kolo</h1>
          <p className="text-muted-foreground">Set up your community savings group</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              {s < 3 && <div className="w-1 h-1" />}
            </div>
          ))}
        </div>

        <Card className="p-8 md:p-10 mb-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kolo Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Summer Vacation Fund"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A memorable name for your group's savings goal
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contribution Amount (STX) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fixed amount each member contributes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Members */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Members *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  min="2"
                  max="50"
                  value={formData.members}
                  onChange={(e) => handleChange('members', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Between 2 and 50 members. This determines how many rounds the Kolo will run.
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Total Rounds: {formData.members ? formData.members : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Each member receives a payout once per {formData.frequency} cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Start Date & Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kolo Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Members must join before this date. First contributions start immediately after.
                </p>
              </div>

              {/* Review Section */}
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-bold text-foreground mb-4">Review Your Kolo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold text-foreground">{formData.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contribution Amount</span>
                    <span className="font-semibold text-foreground">{formData.amount ? `${formData.amount} STX` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-semibold text-foreground capitalize">{formData.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-semibold text-foreground">{formData.members || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-semibold text-foreground">{formData.startDate || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
            className="flex-1 bg-transparent"
          >
            Previous
          </Button>
          {step < 3 ? (
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 gap-2"
            >
              <Zap className="w-4 h-4" />
              Create Kolo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
