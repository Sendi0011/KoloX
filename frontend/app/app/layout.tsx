import React from "react"
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardNavbar } from '@/components/layout/dashboard-navbar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
