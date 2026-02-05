# Technical Architecture

## System Architecture Overview

The application follows a modern client-server architecture with clear separation between the frontend (Next.js), backend (NestJS), and database (PostgreSQL). This separation allows for independent scaling and deployment of each component.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   Customer      │    │   Employee      │    │   Admin         │  │
│  │   (Browser)     │    │   (Browser)     │    │   (Browser)     │  │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘  │
└───────────┼──────────────────────┼──────────────────────┼───────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│                           Vercel Hosting                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐ │
│  │   Public Website        │    │   Admin Panel                   │ │
│  │   (Customer-facing)     │    │   (Staff Dashboard)             │ │
│  │   - Service Catalog     │    │   - Booking Calendar            │ │
│  │   - Booking Flow        │    │   - Service Management          │ │
│  │   - Customer Account    │    │   - Staff Management            │ │
│  └─────────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ REST API / JSON
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                            │
│                          Railway Hosting                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    Auth      │  │   Booking    │  │   Services   │  ...         │
│  │   Module     │  │   Module     │  │   Module     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      TypeORM                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                           │
│                         Railway Hosting                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (Next.js)

### App Router Structure

The frontend uses Next.js App Router for file-based routing and server-side rendering capabilities.

```
frontend/src/
├── app/
│   ├── (public)/                    # Public routes (customer-facing)
│   │   ├── page.tsx                 # Homepage / Shop presentation
│   │   ├── services/
│   │   │   └── page.tsx             # Service catalog
│   │   ├── booking/
│   │   │   ├── page.tsx             # Booking flow start
│   │   │   ├── services/
│   │   │   │   └── page.tsx         # Service selection step
│   │   │   ├── employee/
│   │   │   │   └── page.tsx         # Employee selection step (if enabled)
│   │   │   ├── datetime/
│   │   │   │   └── page.tsx         # Date/time selection
│   │   │   ├── confirm/
│   │   │   │   └── page.tsx         # Booking confirmation
│   │   │   └── success/
│   │   │       └── page.tsx         # Success page
│   │   ├── account/
│   │   │   ├── page.tsx             # Customer dashboard
│   │   │   ├── bookings/
│   │   │   │   └── page.tsx         # Booking history
│   │   │   └── settings/
│   │   │       └── page.tsx         # Account settings
│   │   ├── auth/
│   │   │   └── verify/
│   │   │       └── page.tsx         # OTP verification
│   │   ├── terms/
│   │   │   └── page.tsx             # Terms of Service
│   │   ├── privacy/
│   │   │   └── page.tsx             # Privacy Policy
│   │   └── cookies/
│   │       └── page.tsx             # Cookie Policy
│   │
│   ├── admin/                       # Admin panel routes
│   │   ├── layout.tsx               # Admin layout with sidebar
│   │   ├── page.tsx                 # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx             # Admin login
│   │   ├── bookings/
│   │   │   ├── page.tsx             # Calendar view
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx         # Booking details
│   │   │   └── new/
│   │   │       └── page.tsx         # Create booking
│   │   ├── services/
│   │   │   ├── page.tsx             # Service list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx         # Edit service
│   │   │   └── new/
│   │   │       └── page.tsx         # Create service
│   │   ├── categories/
│   │   │   └── page.tsx             # Manage categories
│   │   ├── staff/
│   │   │   ├── page.tsx             # Staff list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx         # Edit staff member
│   │   │   └── new/
│   │   │       └── page.tsx         # Add staff member
│   │   ├── roles/
│   │   │   ├── page.tsx             # Role list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx         # Edit role
│   │   │   └── new/
│   │   │       └── page.tsx         # Create role
│   │   ├── customers/
│   │   │   ├── page.tsx             # Customer list
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Customer details
│   │   └── settings/
│   │       ├── page.tsx             # General settings
│   │       ├── hours/
│   │       │   └── page.tsx         # Working hours
│   │       ├── booking/
│   │       │   └── page.tsx         # Booking settings
│   │       └── notifications/
│   │           └── page.tsx         # Notification settings
│   │
│   ├── api/                         # API routes (if needed for BFF pattern)
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
│
├── components/
│   ├── ui/                          # Shadcn/UI components
│   ├── common/                      # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── CookieConsent.tsx
│   ├── booking/                     # Booking-related components
│   │   ├── ServiceCard.tsx
│   │   ├── EmployeeCard.tsx
│   │   ├── TimeSlotPicker.tsx
│   │   ├── BookingSummary.tsx
│   │   └── BookingCalendar.tsx
│   ├── admin/                       # Admin panel components
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── Calendar/
│   │   │   ├── DayView.tsx
│   │   │   └── WeekView.tsx
│   │   └── DataTable.tsx
│   └── forms/                       # Form components
│       ├── ServiceForm.tsx
│       ├── StaffForm.tsx
│       └── BookingForm.tsx
│
├── lib/
│   ├── api.ts                       # API client configuration
│   ├── auth.ts                      # Auth utilities
│   ├── utils.ts                     # General utilities
│   └── validations.ts               # Zod schemas for validation
│
├── hooks/
│   ├── useAuth.ts                   # Authentication hook
│   ├── useBooking.ts                # Booking state management
│   └── usePermissions.ts            # Permission checking
│
├── i18n/
│   ├── config.ts                    # i18n configuration
│   ├── locales/
│   │   ├── el.json                  # Greek translations
│   │   └── en.json                  # English translations
│   └── middleware.ts                # Language detection middleware
│
├── types/
│   └── index.ts                     # TypeScript type definitions
│
└── styles/
    └── globals.css                  # Tailwind and global styles
```

