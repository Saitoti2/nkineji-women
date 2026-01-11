# Backend Setup Guide

This guide will help you set up the backend system with a fully functional admin panel.

## Prerequisites

1. **PostgreSQL with PostGIS** - Install PostgreSQL and enable PostGIS extension
2. **Node.js** - Version 18 or higher
3. **Redis** (optional) - For job queues (can run without it initially)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A random secret string for JWT tokens
- `JWT_REFRESH_SECRET` - Another random secret string
- `FRONTEND_URL` - Your frontend URL (default: http://localhost:5173)

### 3. Set Up Database

```bash
# Run migrations to create all tables
npm run migrate

# Seed initial data (creates admin user)
npm run seed
```

### 4. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:3000/api/v1`

## Creating Your First Admin User

After running migrations, you can create an admin user using the seed script or manually:

### Option 1: Using Seed Script (Recommended)

The seed script will create a default admin user:
- **Email**: admin@maasaimarawomen.org
- **Password**: admin123 (CHANGE THIS IMMEDIATELY!)

### Option 2: Manual SQL

```sql
-- First, get the admin role ID
SELECT id FROM roles WHERE name = 'admin';

-- Create admin user (replace ROLE_ID with the ID from above)
INSERT INTO users (name, email, password_hash, role_id, is_active)
VALUES (
  'Admin User',
  'admin@maasaimarawomen.org',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt to hash your password
  'ROLE_ID',
  true
);
```

## Accessing the Admin Panel

1. Start both frontend and backend servers
2. Navigate to `http://localhost:5173/admin`
3. Login with your admin credentials
4. You'll have full access to:
   - **Dashboard** - View statistics and overview
   - **Campaigns** - Create, edit, and manage fundraising campaigns
   - **Donations** - View all donations and their status
   - **Beneficiaries** - Manage beneficiary records
   - **Users** - Create and manage user accounts

## Admin Features

### Campaign Management
- Create new fundraising campaigns
- Set goals, dates, and descriptions
- Update campaign status (draft, active, paused, completed)
- View raised amounts automatically calculated from donations
- Delete campaigns (soft delete)

### Donation Management
- View all donations with filters
- See donation status (pending, succeeded, failed, refunded)
- Track donations by campaign
- View donor information

### Beneficiary Management
- View all beneficiaries
- Create new beneficiary records
- Manage sensitive information (with proper access control)
- Track beneficiary data securely

### User Management
- Create new users with different roles
- Assign roles (admin, finance_officer, field_officer, etc.)
- Activate/deactivate users
- Manage user permissions

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Admin Routes (Require Admin Role)
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/campaigns` - List all campaigns
- `GET /api/v1/admin/donations` - List all donations
- `GET /api/v1/admin/beneficiaries` - List all beneficiaries
- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/users` - Create new user
- `PUT /api/v1/admin/users/:id` - Update user
- `GET /api/v1/admin/roles` - List all roles
- `GET /api/v1/admin/reports/donations` - Donation reports

### Public Routes
- `GET /api/v1/campaigns` - List active campaigns (public)
- `GET /api/v1/campaigns/:id` - Get campaign details
- `POST /api/v1/donations` - Create donation (public)

## Security Notes

1. **Change Default Passwords** - Immediately change the default admin password
2. **Use Strong JWT Secrets** - Generate strong random strings for JWT secrets
3. **Enable HTTPS** - In production, always use HTTPS
4. **Database Security** - Use strong database passwords and restrict access
5. **Environment Variables** - Never commit `.env` files to version control

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Ensure PostGIS extension is installed: `CREATE EXTENSION postgis;`

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration times
- Clear browser localStorage if tokens are corrupted

### CORS Issues
- Ensure FRONTEND_URL in `.env` matches your frontend URL
- Check CORS settings in `src/index.ts`

## Next Steps

1. **Configure Payment Providers** - Set up Stripe and/or M-PESA for donations
2. **Set Up File Storage** - Configure AWS S3 for media uploads
3. **Configure Email/SMS** - Set up Twilio and SMTP for notifications
4. **Set Up Redis** - For background job processing
5. **Production Deployment** - Deploy to your hosting provider

## Support

For issues or questions, check the main README.md or contact the development team.



