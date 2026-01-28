'use client'

import { Button } from '@/components/ui/button'
import { Zap, Menu } from 'lucide-react'
import Link from 'next/link'
import { useAppKit } from '@appkit/react'

export function DashboardNavbar() {
  const { open } = useAppKit()

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/app/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-foreground">KoloX</span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => open()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              Connect / Account
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
