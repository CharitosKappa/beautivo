# Beautivo - Project Overview

## Introduction

Beautivo is a booking management application for beauty and wellness businesses (nail salons, hair salons, spas, etc.), built following the Treatwell model. The initial version focuses on a single shop, with architecture designed for future expansion into a multi-tenant marketplace.

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **UI Library**: Shadcn/UI with Tailwind CSS
- **Language**: TypeScript
- **Internationalization**: next-intl (Greek & English, auto-detection from browser)

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **ORM**: TypeORM
- **Authentication**: 
  - Customers: Passwordless (Email OTP)
  - Admin Panel: Email/Password with optional 2FA (TOTP)

### Database
- **Database**: PostgreSQL
- **Local Development**: Docker container

### External Services
- **Email**: Resend (designed for easy provider switching)
- **File Storage**: Cloudinary (planned migration to Cloudflare R2)
- **Analytics**: Google Analytics, Meta Pixel (Facebook/Instagram)

### Deployment (Production)
- **Frontend**: Vercel
- **Backend + Database**: Railway

## User Roles

### Customer
- Access: Public frontend only
- Authentication: Passwordless (email OTP)
- Auto-created on first conversion (Shopify-style)
- Capabilities: Browse services, make bookings, view booking history, manage upcoming appointments

### Employee (Staff)
- Access: Admin Panel
- Authentication: Email/Password (optional 2FA)
- Permissions: Based on assigned Custom Role
- Capabilities: Determined by role permissions (view bookings, create bookings, etc.)

### Shop Admin
- Access: Admin Panel (full access)
- Authentication: Email/Password (optional 2FA)
- Capabilities: Full shop management including services, staff, bookings, settings, and custom role creation

### Super Admin
- Access: Everything (platform-wide)
- Authentication: Email/Password with 2FA
- Capabilities: Access to all shops, platform settings, can enforce 2FA requirements

## Two Separate Interfaces

### 1. Frontend (Customer-Facing Website)
The public website designed to look like the shop's branded website. Customers can browse services, make bookings, and manage their appointments.

**Key Characteristics:**
- Branded as the shop's own website (not a platform)
- SEO optimized with structured data
- Mobile responsive
- Multi-language support (Greek/English)

### 2. Admin Panel (Staff Dashboard)
A separate administrative interface for shop management.

**Key Characteristics:**
- Accessible only by authenticated staff
- Role-based access control
- Calendar-centric booking management
- Comprehensive shop management tools

## MVP Features (Phase 1)

### Frontend Features
1. Shop presentation (photos, description, hours, location, contact)
2. Service catalog with categories
3. Complete booking flow with multiple service selection
4. Configurable employee selection (mandatory/optional/disabled per shop)
5. Passwordless authentication for customers
6. Customer account (booking history, upcoming appointments, cancellation)

### Admin Panel Features
1. Dashboard with basic statistics
2. Booking management (calendar view, create/edit/cancel)
3. Service management (CRUD, categories, pricing, employee assignment)
4. Staff management (CRUD, custom roles, complex schedules, time blocking)
5. Customer management (list, history, notes)
6. Shop settings (info, hours, booking configuration)
7. Custom roles system with granular permissions

### Notifications (Phase 1)
- Email only (via Resend)
- Booking confirmation
- Booking reminder
- Cancellation notification
- Recipients: Customers only

### Legal & Compliance
- Terms of Service page
- Privacy Policy page
- Cookie Policy page
- GDPR-compliant cookie consent banner

### SEO & Analytics
- Structured data (JSON-LD)
- Meta tags and Open Graph
- Automatic sitemap generation
- Google Analytics integration
- Meta Pixel integration
- LLM-friendly markup

## Phase 2 Features (Future)

- SMS/WhatsApp/Viber notifications with fallback logic
- Reviews and ratings system
- Online payments (deposit or full payment)
- Advanced analytics and reports
- Marketplace infrastructure (multi-tenant)
- Marketplace landing page with search

## Booking Settings (Configurable per Shop)

| Setting | Description | Default |
|---------|-------------|---------|
| Minimum booking notice | How soon before a slot can be booked | 30 minutes |
| Maximum advance booking | How far in the future bookings are allowed | 3 months |
| Buffer time | Time between appointments | 10-15 minutes (configurable) |
| Cancellation deadline | How late customers can cancel | Configurable |
| Employee selection | Mandatory / Optional / Disabled | Configurable |
| Slot calculation | Based on service duration + buffer | Dynamic |

## Technical Constraints

- One booking per employee per time slot (no overlapping)
- All times stored in UTC with timezone support
- Designed for any timezone (international marketplace ready)
- Local development first, cloud deployment when ready

## Development Workflow

1. **Local Development**: Full environment on developer's machine
2. **Version Control**: Git with GitHub for code synchronization
3. **Multi-device Support**: Work seamlessly between office PC and laptop
4. **Database Seeding**: Consistent test data across environments

## File Structure Overview

```
beautivo/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and helpers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
│
├── backend/                  # NestJS application
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── common/          # Shared utilities
│   │   ├── config/          # Configuration
│   │   └── database/        # Migrations and seeds
│   └── test/                # Tests
│
├── docs/                     # Project documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPECIFICATION.md
│   ├── FEATURES.md
│   ├── SETUP_GUIDE.md
│   └── CLAUDE_CODE_PROMPTS.md
│
├── docker-compose.yml        # Local development services
└── README.md                 # Quick start guide
```

## Why TypeORM?

This project uses TypeORM instead of Prisma for the following reasons:

1. **Native NestJS Integration**: TypeORM has official support via `@nestjs/typeorm`, making it the natural choice for NestJS projects.

2. **Decorator-Based Entities**: TypeORM uses TypeScript decorators to define entities, which matches the NestJS coding style perfectly.

3. **Mature and Stable**: TypeORM has been around longer and has proven stability in production environments.

4. **Built-in Features**: Migrations, repository pattern, and query builder are all built-in without additional CLI tools.

5. **Flexibility**: Supports both Active Record and Data Mapper patterns.
