'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, Users, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Mock available kolos
const mockAvailableKolos = [
  {
    id: 1,
    name: 'Tech Community Savings',
    amount: 50,
    frequency: 'Weekly',
    members: 8,
    maxMembers: 10,
    startDate: '2025-03-01',
    creator: '0x1234...5678',
    saved: '400 STX',
  },
  {
    id: 2,
    name: 'Friends Investment Pool',
    amount: 200,
    frequency: 'Monthly',
    members: 5,
    maxMembers: 8,
    startDate: '2025-02-15',
    creator: '0x8765...4321',
    saved: '1000 STX',
  },
  {
    id: 3,
    name: 'Startup Fund 2025',
    amount: 150,
    frequency: 'Monthly',
    members: 12,
    maxMembers: 20,
    startDate: '2025-03-10',
    creator: '0x5555...6666',
    saved: '1800 STX',
  },
]

export default function JoinKoloPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKolo, setSelectedKolo] = useState<typeof mockAvailableKolos[0] | null>(null)

  const filteredKolos = mockAvailableKolos.filter(kolo =>
    kolo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kolo.creator.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/app/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Join a Kolo</h1>
          <p className="text-muted-foreground">Discover and join existing community savings groups</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search & List */}
          <div className="lg:col-span-2">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Kolos List */}
            <div className="space-y-4">
              {filteredKolos.length > 0 ? (
                filteredKolos.map((kolo) => (
                  <Card
                    key={kolo.id}
                    className={`p-6 cursor-pointer transition-all ${
                      selectedKolo?.id === kolo.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedKolo(kolo)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{kolo.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created by {kolo.creator}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        kolo.members < kolo.maxMembers
                          ? 'bg-green-500/10 text-green-700'
                          : 'bg-red-500/10 text-red-700'
                      }`}>
                        {kolo.members < kolo.maxMembers ? 'Open' : 'Full'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <p className="font-semibold text-foreground">{kolo.amount} STX</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                        <p className="font-semibold text-foreground">{kolo.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Members</p>
                        <p className="font-semibold text-foreground">{kolo.members}/{kolo.maxMembers}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No Kolos found matching your search</p>
                </Card>
              )}
            </div>
          </div>

          {/* Details & Action */}
          <div>
            {selectedKolo ? (
              <Card className="sticky top-24 p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{selectedKolo.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedKolo.creator}</p>
                </div>

                <div className="space-y-4 py-4 border-t border-b border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Contribution</span>
                    <span className="font-semibold text-foreground">{selectedKolo.amount} STX</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Frequency</span>
                    <span className="font-semibold text-foreground">{selectedKolo.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Members</span>
                    <span className="font-semibold text-foreground">{selectedKolo.members}/{selectedKolo.maxMembers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total Saved</span>
                    <span className="font-semibold text-foreground">{selectedKolo.saved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Starts</span>
                    <span className="font-semibold text-foreground">{selectedKolo.startDate}</span>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground text-sm mb-2">About this Kolo</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Members contribute {selectedKolo.amount} STX {selectedKolo.frequency.toLowerCase()} and receive payouts in rotation. Your position will be assigned when you join.
                  </p>
                </div>

                <Button
                  className="w-full"
                  disabled={selectedKolo.members >= selectedKolo.maxMembers}
                >
                  {selectedKolo.members >= selectedKolo.maxMembers ? 'Kolo is Full' : 'Join Kolo'}
                </Button>
              </Card>
            ) : (
              <Card className="sticky top-24 p-6 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Select a Kolo to view details and join
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Create New Kolo CTA */}
        <div className="mt-12 bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Don't see what you're looking for?</h3>
          <p className="text-muted-foreground mb-6">Create your own Kolo and invite your community</p>
          <Link href="/app/create">
            <Button size="lg">Create a New Kolo</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
