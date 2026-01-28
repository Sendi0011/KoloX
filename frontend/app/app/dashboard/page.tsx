'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Plus, TrendingUp, Users, Wallet, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Mock data for demo
const mockActiveKolos = [
  {
    id: 1,
    name: 'Summer Vacation Fund',
    amount: 100,
    frequency: 'Weekly',
    members: 5,
    yourPosition: 3,
    nextPayout: '2 weeks',
    saved: '300 STX',
    status: 'active'
  },
  {
    id: 2,
    name: 'Emergency Fund',
    amount: 50,
    frequency: 'Monthly',
    members: 8,
    yourPosition: 5,
    nextPayout: '1 month',
    saved: '200 STX',
    status: 'active'
  },
]

const mockUpcomingPayouts = [
  {
    koloId: 1,
    koloName: 'Summer Vacation Fund',
    date: '2025-02-14',
    amount: '500 STX',
    position: 3,
  },
  {
    koloId: 2,
    koloName: 'Emergency Fund',
    date: '2025-03-28',
    amount: '400 STX',
    position: 5,
  },
]

export default function DashboardPage() {
  const [activeKolos] = useState(mockActiveKolos)
  const [upcomingPayouts] = useState(mockUpcomingPayouts)

  const totalSaved = activeKolos.reduce((sum, kolo) => {
    const amount = parseFloat(kolo.saved)
    return sum + amount
  }, 0)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your savings overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
                <p className="text-3xl font-bold text-foreground">{totalSaved} STX</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Kolos</p>
                <p className="text-3xl font-bold text-foreground">{activeKolos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Members</p>
                <p className="text-3xl font-bold text-foreground">{activeKolos.reduce((sum, k) => sum + k.members, 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Next Payout</p>
                <p className="text-3xl font-bold text-foreground">{upcomingPayouts[0]?.amount || '—'}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Kolos */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Kolos</h2>
              <Link href="/app/create">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Kolo
                </Button>
              </Link>
            </div>

            {activeKolos.length > 0 ? (
              <div className="space-y-4">
                {activeKolos.map((kolo) => (
                  <Link key={kolo.id} href={`/app/kolo/${kolo.id}`}>
                    <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{kolo.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {kolo.frequency} • {kolo.members} members • Position #{kolo.yourPosition}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-700 text-xs font-semibold">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Contribution</p>
                          <p className="font-semibold text-foreground">{kolo.amount} STX</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Saved</p>
                          <p className="font-semibold text-foreground">{kolo.saved}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Next Payout</p>
                          <p className="font-semibold text-foreground">{kolo.nextPayout}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-lg bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Kolos Yet</h3>
                <p className="text-muted-foreground mb-6">Create or join a Kolo to start saving together</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/app/create">
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Kolo
                    </Button>
                  </Link>
                  <Link href="/app/join">
                    <Button size="sm" variant="outline">
                      Join Kolo
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Upcoming Payouts */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Payouts</h2>

            {upcomingPayouts.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayouts.map((payout, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{payout.koloName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{payout.date}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded">
                        #{payout.position}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{payout.amount}</p>
                    <Button className="w-full mt-4 bg-transparent" size="sm" variant="outline">
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming payouts yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
