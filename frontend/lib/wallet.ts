import { openSTXTransfer, openContractCall } from '@stacks/connect'
import { StacksMainnet, StacksTestnet } from '@stacks/network'
import { principalCV, uintCV, stringUtf8CV } from '@stacks/transactions'
import { CreateKoloFormData } from './types'

const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS || ''
const CONTRACT_NAME = 'kolox-kolo'

export async function connectWallet() {
  try {
    const response = await (window as any).btcConnect?.request?.('getAccount') || null
    return response
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

export async function createKolo(data: CreateKoloFormData, userAddress: string) {
  try {
    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'create-kolo',
      functionArgs: [
        uintCV(Math.round(data.contributionAmount * 1_000_000)), // Amount in microSTX
        uintCV(data.memberCount),
        uintCV(data.payoutFrequencyDays * 144), // Convert days to blocks (assuming 10 min blocks)
        stringUtf8CV(data.name),
      ],
      network: NETWORK,
      userSession: null,
      onFinish: (data) => {
        console.log('[v0] Create Kolo transaction:', data)
      },
      onCancel: () => {
        console.log('[v0] Create Kolo cancelled')
      },
    })
  } catch (error) {
    console.error('Failed to create Kolo:', error)
    throw error
  }
}

export async function joinKolo(koloId: number, userAddress: string) {
  try {
    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'join-kolo',
      functionArgs: [uintCV(koloId)],
      network: NETWORK,
      userSession: null,
      onFinish: (data) => {
        console.log('[v0] Join Kolo transaction:', data)
      },
      onCancel: () => {
        console.log('[v0] Join Kolo cancelled')
      },
    })
  } catch (error) {
    console.error('Failed to join Kolo:', error)
    throw error
  }
}

export async function contribute(koloId: number, amount: number, userAddress: string) {
  try {
    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'contribute',
      functionArgs: [
        uintCV(koloId),
        uintCV(Math.round(amount * 1_000_000)), // Amount in microSTX
      ],
      network: NETWORK,
      userSession: null,
      onFinish: (data) => {
        console.log('[v0] Contribution transaction:', data)
      },
      onCancel: () => {
        console.log('[v0] Contribution cancelled')
      },
    })
  } catch (error) {
    console.error('Failed to contribute:', error)
    throw error
  }
}

export async function triggerPayout(koloId: number, userAddress: string) {
  try {
    await openContractCall({
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'trigger-payout',
      functionArgs: [uintCV(koloId)],
      network: NETWORK,
      userSession: null,
      onFinish: (data) => {
        console.log('[v0] Payout transaction:', data)
      },
      onCancel: () => {
        console.log('[v0] Payout cancelled')
      },
    })
  } catch (error) {
    console.error('Failed to trigger payout:', error)
    throw error
  }
}

export async function sendSTX(recipientAddress: string, amount: number, userAddress: string) {
  try {
    await openSTXTransfer({
      recipient: recipientAddress,
      amount: Math.round(amount * 1_000_000).toString(), // Amount in microSTX
      network: NETWORK,
      userSession: null,
      onFinish: (data) => {
        console.log('[v0] STX transfer transaction:', data)
      },
      onCancel: () => {
        console.log('[v0] STX transfer cancelled')
      },
    })
  } catch (error) {
    console.error('Failed to send STX:', error)
    throw error
  }
}
