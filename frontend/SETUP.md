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

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in project settings

3. **Environment Variables in Vercel**
   - Add all `.env.local` variables to Vercel project settings
   - Use `NEXT_PUBLIC_` prefix for client-side variables

4. **Deploy**
   - Vercel automatically deploys on push to main branch

### Deploy Contract

1. **Install Clarinet**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.clarinet.sh | sh
   ```

2. **Initialize Clarinet Project**
   ```bash
   clarinet new kolox
   cd kolox
   ```

3. **Add Smart Contract**
   - Place the Clarity contract in `contracts/`
   - Update `Clarinet.toml` with contract configuration

4. **Deploy to Testnet**
   ```bash
   clarinet deployment generate --testnet
   clarinet deployment apply --testnet
   ```

## Testing

### Local Testing

```bash
# Run development server
npm run dev

# Test landing page
# Visit http://localhost:3000

# Test app flows
# Visit http://localhost:3000/app/dashboard
```

### Wallet Testing

1. Set up a test wallet (Hiro or Xverse)
2. Get testnet STX from faucet
3. Connect wallet to app
4. Test creation and joining flows

## API Routes

The project includes API route templates for backend operations:

- `GET /api/kolo` - Fetch all Kolos
- `POST /api/kolo` - Create a Kolo
- `POST /api/kolo/[id]/contribute` - Make a contribution

These routes are templates - implement with your indexing solution.

## Troubleshooting

### Wallet Connection Issues
- Ensure you have a Stacks wallet installed (Hiro or Xverse)
- Check that AppKit Project ID is correct in `.env.local`
- Verify you're on the correct network (testnet)

### Contract Errors
- Check contract address in environment variables
- Verify contract is deployed on correct network
- Review error messages using `getContractErrorMessage()` utility

### Build Issues
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node -v` (should be 18+)

## Next Steps

1. **Deploy Smart Contract**
   - Prepare and deploy Clarity contract to testnet
   - Update `NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS`

2. **Implement Contract Integration**
   - Update hooks in `/hooks/useKoloContract.ts`
   - Integrate actual contract calls using `@stacks/connect`

3. **Add Indexing**
   - Implement Stacks API queries
   - Add off-chain data indexing for performance

4. **Security Audit**
   - Have contract audited before mainnet
   - Test all edge cases thoroughly

5. **Mainnet Deployment**
   - Deploy contract to mainnet
   - Update environment variables
   - Deploy frontend to production Vercel

## Support

For issues or questions:
- Check the [Stacks documentation](https://docs.stacks.co)
- Review [AppKit docs](https://docs.appkit.dev)
- File issues on GitHub
- Join Stacks community Discord

## License

MIT License - see LICENSE file for details
