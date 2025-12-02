# Mara Bloom Backend API

Backend API for Maasai Mara Women Empowerment Initiative.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 💰 Payment integrations (Stripe, M-PESA)
- 👥 Role-based access control (RBAC)
- 📊 Campaign and donation management
- 👩‍👧 Beneficiary and case management
- 🔄 Offline sync support
- 📱 SMS and email notifications
- 📈 Reporting and analytics
- 🔍 Audit logging
- 🗺️ GIS support (PostGIS)

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS
- **Queue**: BullMQ with Redis
- **Storage**: AWS S3
- **Payments**: Stripe, M-PESA Daraja
- **SMS**: Twilio
- **Email**: Nodemailer

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file with actual credentials

4. Run database migrations:
```bash
npm run migrate
```

5. Seed initial data:
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

## API Documentation

The API will be available at `http://localhost:3000/api/v1`

### Authentication

- `POST /api/v1/auth/login` - Login with email/password or phone/OTP
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot` - Request password reset
- `POST /api/v1/auth/reset` - Reset password
- `POST /api/v1/auth/otp/send` - Send OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP

### Campaigns

- `GET /api/v1/campaigns` - List campaigns
- `GET /api/v1/campaigns/:id` - Get campaign details
- `GET /api/v1/campaigns/:id/impact` - Get campaign impact metrics
- `POST /api/v1/campaigns` - Create campaign (Admin)
- `PUT /api/v1/campaigns/:id` - Update campaign (Admin)
- `DELETE /api/v1/campaigns/:id` - Delete campaign (Admin)

### Donations

- `POST /api/v1/donations` - Create donation
- `GET /api/v1/donations` - List donations (authenticated)
- `GET /api/v1/donations/:id` - Get donation details
- `POST /api/v1/donations/webhooks/stripe` - Stripe webhook
- `POST /api/v1/donations/webhooks/mpesa` - M-PESA webhook

### Beneficiaries

- `GET /api/v1/beneficiaries` - List beneficiaries (field-level access)
- `GET /api/v1/beneficiaries/:id` - Get beneficiary (field-level access)
- `POST /api/v1/beneficiaries` - Create beneficiary
- `PUT /api/v1/beneficiaries/:id` - Update beneficiary
- `DELETE /api/v1/beneficiaries/:id` - Delete beneficiary (Admin)

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Database Schema

See `migrations/` directory for database schema definitions.

## Security

- JWT tokens with short expiration (15 minutes)
- Refresh tokens stored securely
- Rate limiting on all endpoints
- CORS configured
- Helmet.js for security headers
- Input validation with Zod
- Field-level authorization

## Next Steps

1. Set up PostgreSQL database with PostGIS
2. Implement Prisma ORM or raw SQL queries
3. Set up Redis for job queues
4. Configure AWS S3 for file storage
5. Integrate Stripe and M-PESA payment providers
6. Set up Twilio for SMS
7. Configure email service
8. Implement background workers
9. Add comprehensive tests
10. Set up CI/CD pipeline

