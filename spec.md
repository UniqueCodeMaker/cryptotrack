# Crypto Investment Dashboard

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- User authentication: registration, login, profile management, transaction password
- Role-based access control: regular users and admins
- Portfolio management: holdings with cost basis (user-entered), current value tracking
- Wallet address tracking: users can add wallet addresses (BTC, ETH, etc.) which are labeled for display; live price data fetched via HTTP outcalls from public APIs
- Transaction history: users can log manual transactions (buy/sell entries)
- Performance charts: gain/loss over time, asset allocation pie chart
- Referral system: unique referral code per user, signup tracking, referral leaderboard
- Admin panel: user management (view, suspend, delete), platform-wide stats

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User store: username, hashed password, transaction password hash, role (user/admin), referral code, referredBy, status (active/suspended)
- Portfolio store: holdings per user (asset symbol, quantity, cost basis, wallet address label)
- Transaction log: per-user buy/sell entries (symbol, quantity, price, date, type)
- Referral store: referral code -> userId mapping, referral counts
- Admin APIs: listUsers, suspendUser, deleteUser, platformStats
- HTTP outcalls: fetch live crypto prices from CoinGecko public API
- Referral leaderboard query

### Frontend (React + TypeScript + Tailwind)
- Dark-themed crypto dashboard layout with sidebar navigation
- Auth pages: Login, Register (with optional referral code)
- Dashboard: portfolio value summary, top assets, recent transactions, performance chart
- Portfolio page: holdings table, add/edit holding form, asset allocation chart
- Wallets page: add labeled wallet addresses, display linked addresses per asset
- Transactions page: manual transaction log with buy/sell entries
- Referral page: unique link display, referral stats, leaderboard
- Admin panel: user management table, platform stats cards
- Profile page: update display name, change transaction password
- Charts via Recharts library
