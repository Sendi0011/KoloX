'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Bell, Lock, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [username, setUsername] = useState('User123')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

        {/* Profile Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your public-facing username in Kolos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Wallet Address
              </label>
              <div className="px-4 py-2 bg-muted rounded-lg text-foreground font-mono text-sm">
                0x1234...5678
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Connected to your AppKit wallet
              </p>
            </div>

            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">Payment Reminders</p>
                <p className="text-xs text-muted-foreground">Get notified before contribution deadlines</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">Payout Notifications</p>
                <p className="text-xs text-muted-foreground">Be notified when your payout is available</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">Kolo Updates</p>
                <p className="text-xs text-muted-foreground">Updates about Kolos you're in</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Security</h2>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full bg-transparent">
              Change Password
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Connected Wallets
            </Button>
          </div>
        </Card>

        {/* Help & Support */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Help & Support</h2>
          </div>

          <div className="space-y-3">
            <a href="#" className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Documentation</p>
              <p className="text-xs text-muted-foreground mt-1">Learn how to use KoloX</p>
            </a>
            <a href="#" className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Contact Support</p>
              <p className="text-xs text-muted-foreground mt-1">Get help from our team</p>
            </a>
            <a href="#" className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Report a Bug</p>
              <p className="text-xs text-muted-foreground mt-1">Help us improve KoloX</p>
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
