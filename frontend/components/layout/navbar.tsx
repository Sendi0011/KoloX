'use client'

import Link from 'next/link'
import { Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ConnectButton } from '@/components/wallet/connect-button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-foreground">KoloX</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </div>

          {/* Wallet Button */}
          <div className="hidden md:flex items-center gap-4">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4">
            <Link href="/" className="block px-4 py-2 text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="#" className="block px-4 py-2 text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="#" className="block px-4 py-2 text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <div className="px-4">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
