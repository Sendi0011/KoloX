'use client'

import { Zap } from 'lucide-react'
import Link from 'next/link'
import { ConnectButton } from '@/components/wallet/connect-button'

export function DashboardNavbar() {

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/app/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-foreground">KoloX</span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
