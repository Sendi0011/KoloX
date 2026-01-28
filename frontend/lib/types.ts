export interface Kolo {
  id: number
  creator: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly'
  maxMembers: number
  currentRound: number
  startBlock: number
  totalRounds: number
  active: boolean
  createdAt: number
  members: Member[]
  nextPayoutDate: Date
  nextPayoutRecipient?: string
}

export interface Member {
  address: string
  position: number
  joinedAt: number
  totalContributions: number
  missedPayments: number
  hasReceivedPayout: boolean
}

export interface RoundContribution {
  koloId: number
  round: number
  user: string
  paid: boolean
  amount: number
  paidAt: number
}

export interface PayoutOrder {
  koloId: number
  position: number
  recipient: string
}

export interface UserProfile {
  address: string
  username?: string
  joinedAt: number
  totalSaved: number
  activeKolos: number
  completedKolos: number
  reputation: number
}

export interface CreateKoloFormData {
  name: string
  amount: number
  frequency: 'weekly' | 'monthly'
  maxMembers: number
  startDate: Date
}
