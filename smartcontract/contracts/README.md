# KoloX Smart Contracts

Modular smart contract system for community savings platform on Stacks blockchain.

## Contracts

- **kolox-kolo.clar** - Main ROSCA contract
- **constants.clar** - Error codes and configuration
- **traits.clar** - Interface definitions
- **utils.clar** - Utility functions

## Architecture

The contract system is modular for maintainability and reusability.

## Features

- Create and manage rotating savings groups (kolos)
- Automated contribution tracking
- Fair payout distribution
- Reputation system
- Emergency pause functionality

## Constants

- Weekly frequency: ~7 days (1008 blocks)
- Monthly frequency: ~30 days (4320 blocks)
- Minimum contribution: 1 STX
- Member limits: 2-50 per kolo


