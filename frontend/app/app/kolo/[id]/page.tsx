'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function KoloDetailPage() {
  const params = useParams()
  const koloId = params.id

  // Mock Kolo data
  const kolo = {
    id: koloId,
    name: 'Summer Vacation Fund',
    amount: 100,
    frequency: 'Weekly',
    members: 5,
    maxMembers: 5,
    currentRound: 2,
    totalRounds: 5,
    yourPosition: 3,
    saved: '300 STX',
    nextPayoutDate: '2025-02-14',
    active: true,
  }

  const members = [
    { address: '0x1234...5678', position: 1, status: 'paid', contributions: 200 },
    { address: '0x8765...4321', position: 2, status: 'paid', contributions: 200 },
    { address: '0x5555...6666', position: 3, status: 'pending', contributions: 100 },
    { address: '0x9999...0000', position: 4, status: 'pending', contributions: 0 },
    { address: '0x2222...3333', position: 5, status: 'pending', contributions: 0 },
  ]

  const transactions = [
    { date: '2025-02-07', type: 'contribution', amount: '100 STX', status: 'confirmed' },
    { date: '2025-01-31', type: 'contribution', amount: '100 STX', status: 'confirmed' },
    { date: '2025-01-24', type: 'contribution', amount: '100 STX', status: 'confirmed' },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <Link href="/app/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{kolo.name}</h1>
          <p className="text-muted-foreground">Your position: #{kolo.yourPosition}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contribution</p>
                <p className="text-2xl font-bold text-foreground">{kolo.amount} STX</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/30" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frequency</p>
                <p className="text-2xl font-bold text-foreground">{kolo.frequency}</p>
              </div>
              <Clock className="w-8 h-8 text-accent/30" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
                <p className="text-2xl font-bold text-foreground">{kolo.saved}</p>
              </div>
              <Users className="w-8 h-8 text-green-500/30" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Next Payout</p>
                <p className="text-2xl font-bold text-foreground">{kolo.nextPayoutDate}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-500/30" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Members */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Members</h2>
              <div className="space-y-3">
                {members.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {member.position}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{member.address}</p>
                        <p className="text-xs text-muted-foreground">Position #{member.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{member.contributions} STX</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        member.status === 'paid'
                          ? 'bg-green-500/10 text-green-700'
                          : 'bg-amber-500/10 text-amber-700'
                      }`}>
                        {member.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Transactions */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Transaction History</h2>
              <div className="space-y-3">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground capitalize">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{tx.amount}</p>
                      <span className="text-xs text-green-700 bg-green-500/10 px-2 py-1 rounded">
                        {tx.status === 'confirmed' ? '✓ Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24 p-6 space-y-6">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  Your Position
                </h3>
                <p className="text-4xl font-bold text-primary">#{kolo.yourPosition}</p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-1">Payout Status</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive your payout on {kolo.nextPayoutDate} ({kolo.amount * kolo.members} STX)
                </p>
              </div>

              <Button className="w-full bg-transparent" variant="outline">
                Contribute Now
              </Button>

              <Button className="w-full bg-transparent" variant="outline">
                View Contract
              </Button>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground text-sm mb-3">Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Round</span>
                    <span className="font-semibold text-foreground">{kolo.currentRound}/{kolo.totalRounds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-semibold text-foreground">{kolo.members}/{kolo.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-green-700">Active</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
