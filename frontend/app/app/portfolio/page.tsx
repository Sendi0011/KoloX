'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, Award, Calendar, CheckCircle } from 'lucide-react'

export default function PortfolioPage() {
  const stats = [
    { label: 'Total Saved', value: '2,450 STX', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Active Kolos', value: '2', icon: Award, color: 'text-purple-500' },
    { label: 'Completed Kolos', value: '1', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Payouts Received', value: '3', icon: Calendar, color: 'text-amber-500' },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Portfolio</h1>
        <p className="text-muted-foreground mb-8">Your complete savings history and achievements</p>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </Card>
            )
          })}
        </div>

        {/* Coming Soon */}
        <Card className="p-12 text-center">
          <Award className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Detailed Analytics Coming Soon</h2>
          <p className="text-muted-foreground">
            We're building comprehensive portfolio analytics and performance tracking
          </p>
        </Card>
      </div>
    </div>
  )
}
