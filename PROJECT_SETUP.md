# Project Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL with PostGIS (for backend)
- Git

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173/

# Build for production
npm run build
```

### Backend Development
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Set up database (PostgreSQL with PostGIS)
createdb mara_bloom
psql -d mara_bloom -c "CREATE EXTENSION postgis;"

# Run migrations
npm run migrate

# Seed initial data
npm run seed

# Start backend server
npm run dev
# API available at http://localhost:3000/api/v1
```

## 🌿 Branch Management

### Current Branch Structure
- `main` - Production-ready frontend
- `feature/backend-implementation` - Complete backend architecture
- `phase-1` - Earlier development phase

### Creating New Feature Branches

#### From Current State (Recommended)
```bash
# Create new branch from current feature branch
git checkout -b feature/your-feature-name

# Or create from main for frontend-only work
git checkout main
git checkout -b feature/frontend-feature-name
```

#### For Backend Work
```bash
# Start from backend implementation branch
git checkout feature/backend-implementation
git checkout -b feature/backend-your-feature

# Make sure backend dependencies are installed
cd backend && npm install
```

## 📁 Project Structure

```
mara-bloom/
├── src/                          # Frontend React app
│   ├── components/
│   │   ├── layout/              # Header, Footer, Navigation
│   │   ├── sections/            # Page sections
│   │   └── ui/                  # shadcn/ui components
│   ├── pages/                   # Route components
│   ├── lib/                     # Utilities
│   └── integrations/            # Supabase, API clients
├── backend/                     # Backend API
│   ├── src/
│   │   ├── api/routes/         # API endpoints
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── services/           # Business logic
│   │   ├── db/                 # Database connection & migrations
│   │   └── types/              # TypeScript types
│   └── migrations/             # SQL migration files
├── public/                     # Static assets
└── docs/                       # Documentation
```

## 🔧 Development Workflow

### 1. Frontend Development
- Hot reload enabled with Vite
- Tailwind CSS for styling
- shadcn/ui components
- TypeScript for type safety

### 2. Backend Development
- Express.js with TypeScript
- PostgreSQL with PostGIS
- JWT authentication
- Comprehensive API documentation

### 3. Full Stack Development
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && npm run dev

# Frontend: http://localhost:5173/
# Backend API: http://localhost:3000/api/v1
```

## 🎯 Key Features Implemented

### Frontend ✅
- Dynamic Island Navigation (iOS-inspired)
- Responsive design with mobile optimization
- Dark/light theme support
- Glass morphism effects
- Advanced animations
- Donation system UI
- Admin panel structure

### Backend ✅
- Complete API architecture
- Authentication & authorization
- Database schema (30+ tables)
- Role-based access control
- Security middleware
- Logging system
- Migration system

### Pending 🔄
- Payment integrations (Stripe, M-PESA)
- File upload system
- Background workers
- Email/SMS notifications
- Testing suite

## 🚀 Deployment

### Frontend (Vercel)
- Already configured
- Automatic deployments from main branch
- Environment variables set

### Backend
- Ready for deployment
- Environment configuration needed
- Database setup required

## 📝 Development Notes

### Environment Variables
- Frontend: `.env` (Supabase config)
- Backend: `backend/.env` (Database, JWT secrets)

### Database
- PostgreSQL with PostGIS extension
- Comprehensive schema for nonprofit operations
- Audit logging and security features

### Security
- JWT with refresh tokens
- Role-based permissions
- Input validation
- Rate limiting
- CORS protection

## 🤝 Contributing

1. Create feature branch from appropriate base
2. Make changes with clear commit messages
3. Test thoroughly
4. Update documentation if needed
5. Create pull request

## 📞 Support

- Check existing documentation in `/backend/` folder
- Review API endpoints in `/backend/src/api/routes/`
- Frontend components in `/src/components/`