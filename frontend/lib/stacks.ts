// Stacks and Clarity Smart Contract Utilities
// This module will handle interaction with the KoloX smart contract

// Contract identifiers
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS || ''
export const CONTRACT_NAME = 'kolox-kolo'
export const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet'

// STX utilities
export const STX_DECIMALS = 1_000_000

export function stxToMicroSTX(stx: number): number {
  return stx * STX_DECIMALS
}

export function microSTXToSTX(microSTX: number): number {
  return microSTX / STX_DECIMALS
}

// Block time calculations
const STACKS_BLOCK_TIME_MINUTES = 10

export function blocksToMinutes(blocks: number): number {
  return blocks * STACKS_BLOCK_TIME_MINUTES
}

export function blocksToHours(blocks: number): number {
  return blocksToMinutes(blocks) / 60
}

export function blocksToDays(blocks: number): number {
  return blocksToHours(blocks) / 24
}

export function daysToBlocks(days: number): number {
  return Math.ceil((days * 24 * 60) / STACKS_BLOCK_TIME_MINUTES)
}

// Smart contract function names
export const CONTRACT_FUNCTIONS = {
  CREATE_KOLO: 'create-kolo',
  JOIN_KOLO: 'join-kolo',
  CONTRIBUTE: 'contribute',
  TRIGGER_PAYOUT: 'trigger-payout',
  CANCEL_KOLO: 'cancel-kolo',
  GET_KOLO: 'get-kolo',
  GET_MEMBER_INFO: 'get-member-info',
  GET_MEMBER_COUNT: 'get-member-count',
  GET_PAYOUT_RECIPIENT: 'get-payout-recipient',
  HAS_PAID_CURRENT_ROUND: 'has-paid-current-round',
  GET_CURRENT_ROUND_RECIPIENT: 'get-current-round-recipient',
  IS_MEMBER: 'is-member',
  GET_ROUND_CONTRIBUTION: 'get-round-contribution',
  GET_NEXT_PAYOUT_BLOCK: 'get-next-payout-block',
} as const

// Error codes from the contract
export const CONTRACT_ERRORS = {
  NOT_AUTHORIZED: 100,
  KOLO_NOT_FOUND: 101,
  KOLO_FULL: 102,
  ALREADY_MEMBER: 103,
  NOT_MEMBER: 104,
  ALREADY_PAID: 105,
  WRONG_AMOUNT: 106,
  NOT_STARTED: 107,
  PAYOUT_NOT_READY: 108,
  NOT_YOUR_TURN: 109,
  KOLO_NOT_ACTIVE: 110,
  INVALID_PARAMS: 111,
  CANNOT_JOIN: 112,
} as const

// Type for contract error codes
export type ContractErrorCode = typeof CONTRACT_ERRORS[keyof typeof CONTRACT_ERRORS]

// Helper to get error message from error code
export function getContractErrorMessage(code: number): string {
  const messages: Record<number, string> = {
    100: 'You are not authorized to perform this action',
    101: 'Kolo not found',
    102: 'This Kolo is full',
    103: 'You are already a member',
    104: 'You are not a member of this Kolo',
    105: 'You have already paid for this round',
    106: 'Incorrect payment amount',
    107: 'This Kolo has not started yet',
    108: 'Payout is not ready yet',
    109: 'It is not your turn to receive payout',
    110: 'This Kolo is not active',
    111: 'Invalid parameters',
    112: 'You cannot join this Kolo',
  }
  return messages[code] || 'An unknown error occurred'
}
