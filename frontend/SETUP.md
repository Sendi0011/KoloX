# KoloX - Setup & Deployment Guide

## Overview

KoloX is a trustless community savings platform built on Stacks (Bitcoin) with a modern Next.js frontend. This guide walks you through setting up and deploying the application.

## Prerequisites

- Node.js 18+ and npm/yarn
- Stacks wallet (Hiro or Xverse)
- Git
- Basic understanding of Stacks/Clarity smart contracts

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AppKit Configuration
NEXT_PUBLIC_APPKIT_PROJECT_ID=your_appkit_project_id_here

# Stacks Configuration
NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_STACKS_NETWORK=testnet

# Optional: API Keys for indexing
NEXT_PUBLIC_STACKS_API_KEY=optional_api_key
NEXT_PUBLIC_HIRO_API_URL=https://api.testnet.hiro.so
```

## Getting Started Locally

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set Up Environment Variables**
   - Copy the environment variables above to `.env.local`
   - Replace placeholders with your actual values

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the landing page.

4. **Access the App**
   - Navigate to `http://localhost:3000/app/dashboard` to access the application
   - Connect your Stacks wallet using AppKit

## Project Structure

```
kolox/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout with AppKit provider
│   ├── globals.css              # Global styles and design tokens
│   └── app/
│       ├── layout.tsx           # App layout with sidebar
│       ├── dashboard/           # Main dashboard
│       ├── create/              # Create Kolo page
│       ├── join/                # Join Kolo page
│       ├── kolo/[id]/           # Kolo detail page
│       ├── portfolio/           # User portfolio
│       └── settings/            # Settings page
├── components/
│   ├── layout/                  # Layout components (navbar, sidebar, footer)
│   ├── forms/                   # Form components (contribution, join)
│   ├── wallet/                  # Wallet integration components
│   └── ui/                      # shadcn/ui components
├── hooks/
│   └── useKoloContract.ts       # Smart contract interaction hook
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── constants.ts             # App constants
│   └── stacks.ts                # Stacks utilities
└── public/
    └── assets/                  # Images and static files
```

## Core Features

### Landing Page (`/`)
- Hero section with call-to-action
- "How KoloX Works" explanation
- Benefits and features overview
- Navigation to create/join flows

### Dashboard (`/app/dashboard`)
- Overview of active Kolos
- Quick stats (total saved, active members, payouts)
- Upcoming payouts schedule
- Quick actions (create/join Kolo)

### Create Kolo (`/app/create`)
- Multi-step form for Kolo creation
- Set name, amount, frequency, and member count
- Start date configuration
- Review and submit to smart contract

### Join Kolo (`/app/join`)
- Browse available Kolos
- Search and filter functionality
- View Kolo details
- Join action with confirmation

### Kolo Details (`/app/kolo/[id]`)
- View Kolo members and positions
- Transaction history
- Contribution status
- Payout schedule and dates

### Portfolio (`/app/portfolio`)
- User savings statistics
- Active and completed Kolos
- Performance analytics (coming soon)

### Settings (`/app/settings`)
- Profile management
- Notification preferences
- Security options
- Help and support links

## Smart Contract Integration

The app is designed to integrate with the KoloX Clarity smart contract. Key integration points:

### Smart Contract Functions Used

- `create-kolo` - Create a new Kolo
- `join-kolo` - Join an existing Kolo
- `contribute` - Make a contribution
- `trigger-payout` - Trigger payout for current round
- `cancel-kolo` - Cancel Kolo (creator only, before start)

### Utility Hooks

**useKoloContract()** - Main hook for contract interactions
- `createKolo(data)` - Create a Kolo
- `joinKolo(koloId)` - Join a Kolo
- `contribute(koloId, amount)` - Make a contribution
- `triggerPayout(koloId)` - Trigger payout
- `getKolo(koloId)` - Fetch Kolo data

### Stacks Utilities

Located in `/lib/stacks.ts`:
- `stxToMicroSTX()` / `microSTXToSTX()` - STX conversion utilities
- `daysToBlocks()` / `blocksToMinutes()` - Block time conversion
- `getContractErrorMessage()` - Error code to message mapping
- `CONTRACT_FUNCTIONS` - Exported function names
- `CONTRACT_ERRORS` - Exported error codes

## Wallet Integration

KoloX uses AppKit for wallet connection with Stacks support.

### Supported Wallets
- Hiro Wallet
- Xverse Wallet
- Other AppKit-compatible Stacks wallets

### Integration Points
- `AppKitProvider` - Wraps entire app in `/app/layout.tsx`
- `useAppKit()` - React hook for wallet operations
- Connect button in navigation bars

## Design System

### Color Palette
- **Primary**: Deep purple/indigo (for actions and highlights)
- **Accent**: Lighter purple/periwinkle (secondary actions)
- **Background**: Off-white/light neutral
- **Text**: Dark neutral for readability
- **Borders**: Light neutral borders

### Typography
- **Headings**: Geist (sans-serif) with variable weights
- **Body**: Geist for consistency
- **Mono**: Geist Mono for code/addresses

### Components
Uses shadcn/ui components built on Radix UI with Tailwind CSS v4




## License

MIT License - see LICENSE file for details
