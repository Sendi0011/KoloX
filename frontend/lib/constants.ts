export const KOLO_FREQUENCIES = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const

export const KOLO_STATUS = {
  NOT_STARTED: 'not-started',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const MEMBER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export const CONTRIBUTION_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  MISSED: 'missed',
  GRACE_PERIOD: 'grace-period',
} as const

export const STX_DECIMALS = 6

// Smart Contract Constants
export const WEEKLY_BLOCKS = 1008 // ~7 days
export const MONTHLY_BLOCKS = 4320 // ~30 days
export const MIN_START_BLOCKS_AHEAD = 144 // ~1 day
export const MAX_MEMBERS = 50
export const MIN_MEMBERS = 2
