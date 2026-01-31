import {
    makeContractCall,
    makeContractDeploy,
    broadcastTransaction,
    TxBroadcastResultRejected,
  } from '@stacks/transactions'
  import {
    stringUtf8CV,
    uintCV,
    principalCV,
    listCV,
    boolCV,
    CVType,
  } from '@stacks/transactions'
  import { StacksMainnet, StacksTestnet } from '@stacks/network'
  
  // Network configuration
  const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS || ''
  const CONTRACT_NAME = 'kolox-kolo'
  
  /**
   * Build a contract call transaction for creating a Kolo
   */
  export function buildCreateKoloTransaction(
    name: string,
    contributionAmount: number,
    memberCount: number,
    payoutFrequencyDays: number,
    senderAddress: string,
    nonce: number,
    fee: number
  ) {
    return makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-kolo',
      functionArgs: [
        stringUtf8CV(name),
        uintCV(Math.round(contributionAmount * 1_000_000)), // microSTX
        uintCV(memberCount),
        uintCV(payoutFrequencyDays * 144), // Convert days to blocks
      ],
      senderAddress,
      nonce,
      fee,
      network: NETWORK,
    })
  }
  
  /**
   * Build a contract call transaction for joining a Kolo
   */
  export function buildJoinKoloTransaction(
    koloId: number,
    senderAddress: string,
    nonce: number,
    fee: number
  ) {
    return makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'join-kolo',
      functionArgs: [uintCV(koloId)],
      senderAddress,
      nonce,
      fee,
      network: NETWORK,
    })
  }
  
  /**
   * Build a contract call transaction for contributing to a Kolo
   */
  export function buildContributeTransaction(
    koloId: number,
    amount: number,
    senderAddress: string,
    nonce: number,
    fee: number
  ) {
    return makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'contribute',
      functionArgs: [uintCV(koloId), uintCV(Math.round(amount * 1_000_000))],
      senderAddress,
      nonce,
      fee,
      network: NETWORK,
    })
  }
  
  /**
   * Build a contract call transaction for triggering a payout
   */
  export function buildTriggerPayoutTransaction(
    koloId: number,
    senderAddress: string,
    nonce: number,
    fee: number
  ) {
    return makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'trigger-payout',
      functionArgs: [uintCV(koloId)],
      senderAddress,
      nonce,
      fee,
      network: NETWORK,
    })
  }
  
  /**
   * Build a contract call transaction for cancelling a Kolo
   */
  export function buildCancelKoloTransaction(
    koloId: number,
    senderAddress: string,
    nonce: number,
    fee: number
  ) {
    return makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'cancel-kolo',
      functionArgs: [uintCV(koloId)],
      senderAddress,
      nonce,
      fee,
      network: NETWORK,
    })
  }
  
  /**
   * Serialize a transaction for broadcasting
   */
  export function serializeTransaction(transaction: any): string {
    try {
      return transaction.serialize().toString('hex')
    } catch (error) {
      console.error('[v0] Failed to serialize transaction:', error)
      throw error
    }
  }
  
  /**
   * Broadcast a serialized transaction to the network
   */
  export async function broadcastTx(serializedTx: string): Promise<string> {
    try {
      const result = await broadcastTransaction(serializedTx, NETWORK)
      
      if ('error' in result) {
        const error = result as TxBroadcastResultRejected
        console.error('[v0] Transaction broadcast failed:', error)
        throw new Error(error.error || 'Failed to broadcast transaction')
      }
  
      console.log('[v0] Transaction broadcast successful:', result)
      return result.txid
    } catch (error) {
      console.error('[v0] Broadcast error:', error)
      throw error
    }
  }
  
  /**
   * Parse clarity value responses
   */
  export function parseClarityValue(value: any) {
    if (!value) return null
  
    // Handle different CV types
    if (value.type === CVType.UInt) {
      return value.value
    } else if (value.type === CVType.Int) {
      return value.value
    } else if (value.type === CVType.StringUTF8) {
      return value.data
    } else if (value.type === CVType.Bool) {
      return value.value
    } else if (value.type === CVType.Principal) {
      return value.address
    } else if (value.type === CVType.List) {
      return value.list.map((item: any) => parseClarityValue(item))
    } else if (value.type === CVType.Tuple) {
      const result: any = {}
      for (const [key, val] of Object.entries(value.data)) {
        result[key] = parseClarityValue(val)
      }
      return result
    }
  
    return value
  }
  