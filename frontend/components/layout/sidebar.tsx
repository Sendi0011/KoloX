'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Users, Wallet, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: Home },
  { href: '/app/create', label: 'Create Kolo', icon: Plus },
  { href: '/app/join', label: 'Join Kolo', icon: Users },
  { href: '/app/portfolio', label: 'Portfolio', icon: Wallet },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50">
      <div className="flex-1 px-6 py-8">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="px-6 py-8 border-t border-border">
        <Link
          href="/app/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  )
}
