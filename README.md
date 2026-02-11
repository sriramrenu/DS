# DataSprint 3.0

Event management platform with separate frontend and backend.

## Project Structure

```
DataSprint3.0/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js pages (admin, login, participant)
│   │   ├── components/  # React components
│   │   ├── hooks/    # Custom React hooks
│   │   └── lib/      # Utility functions
│   └── package.json
│
└── backend/           # Express backend API
    ├── src/
    │   ├── lib/      # Database utilities
    │   └── index.ts  # Server entry point
    └── package.json
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:9002](http://localhost:9002)

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend will run on [http://localhost:3001](http://localhost:3001)

## Features

- **Admin Dashboard**: Manage submissions, scorecards, leaderboards, and members
- **Participant Dashboard**: View submissions and track progress
- **Login System**: Secure authentication
- **3D Hyperspeed Background**: Interactive Three.js background animation

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Three.js / React Three Fiber
- Recharts

### Backend
- Node.js
- Express
- TypeScript
