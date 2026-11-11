# Salud Kawsay Platform

Omnichannel Home Healthcare & Nursing Platform (Ecuador).

## Architecture Overview

The system is organized as a monorepo applying **Hexagonal Architecture (Ports and Adapters)** and **Domain-Driven Design (DDD)** principles:

```
homecare-platform/
├── apps/
│   ├── web/               # React 18 + Vite Web Application
│   └── mobile/            # Expo / React Native Mobile Application
├── services/
│   └── api/               # Express + TypeScript Hexagonal Backend
│       ├── src/
│       │   ├── domain/           # Core Entities, Value Objects, Port Interfaces
│       │   ├── application/      # Use Cases (Business workflows)
│       │   └── infrastructure/   # Repositories, Security, Express HTTP Controllers
│       └── prisma/        # PostgreSQL Prisma Relational Schema
└── api/                   # Serverless entrypoint bridge
```

## Key Capabilities

- **Clinical Triage & Invariant Rules**: Automated early warning scoring for vital signs (`normal`, `advertencia`, `critico`).
- **Security & RBAC**: Built-in cryptographic JWT signing/verification (`HS256`), password hashing (`scrypt`), and role authorization (`admin`, `nurse`, `family`).
- **Data Persistence**: Relational PostgreSQL schema via Prisma ORM with backward-compatible In-Memory/JSON adapter for zero-dependency execution.
- **WhatsApp Webhook Integration**: Automated notifications for shift check-ins, vital sign alerts, and booking updates.
- **Mobile Nurse Workflow**: GPS shift check-in with geolocation and real-time medical logs.

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation
```bash
npm install
```

### Environment Configuration
Copy `.env.example` in `services/api/`:
```bash
cp services/api/.env.example services/api/.env
```

### Running Tests
Execute the automated test suite (Clinical Triage & Cryptographic Security):
```bash
npm test
```

### Development
- **Run API**: `npm run dev:api` (starts at `http://localhost:4000`)
- **Run Web Frontend**: `npm run dev:web` (starts at `http://localhost:3000`)
- **Run Mobile App**: `npm run dev:mobile` (starts Expo development server)

### Production Build
```bash
npm run build
```