### State Management

For this application, we use a combination of React's built-in state management tools along with TanStack Query for server state.

Local State is handled with React useState and useReducer for component-level state such as form inputs and UI toggles.

Server State is managed with TanStack Query (React Query) for API data fetching, caching, and synchronization.

Global Client State uses React Context for global UI state including language, theme, and user session.

Form State is managed with React Hook Form combined with Zod validation.

### Styling Approach

The application uses Tailwind CSS as the utility framework with Shadcn/UI providing pre-built, customizable components. All custom classes should use Tailwind utilities. Component-specific styles can use CSS modules if needed. The design tokens are defined in tailwind.config.js. Dark mode is not required for MVP but the structure should support future implementation.

## Backend Architecture (NestJS)

### Module Structure

NestJS uses a modular architecture where each feature is encapsulated in its own module. This promotes code organization, reusability, and testability.

```
backend/src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
│
├── config/
│   ├── configuration.ts             # Environment configuration
│   ├── database.config.ts           # TypeORM configuration
│   ├── typeorm.config.ts            # TypeORM CLI configuration
│   └── validation.ts                # Config validation schema
│
├── common/
│   ├── entities/
│   │   └── base.entity.ts           # Base entity with common fields
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── permissions.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── utils/
│       ├── date.utils.ts            # Timezone handling
│       └── pagination.utils.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── entities/
│   │   │   └── refresh-token.entity.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   └── 2fa.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── verify-otp.dto.ts
│   │       └── setup-2fa.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── user-schedule.entity.ts
│   │   │   └── user-time-block.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── customers/
│   │   ├── customers.module.ts
│   │   ├── customers.controller.ts
│   │   ├── customers.service.ts
│   │   ├── entities/
│   │   │   └── customer.entity.ts
│   │   └── dto/
│   │       └── create-customer.dto.ts
│   │
│   ├── shops/
│   │   ├── shops.module.ts
│   │   ├── shops.controller.ts
│   │   ├── shops.service.ts
│   │   ├── entities/
│   │   │   ├── shop.entity.ts
│   │   │   ├── shop-working-hours.entity.ts
│   │   │   └── shop-special-day.entity.ts
│   │   └── dto/
│   │       └── update-shop.dto.ts
│   │
│   ├── services/
│   │   ├── services.module.ts
│   │   ├── services.controller.ts
│   │   ├── services.service.ts
│   │   ├── entities/
│   │   │   └── service.entity.ts
│   │   └── dto/
│   │       ├── create-service.dto.ts
│   │       └── update-service.dto.ts
│   │
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   └── dto/
│   │       └── create-category.dto.ts
│   │
│   ├── roles/
│   │   ├── roles.module.ts
│   │   ├── roles.controller.ts
│   │   ├── roles.service.ts
│   │   ├── entities/
│   │   │   └── role.entity.ts
│   │   └── dto/
│   │       └── create-role.dto.ts
│   │
│   ├── bookings/
│   │   ├── bookings.module.ts
│   │   ├── bookings.controller.ts
│   │   ├── bookings.service.ts
│   │   ├── availability.service.ts  # Slot calculation logic
│   │   ├── entities/
│   │   │   ├── booking.entity.ts
│   │   │   └── booking-service.entity.ts
│   │   └── dto/
│   │       ├── create-booking.dto.ts
│   │       └── update-booking.dto.ts
│   │
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   ├── email.service.ts
│   │   ├── entities/
│   │   │   └── notification-log.entity.ts
│   │   └── templates/
│   │       ├── booking-confirmation.ts
│   │       ├── booking-reminder.ts
│   │       └── booking-cancellation.ts
│   │
│   └── uploads/
│       ├── uploads.module.ts
│       ├── uploads.controller.ts
│       └── uploads.service.ts       # Cloudinary integration
│
├── database/
│   ├── migrations/                  # TypeORM migrations
│   └── seeds/
│       ├── seed.ts                  # Main seed script
│       └── data/                    # Seed data files
│
└── test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```

