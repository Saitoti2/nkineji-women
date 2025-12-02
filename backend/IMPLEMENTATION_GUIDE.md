# Backend Implementation Guide

This document outlines the backend implementation based on the comprehensive requirements provided.

## Current Status

✅ **Completed:**
- Backend directory structure
- Express.js server setup
- Authentication middleware (JWT)
- Authorization middleware (RBAC)
- Request validation with Zod
- Error handling
- Logging system
- Database schema (SQL migrations)
- API route structure
- Service layer structure

🔄 **In Progress:**
- Database connection implementation
- Service implementations (placeholder)

⏳ **Next Steps:**
1. Set up PostgreSQL database with PostGIS
2. Implement actual database queries in services
3. Payment integrations (Stripe, M-PESA)
4. Background workers (BullMQ)
5. File upload handling (S3)
6. Notification system
7. Offline sync implementation
8. Testing suite

## Architecture Overview

```
backend/
├── src/
│   ├── api/
│   │   └── routes/          # API route handlers
│   ├── middleware/          # Auth, validation, error handling
│   ├── services/            # Business logic
│   ├── models/              # Data models (to be added)
│   ├── db/                  # Database connection & migrations
│   ├── utils/               # Utilities (logger, etc.)
│   └── types/               # TypeScript types & schemas
├── migrations/              # SQL migration files
└── tests/                   # Test files
```

## Database Schema

The database includes:

### Core Tables
- `users` - User accounts with roles
- `roles` - Role definitions with permissions
- `organisations` - Organization/Conservancy data
- `donors` - Donor information
- `campaigns` - Fundraising campaigns
- `donations` - Donation transactions
- `wallets` - Escrow/project wallets
- `beneficiaries` - Women & girls (encrypted PII)
- `consent_records` - Consent management
- `rescue_cases` - Rescue case management
- `case_notes` - Case notes with ACLs

### Microfinance
- `microloans` - Loan applications and management
- `loan_repayments` - Repayment tracking
- `groups` - Savings groups
- `group_contributions` - Group contributions

### Health
- `patients` - Patient records
- `antenatal_visits` - Maternal health visits
- `referrals` - Health referrals
- `screening_campaigns` - Health screening campaigns
- `health_vouchers` - Voucher system

### Conservation
- `incidents` - Field incidents (GIS)
- `corridors` - Wildlife corridors (PostGIS)
- `boreholes` - Water boreholes (PostGIS)
- `iot_telemetry` - IoT device data
- `grazing_plans` - Grazing management

### System
- `audit_logs` - Audit trail
- `refresh_tokens` - Token revocation
- `media_attachments` - File storage references
- `notifications` - Notification queue
- `sync_batches` - Offline sync
- `sync_items` - Sync item tracking

## API Endpoints Structure

### Authentication (`/api/v1/auth`)
- `POST /login` - Login (email/password or phone/OTP)
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout
- `POST /forgot` - Request password reset
- `POST /reset` - Reset password
- `POST /otp/send` - Send OTP
- `POST /otp/verify` - Verify OTP

### Campaigns (`/api/v1/campaigns`)
- `GET /` - List campaigns (public)
- `GET /:id` - Get campaign details
- `GET /:id/impact` - Get impact metrics
- `POST /` - Create campaign (Admin)
- `PUT /:id` - Update campaign (Admin)
- `DELETE /:id` - Delete campaign (Admin)

### Donations (`/api/v1/donations`)
- `POST /` - Create donation (public or authenticated)
- `GET /` - List donations (authenticated)
- `GET /:id` - Get donation details
- `POST /webhooks/stripe` - Stripe webhook
- `POST /webhooks/mpesa` - M-PESA webhook

### Beneficiaries (`/api/v1/beneficiaries`)
- `GET /` - List beneficiaries (field-level access)
- `GET /:id` - Get beneficiary (field-level access)
- `POST /` - Create beneficiary
- `PUT /:id` - Update beneficiary
- `DELETE /:id` - Delete beneficiary (Admin)

## Roles & Permissions

### Role Hierarchy
1. **Super Admin** - Full system access
2. **Admin** - Organization management
3. **Finance Officer** - Financial operations
4. **Conservation Officer** - GIS & conservation
5. **Health Officer** - Maternal & women's health
6. **Education Officer** - Rescue & education
7. **Field Officer** - Field operations
8. **Community Rep** - Read-only community data
9. **Donor** - Donor portal access
10. **Auditor** - Read-only audit access

## Security Features

- ✅ JWT authentication with short-lived tokens (15 min)
- ✅ Refresh token rotation
- ✅ Role-based access control (RBAC)
- ✅ Field-level authorization (planned)
- ✅ Input validation with Zod
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ SQL injection protection (parameterized queries)
- ✅ PII encryption at rest (planned)

## Next Implementation Steps

### Phase 1: Core Functionality
1. Set up PostgreSQL with PostGIS
2. Implement database queries in services
3. Complete authentication flow
4. Implement campaign CRUD
5. Implement donation creation and webhooks

### Phase 2: Payment Integration
1. Stripe integration
2. M-PESA Daraja integration
3. Webhook handlers
4. Payment reconciliation

### Phase 3: Beneficiary Management
1. Beneficiary CRUD with encryption
2. Consent management
3. Rescue case workflow
4. Field-level access control

### Phase 4: Advanced Features
1. Offline sync implementation
2. Media upload (S3)
3. Background workers
4. Notification system
5. Reporting & exports

### Phase 5: Testing & Deployment
1. Unit tests
2. Integration tests
3. E2E tests
4. Load testing
5. CI/CD pipeline
6. Production deployment

## Environment Setup

1. Install PostgreSQL with PostGIS extension
2. Install Redis for job queues
3. Set up AWS S3 bucket
4. Configure Stripe account
5. Configure M-PESA Daraja API
6. Set up Twilio for SMS
7. Configure SMTP for email

## Running the Backend

```bash
# Install dependencies
cd backend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev
```

## Integration with Frontend

The frontend should:
1. Use the backend API endpoints
2. Store JWT tokens securely
3. Handle token refresh
4. Implement proper error handling
5. Show loading states
6. Handle offline scenarios

See `FRONTEND_INTEGRATION.md` for details.

