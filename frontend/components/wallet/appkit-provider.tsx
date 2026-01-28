'use client'

import React, { ReactNode } from 'react'
import { createAppKit } from '@appkit/react'
import { mainnet } from '@appkit/networks'

// Initialize AppKit
const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID || 'default-project-id'

createAppKit({
  networks: [mainnet],
  projectId: projectId,
  enableAnalytics: true,
  themeMode: 'light',
  metadata: {
    name: 'KoloX',
    description: 'Community Savings on Stacks',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://kolox.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
})

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
