# KoloX - Community Savings on Stacks

A trustless rotating savings and credit association (ROSCA) platform built on Stacks, powered by Bitcoin security. Save together. Grow together. No middlemen.

## Features

- **Trustless Design** - Smart contracts enforce all rules. No admin can steal or disappear with your money
- **Bitcoin-Backed Security** - Built on Stacks, anchored to Bitcoin
- **Fair Rotation System** - Deterministic payout order locked in code
- **Community-Driven** - Create or join Kolos with your community
- **Transparent** - All contributions and payouts tracked on-chain
- **Modern UX** - Beautiful, intuitive interface for seamless user experience

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A Stacks wallet (Hiro or Xverse)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kolox.git
cd kolox

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
kolox/
├── app/                    # Next.js app directory
│   ├── page.tsx          # Landing page
│   └── app/              # Protected app routes
│       ├── dashboard/    # Main dashboard
│       ├── create/       # Create Kolo
│       ├── join/         # Join Kolo
│       ├── kolo/[id]/    # Kolo details
│       ├── portfolio/    # User portfolio
│       └── settings/     # Settings
├── components/           # React components
│   ├── layout/          # Layout components
│   ├── forms/           # Form components
│   ├── wallet/          # Wallet integration
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
└── public/              # Static files
```

## Smart Contract

The smart contract is written in Clarity and handles:
- Kolo creation with immutable rules
- Member management and position tracking
- Contribution tracking per round
- Fair rotation-based payouts
- Security constraints and error handling

See the Clarity contract for full implementation details.

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS v4, Radix UI
- **Blockchain**: Stacks, Clarity Smart Contracts
- **Wallet Integration**: @stacks/connect, @stacks/transactions
- **Styling**: Tailwind CSS with custom design tokens

## Documentation

- **[STACKS_INTEGRATION.md](./STACKS_INTEGRATION.md)** - Complete guide to @stacks/connect and @stacks/transactions usage
- **[SETUP.md](./SETUP.md)** - Detailed setup and deployment instructions
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Integration implementation details
- **[Stacks Documentation](https://docs.stacks.co)** - Official Stacks documentation
- **[@stacks/connect Docs](https://docs.stacks.co/build-apps/authentication)** - Wallet authentication

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Deployment

Deploy to Vercel with a single click:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

For more details, see [SETUP.md](./SETUP.md) deployment section.

## Security

- All funds held in smart contract, not personal accounts
- Contract rules locked in code before Kolo starts
- No early payouts or rule changes possible
- Payout order immutable and transparent
- Bitcoin-level security via Stacks

## Roadmap

- [ ] Mainnet deployment
- [ ] Advanced analytics and insights
- [ ] DeFi integration for yield generation
- [ ] DAO governance for platform decisions
- [ ] Mobile app
- [ ] Multi-currency support
- [ ] Reputation system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## Disclaimer

KoloX is a prototype platform for community savings. Users are responsible for understanding the smart contract terms and risks before participating. Always verify contract addresses and conduct thorough testing on testnet before using on mainnet.

## Support

- GitHub Issues for bug reports
- Discussions for feature requests
- Email support (add contact info)
- Community Discord (add link)

---

Built with ❤️ for community savings on Stacks