### TypeORM Integration

TypeORM integrates with NestJS through the official `@nestjs/typeorm` package. Each module registers its entities:

```typescript
// In a feature module (e.g., bookings.module.ts)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingService as BookingServiceEntity } from './entities/booking-service.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingServiceEntity]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
```

### API Design Principles

The API follows RESTful conventions with the following patterns.

Resource Naming uses plural nouns for collections such as /services and /bookings. Nested resources are used when there's a clear parent-child relationship like /shops/:shopId/services.

HTTP Methods follow standard conventions where GET is for retrieval, POST is for creation, PATCH is for partial updates, and DELETE is for removal.

Response Format uses a consistent JSON structure with data, metadata for pagination, and error handling.

Authentication uses JWT tokens with short expiry and refresh token rotation.

Authorization is permission-based using custom decorators and guards.

### Permission System Architecture

The custom roles system allows Shop Admins to create roles with specific permissions. Each permission is a string identifier that maps to specific actions.

```typescript
// Permission categories and their permissions
const PERMISSIONS = {
  BOOKINGS: {
    VIEW: 'bookings.view',
    CREATE: 'bookings.create',
    UPDATE: 'bookings.update',
    DELETE: 'bookings.delete',
  },
  SERVICES: {
    VIEW: 'services.view',
    CREATE: 'services.create',
    UPDATE: 'services.update',
    DELETE: 'services.delete',
  },
  STAFF: {
    VIEW: 'staff.view',
    CREATE: 'staff.create',
    UPDATE: 'staff.update',
    DELETE: 'staff.delete',
  },
  CUSTOMERS: {
    VIEW: 'customers.view',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    UPDATE: 'settings.update',
  },
  ROLES: {
    VIEW: 'roles.view',
    CREATE: 'roles.create',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
  },
};
```

## Database Architecture

See DATABASE_SCHEMA.md for complete schema details. Key architectural decisions include using soft deletes for important records like bookings and customers with a deletedAt timestamp. All tables include created and updated timestamps for audit trail purposes. UUID primary keys are used for all tables for security and distributed system compatibility. All times are stored in UTC with shop timezone stored separately for display conversion.

### TypeORM vs Prisma

This project uses TypeORM instead of Prisma for the following reasons:

1. **Native NestJS Integration**: TypeORM has official NestJS support via `@nestjs/typeorm`, making setup and usage seamless.

2. **Decorator-Based Entities**: TypeORM uses TypeScript decorators to define entities, which matches the NestJS coding style and keeps everything in TypeScript.

3. **Mature and Stable**: TypeORM has been around longer and has proven stability in production environments.

4. **Built-in Migration System**: TypeORM includes migration generation and execution without requiring additional CLI tools.

5. **Active Record & Data Mapper Patterns**: Supports both patterns, giving flexibility in how you structure your code.

## Authentication Flow

### Customer Authentication (Passwordless)

The customer authentication process begins when the customer enters their email on the booking form or account page. The system checks if a customer exists with that email, creating one if not. A 6-digit OTP is generated and a hashed version is stored with a 10-minute expiration. The OTP is sent via email to the customer. When the customer enters the OTP in the verification form, the system verifies it against the stored hash. If valid, a JWT token is generated and returned to the frontend. The frontend stores the token and includes it in subsequent requests.

### Admin Authentication (Email/Password + Optional 2FA)

For basic admin authentication without 2FA, the user enters their email and password, the system validates credentials against the stored hash, and if valid, JWT tokens are generated and returned.

When 2FA is enabled, after credential validation, a temporary token is returned indicating 2FA is required. The user enters their TOTP code from their authenticator app, the system verifies the code, and if valid, JWT tokens are generated and returned.

For 2FA setup, the admin goes to security settings and clicks "Enable 2FA", the system generates a TOTP secret and returns a QR code, the admin scans the QR code with their authenticator app, enters the current code to verify setup, and the system stores the encrypted TOTP secret and enables 2FA.

## Notification System Architecture

The notification system is designed with provider abstraction to allow easy switching between email providers and future addition of SMS, WhatsApp, and Viber.

```typescript
// Provider interface
interface NotificationProvider {
  send(notification: Notification): Promise<void>;
}

// Email provider (Resend implementation)
class ResendEmailProvider implements NotificationProvider {
  async send(notification: EmailNotification): Promise<void> {
    // Send via Resend API
  }
}

// Notification service using strategy pattern
class NotificationService {
  private providers: Map<NotificationType, NotificationProvider>;
  
  async send(type: NotificationType, notification: Notification): Promise<void> {
    const provider = this.providers.get(type);
    await provider.send(notification);
  }
}
```

## Internationalization (i18n) Architecture

### Frontend Implementation

The application uses next-intl for Next.js internationalization with automatic locale detection. The locale detection priority follows this order: URL path prefix if present, then saved user preference cookie, then Accept-Language header from browser, and finally fallback to Greek (el).

Translation files are organized by namespace including common for buttons and navigation, booking for the booking flow, admin for the admin panel, errors for error messages, and emails for email templates.

### Backend Implementation

The backend returns translatable content with translation keys rather than hardcoded text where appropriate. Error messages include translation keys and notification templates support multiple languages.

## Error Handling Strategy

### Backend Errors

All errors follow a consistent format with statusCode, message, error type, and optional timestamp. NestJS exception filters catch and format all errors consistently. Custom exception classes extend the base HttpException for domain-specific errors like BookingConflictException, SlotUnavailableException, and InvalidOtpException.

### Frontend Error Handling

API errors are caught by TanStack Query and displayed using toast notifications for transient errors. Form validation errors are displayed inline next to relevant fields. Network errors trigger a retry mechanism with exponential backoff. Unexpected errors are caught by an error boundary that displays a user-friendly message.

## Security Considerations

### Authentication Security

JWT tokens have a short expiry time of 15 minutes. Refresh tokens last 7 days with rotation enabled. Password hashing uses bcrypt with appropriate cost factor. OTP codes are hashed before storage. Rate limiting applies to login and OTP endpoints.

### Data Security

All API endpoints validate input using class-validator. SQL injection is prevented through TypeORM's parameterized queries. XSS is prevented through React's automatic escaping. CSRF protection is implemented for state-changing operations.

### Infrastructure Security

HTTPS is enforced in production. CORS is configured to allow only specific origins. Security headers are set by Next.js and NestJS. Environment variables are used for all secrets. Database access is restricted to the backend only.
