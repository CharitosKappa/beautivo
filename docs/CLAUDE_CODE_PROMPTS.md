# Claude Code Prompts Guide

## How to Use This Document

This document contains ready-to-use prompts organized by development phase. Each phase builds upon the previous one, so follow them in order.

For each phase, you will find a description explaining what will be built, prerequisites listing what must be completed before starting, the prompt to copy and paste into Claude Code, and a verification checklist to confirm the phase was completed successfully.

Simply copy the prompt from each phase, paste it into Claude Code, and let it implement that part of the application. After completion, verify using the checklist before moving to the next phase.

---

## Phase 1: Project Initialization

### Description
Set up the initial project structure with Next.js frontend, NestJS backend, and Docker configuration for the local PostgreSQL database.

### Prerequisites
- Node.js v20+ installed
- Docker Desktop installed and running
- Git installed and configured

### Prompt

```
I'm building a booking application for beauty salons (nail salons, hair salons, etc.) called "Beautivo", similar to Treatwell. Please read the documentation files in the /docs folder to understand the full project requirements:

- PROJECT_OVERVIEW.md - General overview and tech stack
- ARCHITECTURE.md - Technical architecture and folder structure
- DATABASE_SCHEMA.md - Complete database schema with TypeORM entities

For this phase, please set up the initial project structure:

1. Create a monorepo structure with /frontend and /backend folders

2. Frontend (Next.js):
   - Initialize a Next.js 14+ project with TypeScript
   - Set up the App Router structure as defined in ARCHITECTURE.md
   - Install and configure Tailwind CSS
   - Install and configure Shadcn/UI (run the init command and add basic components: button, input, card, dialog, dropdown-menu, form, label, select, toast)
   - Set up next-intl for internationalization with Greek (el) and English (en)
   - Create the basic translation files structure
   - Configure automatic locale detection from browser

3. Backend (NestJS):
   - Initialize a NestJS project with TypeScript
   - Set up the module structure as defined in ARCHITECTURE.md
   - Install and configure TypeORM with PostgreSQL (npm install @nestjs/typeorm typeorm pg)
   - Create the complete TypeORM entities from DATABASE_SCHEMA.md
   - Create a base entity class with id, createdAt, updatedAt fields
   - Set up TypeORM configuration in app.module.ts
   - Create TypeORM CLI configuration for migrations (typeorm.config.ts)
   - Set up configuration module with environment variables validation
   - Create a basic health check endpoint at GET /api/v1/health

4. Docker:
   - Create docker-compose.yml for local PostgreSQL database
   - Configure volume for data persistence
   - Set up environment variables

5. Root level:
   - Create a root package.json with scripts to run both frontend and backend
   - Create a comprehensive .gitignore
   - Create a README.md with quick start instructions

6. Database Setup:
   - Add npm scripts for TypeORM migrations:
     - "migration:generate": for generating migrations from entity changes
     - "migration:run": for running pending migrations
     - "migration:revert": for reverting migrations
   - Generate and run initial migration to create all tables

Make sure all TypeScript configurations are strict and consistent across both projects. The frontend should be able to communicate with the backend at localhost:3001.
```

### Verification Checklist
- [ ] Running `docker compose up -d` starts PostgreSQL without errors
- [ ] Running `npm install` in both frontend and backend completes successfully
- [ ] Running `npm run migration:run` in backend creates all tables
- [ ] Running `npm run start:dev` in backend starts the server at localhost:3001
- [ ] GET http://localhost:3001/api/v1/health returns a success response
- [ ] Running `npm run dev` in frontend starts the app at localhost:3000
- [ ] The frontend shows a basic page without errors
- [ ] Changing browser language preference changes the displayed language
- [ ] Database has all tables created (check with a PostgreSQL client)

---

## Phase 2: Authentication System

### Description
Implement the complete authentication system including passwordless auth for customers and email/password with optional 2FA for admin users.

### Prerequisites
- Phase 1 completed and verified
- Resend API key (get from https://resend.com - free tier is fine for development)

### Prompt

```
Now let's implement the authentication system. Please read these documentation files for reference:

- ARCHITECTURE.md - Authentication flow details
- API_SPECIFICATION.md - Auth endpoint specifications
- DATABASE_SCHEMA.md - User, Customer, and RefreshToken entities

Implement the following:

1. Backend Authentication Module:

   Customer Authentication (Passwordless):
   - POST /api/v1/auth/customer/request-otp
     - Accept shopId and email
     - Create customer if doesn't exist (use TypeORM repository)
     - Generate 6-digit OTP, hash it with bcrypt, store with 10-minute expiry
     - Send OTP via email (use Resend)
     - In development, also log the OTP to console for testing
   
   - POST /api/v1/auth/customer/verify-otp
     - Verify OTP against stored hash
     - Return JWT access token (15 min expiry) and refresh token (7 days)
     - Invalidate used OTP
   
   Admin Authentication:
   - POST /api/v1/auth/admin/login
     - Validate email and password (use bcrypt)
     - If 2FA enabled, return tempToken and requires2FA flag
     - If 2FA not enabled, return JWT tokens and user info
   
   - POST /api/v1/auth/admin/verify-2fa
     - Verify TOTP code using the tempToken
     - Return JWT tokens on success
   
   - POST /api/v1/auth/admin/setup-2fa (protected)
     - Generate TOTP secret
     - Return QR code as data URL and secret
   
   - POST /api/v1/auth/admin/confirm-2fa (protected)
     - Verify the TOTP code
     - Enable 2FA for the user
   
   - POST /api/v1/auth/admin/disable-2fa (protected)
     - Require current TOTP code and password
     - Disable 2FA for the user

   Token Management:
   - POST /api/v1/auth/refresh
     - Validate refresh token
     - Rotate tokens (issue new pair, invalidate old)
   
   - POST /api/v1/auth/logout
     - Invalidate refresh token

2. Guards and Decorators:
   - JwtAuthGuard for protected routes
   - RolesGuard for role-based access
   - PermissionsGuard for permission-based access
   - @CurrentUser() decorator to get user from request
   - @Public() decorator to mark public endpoints
   - @Permissions() decorator to specify required permissions

3. Email Service:
   - Create a notification module with email service
   - Use Resend as the email provider
   - Create email templates for OTP verification
   - Abstract the provider interface for future expansion

4. Frontend Auth Components:

   Customer Auth:
   - Create OTP request form component
   - Create OTP verification component with 6-digit input
   - Create useAuth hook for managing auth state
   - Store tokens securely (httpOnly cookies preferred, or secure localStorage)
   
   Admin Auth:
   - Create admin login page at /admin/login
   - Create 2FA verification component
   - Create 2FA setup flow in profile settings
   - Implement protected route wrapper for admin pages

5. Security Measures:
   - Rate limiting on auth endpoints (use @nestjs/throttler)
   - OTP attempt limiting (max 5 attempts)
   - Secure password requirements validation
   - CORS configuration for frontend origin

Use the libraries: @nestjs/jwt, @nestjs/passport, passport-jwt, passport-local, bcrypt, otplib (for TOTP), qrcode (for QR generation), and @nestjs/throttler.

For all database operations, use TypeORM repositories injected via @InjectRepository().
```

### Verification Checklist
- [ ] Customer can request OTP and receives email (check console in dev)
- [ ] Customer can verify OTP and receives tokens
- [ ] Invalid OTP returns appropriate error
- [ ] Expired OTP returns appropriate error
- [ ] Admin can login with email/password
- [ ] Admin can set up 2FA and sees QR code
- [ ] Admin can verify 2FA code and complete login
- [ ] Protected endpoints reject requests without valid token
- [ ] Refresh token rotation works correctly
- [ ] Rate limiting blocks excessive requests

---

## Phase 3: Shop and Settings Management

### Description
Implement shop management including basic info, working hours, special days, and booking settings.

### Prerequisites
- Phase 2 completed and verified

### Prompt

```
Now let's implement shop and settings management. Reference:

- API_SPECIFICATION.md - Shop endpoints
- FEATURES.md - A8: Shop Settings
- DATABASE_SCHEMA.md - Shop, ShopWorkingHours, ShopSpecialDay entities

Implement the following:

1. Backend Shop Module:

   Public Endpoints:
   - GET /api/v1/shops/:id
     - Return shop public info (name, description, contact, address, location, images)
     - Include working hours (use TypeORM relations)
     - Include only relevant booking settings (employeeSelection)
     - Transform data for public consumption (hide internal fields)

   Admin Endpoints (protected, require appropriate permissions):
   - PATCH /api/v1/shops/:id
     - Update basic shop info
     - Require 'settings.update' permission
   
   - PATCH /api/v1/shops/:id/settings
     - Update booking settings (minBookingNotice, maxAdvanceBooking, bufferTime, etc.)
     - Validate settings values
     - Require 'settings.booking' permission
   
   - PUT /api/v1/shops/:id/working-hours
     - Replace all working hours (delete existing, create new)
     - Validate time formats
     - Require 'settings.hours' permission
   
   - GET /api/v1/shops/:id/special-days
   - POST /api/v1/shops/:id/special-days
   - PUT /api/v1/shops/:id/special-days/:dayId
   - DELETE /api/v1/shops/:id/special-days/:dayId
     - CRUD for special days (holidays, custom hours)
     - Require 'settings.hours' permission

2. Frontend - Admin Settings Pages:

   General Settings Page (/admin/settings):
   - Form for shop name, description (both languages), email, phone
   - Address fields with optional map picker for coordinates
   - Logo and cover image upload (prepare UI, actual upload in Phase 8)
   - Gallery management for multiple images

   Working Hours Page (/admin/settings/hours):
   - Day-by-day schedule editor
   - Toggle for open/closed per day
   - Time inputs for start and end
   - "Apply to All" button to copy one day's schedule
   - Visual week overview

   Special Days Management:
   - List of upcoming special days
   - Add/Edit dialog with date picker, closed toggle, custom hours
   - Reason field for internal reference
   - Delete confirmation

   Booking Settings Page (/admin/settings/booking):
   - Minimum booking notice dropdown (15, 30, 60, 120, 240 minutes)
   - Maximum advance booking dropdown (1, 2, 3, 6 months)
   - Buffer time input (minutes)
   - Cancellation deadline dropdown
   - Employee selection mode (mandatory/optional/disabled)
   - Default booking status (confirmed/pending)

3. Frontend - Public Shop Display:

   Homepage Components:
   - Hero section with cover image, logo, name
   - About section with description
   - Working hours display (highlight today)
   - Location section with embedded Google Map (or placeholder)
   - Contact information

4. Seed Data:
   - Create a seed script (npm run seed) using TypeORM
   - Create a complete sample shop
   - Include realistic working hours (Monday-Saturday 9:00-20:00)
   - Include a couple of special days (upcoming holiday)
   - Set sensible default booking settings

Make sure all times are handled in the shop's timezone for display but stored in UTC in the database. Use TypeORM query builder or repository methods for all database operations.
```

### Verification Checklist
- [ ] Public shop endpoint returns correct data
- [ ] Admin can update shop basic info
- [ ] Admin can update working hours
- [ ] Admin can add/edit/delete special days
- [ ] Admin can update booking settings
- [ ] Frontend settings pages load and save correctly
- [ ] Homepage displays shop info correctly
- [ ] Working hours show correctly with today highlighted
- [ ] Seed script creates complete shop data

---

## Phase 4: Service and Category Management

### Description
Implement service catalog management with categories, pricing, and duration.

### Prerequisites
- Phase 3 completed and verified

### Prompt

```
Now let's implement service and category management. Reference:

- API_SPECIFICATION.md - Service and Category endpoints
- FEATURES.md - A4: Service Management, F2: Service Catalog
- DATABASE_SCHEMA.md - Category, Service entities and ManyToMany relation with User

Implement the following:

1. Backend Categories Module:

   - GET /api/v1/shops/:id/categories (public)
     - Return active categories by default
     - Include service count per category (use TypeORM query builder with COUNT)
     - Support includeInactive query param (admin only)
     - Order by sortOrder
   
   - POST /api/v1/shops/:id/categories (protected, categories.manage)
   - PATCH /api/v1/shops/:id/categories/:categoryId (protected)
   - DELETE /api/v1/shops/:id/categories/:categoryId (protected)
     - On delete, set services' categoryId to null
   
   - PUT /api/v1/shops/:id/categories/reorder (protected)
     - Accept array of category IDs in new order
     - Update sortOrder accordingly

2. Backend Services Module:

   - GET /api/v1/shops/:id/services (public)
     - Return active services by default
     - Support filtering by categoryId
     - Support search by name (use TypeORM LIKE query)
     - Include category info (use relations)
     - Include assigned staff (id, firstName only)
     - Order by category sortOrder, then service sortOrder
   
   - GET /api/v1/shops/:id/services/:serviceId (public)
     - Full service details including description
   
   - POST /api/v1/shops/:id/services (protected, services.create)
     - Create service with all fields
     - Handle staff assignment (ManyToMany relation via @JoinTable)
   
   - PATCH /api/v1/shops/:id/services/:serviceId (protected, services.update)
   
   - DELETE /api/v1/shops/:id/services/:serviceId (protected, services.delete)
     - Check for active bookings before deleting
     - Consider soft delete or deactivation instead

3. Frontend - Admin Service Management:

   Service List Page (/admin/services):
   - Table with columns: name, category, duration, price, status, actions
   - Category filter dropdown
   - Status filter (active/inactive/all)
   - Search input
   - "Add Service" button
   - Row actions: edit, toggle active, delete
   - Drag-and-drop reordering within categories (optional for MVP)

   Service Form (dialog or page):
   - Name fields (Greek and English)
   - Description fields (both languages)
   - Category dropdown with "Create New" option
   - Duration input (with preset buttons: 15, 30, 45, 60, 90, 120 min)
   - Price input with currency display
   - Buffer time override (optional)
   - Staff assignment multi-select
   - Image upload (prepare UI, actual upload in Phase 8)
   - Active/inactive toggle

   Category Management:
   - Can be inline in service management or separate section
   - Simple list with edit/delete
   - Reorder capability

4. Frontend - Public Service Catalog:

   Services Page (/services):
   - Category tabs/pills for filtering
   - "All" option to show everything
   - Service cards in a grid layout
   - Each card shows: name, price, duration, brief description
   - Click opens service detail (modal or page)
   - "Book Now" button on each service

   Service Card Component:
   - Clean, minimal design
   - Service image (or placeholder)
   - Name in current language
   - Price formatted with currency
   - Duration in human-readable format (30 min, 1h 15min)
   - Short description (truncated)

5. Seed Data:
   - Create sample categories: "Μανικιούρ/Manicure", "Πεντικιούρ/Pedicure", "Nail Art"
   - Create 3-5 services per category with realistic prices and durations
   - Assign services to staff members

Ensure all text fields support both Greek and English, displaying the appropriate language based on user preference. Use TypeORM repository pattern for all database operations.
```

### Verification Checklist
- [ ] Categories CRUD works correctly
- [ ] Services CRUD works correctly
- [ ] Service-staff assignment works (ManyToMany)
- [ ] Public catalog displays services correctly
- [ ] Category filtering works
- [ ] Search works
- [ ] Bilingual content displays correctly
- [ ] Admin can reorder categories
- [ ] Seed creates realistic sample data

---

## Phase 5: Staff and Role Management

### Description
Implement staff management with custom roles, schedules, and time blocks.

### Prerequisites
- Phase 4 completed and verified

### Prompt

```
Now let's implement staff and role management. Reference:

- API_SPECIFICATION.md - Staff and Role endpoints
- FEATURES.md - A5: Staff Management, A6: Role Management
- DATABASE_SCHEMA.md - User, Role, UserSchedule, UserTimeBlock entities
- ARCHITECTURE.md - Permission system architecture

Implement the following:

1. Backend Roles Module:

   - GET /api/v1/shops/:id/roles (protected, roles.view)
     - Return all roles for the shop
     - Include user count per role (use TypeORM COUNT)
     - Mark system roles (cannot be edited/deleted)
   
   - GET /api/v1/shops/:id/roles/permissions (protected, roles.view)
     - Return all available permissions grouped by category
     - This helps the frontend build the permission editor
   
   - POST /api/v1/shops/:id/roles (protected, roles.create)
     - Create custom role with name, description, permissions
   
   - PATCH /api/v1/shops/:id/roles/:roleId (protected, roles.update)
     - Cannot update system roles
   
   - DELETE /api/v1/shops/:id/roles/:roleId (protected, roles.delete)
     - Cannot delete system roles
     - Cannot delete roles with assigned users

   Create default system roles in seed:
   - "Shop Admin" - all permissions
   - "Staff" - basic permissions (view bookings, create bookings, view services, etc.)

2. Backend Staff Module (uses User entity):

   - GET /api/v1/shops/:id/staff (protected, staff.view)
     - Return all staff members with their roles (use relations)
     - Include service count
     - Support includeInactive filter
   
   - GET /api/v1/shops/:id/staff/available (public)
     - For booking flow - return only active staff
     - Support filtering by serviceIds (query the ManyToMany relation)
     - Return minimal info: id, firstName, lastName initial, avatar
   
   - GET /api/v1/shops/:id/staff/:staffId (protected, staff.view)
     - Full staff details including schedule and time blocks
   
   - POST /api/v1/shops/:id/staff (protected, staff.create)
     - Create staff with account info, role, services, schedule
     - Hash password
     - Send welcome email with temporary password
   
   - PATCH /api/v1/shops/:id/staff/:staffId (protected, staff.update)
     - Update staff details
     - Password change requires separate flow
   
   - DELETE /api/v1/shops/:id/staff/:staffId (protected, staff.delete)
     - If has bookings, deactivate instead of delete
   
   - PUT /api/v1/shops/:id/staff/:staffId/schedule (protected, staff.update)
     - Replace entire weekly schedule
   
   - GET /api/v1/shops/:id/staff/:staffId/time-blocks (protected, staff.view)
   - POST /api/v1/shops/:id/staff/:staffId/time-blocks (protected, staff.update)
   - DELETE /api/v1/shops/:id/staff/:staffId/time-blocks/:blockId (protected, staff.update)
     - Manage recurring and one-time time blocks

3. Frontend - Role Management (/admin/roles):

   Role List:
   - Table with role name, user count, system flag, actions
   - "Add Role" button
   - Edit and delete buttons (disabled for system roles)

   Role Form:
   - Name input
   - Description textarea
   - Permission editor:
     - Grouped by category (Bookings, Services, Staff, etc.)
     - Expandable sections
     - Checkboxes for each permission
     - "Select All" per category
     - Visual preview of what the role can do

4. Frontend - Staff Management (/admin/staff):

   Staff List:
   - Table with avatar, name, email, role, status, actions
   - Filter by role
   - Filter by status
   - "Add Staff" button
   - View schedule button per staff

   Staff Form:
   - Account section: email, password (for new), name, phone
   - Role dropdown (shows permission summary on hover)
   - Services multi-select with "Select All"
   - Avatar upload (prepare UI)

   Schedule Editor:
   - Visual week grid
   - Click to toggle working/not working
   - Time inputs for start/end when working
   - "Apply to All Days" button
   - Time block management:
     - List of existing blocks
     - Add recurring block (day, time range, reason)
     - Add one-time block (date, time range, reason)
     - Delete block

5. Seed Data:
   - Create sample staff members (3-4)
   - Assign different roles
   - Create varied schedules
   - Add some time blocks (lunch breaks)

Ensure the permission system is consistently enforced across all admin endpoints. Use TypeORM relations and query builder for complex queries.
```

### Verification Checklist
- [ ] Roles CRUD works correctly
- [ ] System roles cannot be modified
- [ ] Permission groups display correctly
- [ ] Staff CRUD works correctly
- [ ] Staff-service assignment works
- [ ] Schedule management works
- [ ] Time blocks can be added/removed
- [ ] Public staff/available endpoint returns correct data
- [ ] Permission enforcement works on all endpoints

---

## Phase 6: Booking System - Core

### Description
Implement the core booking functionality including availability calculation, booking creation, and management.

### Prerequisites
- Phase 5 completed and verified

### Prompt

```
Now let's implement the core booking system. This is the most critical part of the application. Reference:

- API_SPECIFICATION.md - Availability and Booking endpoints
- FEATURES.md - F3: Booking Flow, A2: Booking Calendar, A3: Booking Management
- DATABASE_SCHEMA.md - Booking, BookingService entities

Implement the following:

1. Backend Availability Service:

   Create an availability service that calculates available time slots:
   
   - GET /api/v1/shops/:id/availability
     - Required params: date (YYYY-MM-DD), serviceIds (comma-separated)
     - Optional param: staffId (specific staff member)
     
     Logic:
     1. Get total duration of selected services (sum of durations + buffer times)
     2. Get shop working hours for the given date's day of week
     3. Check for shop special days (closed or custom hours)
     4. If staffId specified:
        - Get staff schedule for that day (UserSchedule entity)
        - Get staff time blocks (recurring for that day, one-time for that date)
        - Get staff's existing bookings for that date (use TypeORM query)
     5. If no staffId (any available):
        - Get all staff who can perform ALL selected services (ManyToMany query)
        - Calculate availability for each staff member
        - Merge overlapping slots
     6. Generate time slots based on shop's slot interval settings
     7. Filter out slots that:
        - Are before shop opening or after closing
        - Fall during staff time blocks
        - Overlap with existing bookings
        - Are within minBookingNotice of current time
     8. Return slots with list of available staff for each

   - GET /api/v1/shops/:id/availability/dates
     - Return dates with any availability in a date range
     - Used for calendar highlighting

2. Backend Bookings Module:

   - POST /api/v1/shops/:id/bookings (customer booking)
     - Accept: serviceIds, staffId (optional), startTime, customerNotes
     - For authenticated customer: use their customerId
     - For guest: accept customer object with email, firstName, lastName, phone
       - Create or find customer by email (use TypeORM findOne or save)
     - Validate:
       - All services exist and are active
       - Staff can perform all services (if staffId provided)
       - Slot is still available (check again at booking time!)
       - Time is within booking window
     - Calculate endTime based on service durations + buffers
     - Calculate totalPrice and totalDuration
     - Create booking with BookingService records (cascade: true)
     - Send confirmation email
     - Return complete booking details
   
   - POST /api/v1/shops/:id/bookings/admin (admin booking creation)
     - Similar but requires bookings.create permission
     - Can specify existing customerId
     - Can add staffNotes
   
   - GET /api/v1/shops/:id/bookings (protected, bookings.view or bookings.view_own)
     - Required: startDate, endDate
     - Optional filters: staffId, status, customerId
     - If user only has bookings.view_own, filter to their assignments
     - Return bookings with customer and service details (use relations)
   
   - GET /api/v1/shops/:id/bookings/:bookingId
     - Protected for staff or accessible by owning customer
   
   - PATCH /api/v1/shops/:id/bookings/:bookingId (protected, bookings.update)
     - Update staffId, startTime, status, staffNotes
     - If time changed, validate availability
     - Send update notification to customer
   
   - POST /api/v1/shops/:id/bookings/:bookingId/cancel (customer)
     - Check cancellation policy
     - Set status to CANCELLED, record cancelledAt, cancelledBy
     - Send cancellation notification
   
   - POST /api/v1/shops/:id/bookings/:bookingId/admin-cancel (protected, bookings.delete)
     - Admin can cancel anytime
     - Require reason
     - Send cancellation notification

3. Frontend - Customer Booking Flow:

   Booking Context/State:
   - Selected services array
   - Selected staff (optional)
   - Selected date and time
   - Customer info (if guest)
   - Manage state across steps
   - Persist to sessionStorage to survive refresh

   Step 1 - Service Selection (/booking):
   - Reuse service catalog with multi-select mode
   - Sidebar showing selected services, total price/duration
   - "Continue" button (enabled when at least one service selected)

   Step 2 - Staff Selection (/booking/staff):
   - Skip if employeeSelection is "disabled"
   - Fetch available staff for selected services
   - Staff cards with photo, name
   - "Any Available" option (if not mandatory)
   - "Continue" button

   Step 3 - Date/Time Selection (/booking/datetime):
   - Calendar showing current month
   - Fetch available dates and mark them
   - Gray out unavailable dates
   - On date select, fetch time slots
   - Display slots in a grid or list
   - Show available staff per slot (if "any available" was chosen)
   - On slot select, "Continue" button

   Step 4 - Customer Details (/booking/details):
   - If authenticated, show pre-filled info with edit option
   - If guest, show form: email, firstName, lastName, phone (if required)
   - Notes field for special requests
   - For guest, submitting triggers OTP flow

   Step 5 - Confirmation (/booking/confirm):
   - Summary of all selections
   - Edit buttons to go back to each step
   - "Confirm Booking" button
   - Handle race condition: if slot unavailable, show error and return to datetime

   Success Page (/booking/success):
   - Confirmation message
   - Booking reference number
   - Booking details summary
   - "Add to Calendar" button (generate .ics file or Google Calendar link)
   - Link to view in account (if authenticated)

4. Frontend - Admin Booking Calendar (/admin/bookings):

   Calendar Views:
   - Day view: detailed timeline
   - Week view: 7-day overview
   - Toggle between views

   Day View Implementation:
   - Vertical time axis (shop hours)
   - Horizontal staff columns
   - Booking blocks positioned by time and staff
   - Color coding by status
   - Click empty slot to create booking
   - Click booking to view details

   Booking Detail Panel (sidebar or modal):
   - Customer info with quick link to profile
   - Service list
   - Status badge
   - Action buttons: Edit, Cancel, Mark Complete
   - Notes section

   Create/Edit Booking Dialog:
   - Customer search/select
   - Service multi-select
   - Staff select (filtered by services)
   - Date/time picker with availability check
   - Notes field

5. Email Templates:
   - Booking confirmation: details, calendar attachment
   - Booking reminder: same details (scheduled sending will be Phase 10)
   - Booking cancellation: reason, possible rebooking link

Ensure all availability calculations are performed server-side and validated again at booking submission to prevent race conditions. Use TypeORM transactions where necessary to ensure data integrity.
```

### Verification Checklist
- [ ] Availability calculation returns correct slots
- [ ] Slots respect shop hours, staff schedules, and existing bookings
- [ ] Buffer time is applied correctly
- [ ] Customer can complete entire booking flow
- [ ] Guest booking with OTP works
- [ ] Booking creation validates availability
- [ ] Race condition handling works (double booking prevented)
- [ ] Admin calendar displays bookings correctly
- [ ] Admin can create bookings manually
- [ ] Admin can edit booking time/staff
- [ ] Customer can cancel within policy
- [ ] Admin can cancel with reason
- [ ] Confirmation email is sent
- [ ] Cancellation email is sent

---

## Phase 7: Customer Management

### Description
Implement customer management for admin and customer account features.

### Prerequisites
- Phase 6 completed and verified

### Prompt

```
Now let's implement customer management. Reference:

- API_SPECIFICATION.md - Customer endpoints
- FEATURES.md - A7: Customer Management, F5: Customer Account
- DATABASE_SCHEMA.md - Customer entity

Implement the following:

1. Backend Customers Module:

   Admin Endpoints:
   - GET /api/v1/shops/:id/customers (protected, customers.view)
     - Paginated list (use TypeORM skip/take)
     - Search by name or email (use ILIKE for case-insensitive)
     - Include booking stats (total, last visit) using query builder
   
   - GET /api/v1/shops/:id/customers/:customerId (protected, customers.view)
     - Full details with booking stats
     - Recent bookings list (use relations)
   
   - PATCH /api/v1/shops/:id/customers/:customerId (protected, customers.update)
     - Update firstName, lastName, phone
   
   - PATCH /api/v1/shops/:id/customers/:customerId/notes (protected, customers.notes)
     - Update internal notes only
   
   - DELETE /api/v1/shops/:id/customers/:customerId (protected, customers.delete)
     - Soft delete (use TypeORM softDelete - the @DeleteDateColumn handles this)
     - Keep for booking history

   Customer Self-Service Endpoints:
   - GET /api/v1/customers/me (protected, customer auth)
     - Return current customer's profile
   
   - PATCH /api/v1/customers/me (protected, customer auth)
     - Update own firstName, lastName, phone
   
   - GET /api/v1/customers/me/bookings (protected, customer auth)
     - Filter: status (upcoming/past)
     - Paginated
     - Return with service and staff details (use relations)

2. Frontend - Admin Customer Management (/admin/customers):

   Customer List:
   - Table: name, email, phone, total bookings, last visit, actions
   - Search input (instant filter)
   - Export to CSV button
   - Click row to open detail view

   Customer Detail Page (/admin/customers/:id):
   - Profile card with contact info (editable)
   - Internal notes section (editable, customers can't see this)
   - Stats cards: total bookings, completed, cancelled, no-shows, total spent
   - Booking history table with status, date, services
   - Quick action: Create booking for this customer

3. Frontend - Customer Account:

   Account Dashboard (/account):
   - Welcome message with name
   - Upcoming bookings summary (next 2-3)
   - Quick links to all sections

   Upcoming Bookings (/account/bookings):
   - List of future bookings
   - Each shows: date, time, services, staff
   - Status badge
   - Actions: View details, Cancel (if within policy)
   - Empty state if no upcoming bookings

   Past Bookings (/account/bookings/history):
   - List of past bookings
   - Same info as upcoming
   - "Book Again" button to start new booking with same services
   - Paginated

   Profile Settings (/account/settings):
   - Edit form: firstName, lastName, phone
   - Email displayed (not editable - it's the account identifier)
   - Language preference selector
   - Save button

   Booking Detail View (modal or page):
   - Full booking information
   - Service breakdown with prices
   - Staff info
   - Cancel button (if upcoming and within policy)
   - Cancel confirmation dialog

4. Customer Notes Feature:
   - Notes are internal, shown only in admin panel
   - Used for staff to remember customer preferences
   - Example: "Prefers morning appointments", "Allergic to certain products"
   - Show notes prominently when viewing customer or their bookings

5. Seed Data:
   - Create sample customers (5-10)
   - Some with booking history
   - Some with notes

Ensure proper separation between admin access and customer self-service access. Use TypeORM soft delete for customers to preserve booking history.
```

### Verification Checklist
- [ ] Admin can list customers with search
- [ ] Admin can view customer details with stats
- [ ] Admin can edit customer info
- [ ] Admin can add/edit notes
- [ ] Admin can soft-delete customer
- [ ] Customer can view their profile
- [ ] Customer can update their info
- [ ] Customer can see upcoming bookings
- [ ] Customer can see past bookings
- [ ] Customer can cancel within policy
- [ ] "Book Again" works correctly
- [ ] Customer notes visible only in admin

---

## Phase 8: File Uploads

### Description
Implement image upload functionality for shop, services, and staff avatars.

### Prerequisites
- Phase 7 completed and verified
- Cloudinary account (free tier: https://cloudinary.com)

### Prompt

```
Now let's implement file upload functionality. Reference:

- ARCHITECTURE.md - File upload architecture
- API_SPECIFICATION.md - Upload endpoints

Implement the following:

1. Backend Uploads Module:

   Service Setup:
   - Create uploads module with Cloudinary integration
   - Configure Cloudinary with environment variables
   - Create storage abstraction interface for future provider switching
   
   For Development:
   - Create local file storage option
   - Store files in /uploads folder
   - Serve via static file middleware
   - Switch between local/cloudinary via environment variable

   Endpoints:
   - POST /api/v1/uploads/image (protected)
     - Accept multipart/form-data
     - Validate file type (jpg, jpeg, png, webp)
     - Validate file size (max 5MB)
     - Upload to Cloudinary (or local in dev)
     - Cloudinary options: auto quality, format optimization
     - Return URL and public ID
   
   - DELETE /api/v1/uploads/image/:publicId (protected)
     - Delete from Cloudinary
     - Clean up reference

2. Image Upload Component:

   Create a reusable ImageUpload component:
   - Drag and drop zone
   - Click to select file
   - Image preview after selection
   - Upload progress indicator
   - Crop functionality (optional, can use react-image-crop)
   - Error display for invalid files
   - Remove/replace option

3. Integrate with Existing Features:

   Shop Settings:
   - Logo upload (square, recommend 200x200)
   - Cover image upload (wide, recommend 1200x400)
   - Gallery images (multiple, grid display)

   Service Form:
   - Service image upload
   - Optional, shows placeholder if not set

   Staff Form:
   - Avatar upload (square)
   - Shows initials placeholder if not set

4. Image Display Components:

   ShopLogo component:
   - Displays logo at specified size
   - Falls back to first letter of shop name

   Avatar component:
   - Displays staff/customer avatar
   - Falls back to initials

   ServiceImage component:
   - Displays service image
   - Falls back to category-based placeholder or generic

   Gallery component:
   - Grid of shop images
   - Lightbox view on click

5. Environment Configuration:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - USE_LOCAL_STORAGE=true for development

Make sure uploaded images are optimized for web delivery and appropriately sized for their use case. Update the relevant entities (Shop, Service, User) to store image URLs.
```

### Verification Checklist
- [ ] Image upload works in development (local storage)
- [ ] Image upload works with Cloudinary
- [ ] File type validation works
- [ ] File size validation works
- [ ] Upload progress shows correctly
- [ ] Shop logo can be uploaded and displays
- [ ] Shop cover image works
- [ ] Shop gallery works
- [ ] Service images work
- [ ] Staff avatars work
- [ ] Fallback placeholders display correctly
- [ ] Images are optimized/resized appropriately

---

## Phase 9: Dashboard and Statistics

### Description
Implement the admin dashboard with statistics and overview.

### Prerequisites
- Phase 8 completed and verified

### Prompt

```
Now let's implement the admin dashboard. Reference:

- API_SPECIFICATION.md - Dashboard endpoints
- FEATURES.md - A1: Dashboard

Implement the following:

1. Backend Dashboard Module:

   - GET /api/v1/shops/:id/dashboard (protected, reports.view)
     - Query param: period (today, week, month, year)
     
     Return:
     - Booking stats: total, by status (confirmed, cancelled, completed, pending, no_show)
     - Revenue: total, average per booking
     - Customer stats: total in period, new vs returning
     - Top services: list of most booked services with counts
     - Today's schedule: upcoming bookings for today

   Calculate stats using efficient TypeORM queries:
   - Use query builder with aggregations (SUM, COUNT, AVG)
   - Use GROUP BY for status breakdowns
   - Consider time zones for date-based queries
   - Use subqueries or raw queries where necessary for complex stats

2. Frontend Dashboard (/admin):

   Stats Cards Row:
   - Today's bookings (count, with comparison to same day last week)
   - This week's revenue (with comparison to last week)
   - Pending bookings requiring attention (link to filtered calendar)
   - New customers this period

   Each card should:
   - Show main number prominently
   - Show comparison with up/down arrow and percentage
   - Be clickable to navigate to relevant section

   Today's Schedule Section:
   - Timeline view of today's bookings
   - Sorted by time
   - Shows customer name, services, staff
   - Status indicator
   - Click to open booking detail
   - "View Full Calendar" link

   Recent Activity Section (optional):
   - Feed of recent events
   - New bookings, cancellations, new customers
   - Timestamp for each
   - Links to relevant items

   Top Services Section:
   - Bar chart or simple list
   - Service name with booking count
   - For selected period

   Quick Actions:
   - "New Booking" button
   - "Add Walk-in" button
   - Links to common tasks

3. Period Selector:
   - Dropdown or tabs to select time period
   - Today, This Week, This Month, This Year
   - Changing period refreshes all stats

4. Empty States:
   - Handle new shops with no data gracefully
   - Encouraging messages and getting started tips
   - Links to add first service, first staff, etc.

5. Responsive Design:
   - Cards reflow on smaller screens
   - Timeline adapts for mobile
   - Charts resize appropriately

Consider using a charting library like Recharts for visualizations. Keep the dashboard fast-loading by using efficient queries and minimal data transfer.
```

### Verification Checklist
- [ ] Dashboard loads with correct stats
- [ ] Period switching works
- [ ] Comparison calculations are correct
- [ ] Today's schedule displays correctly
- [ ] Top services shows accurate data
- [ ] Empty states look good for new shops
- [ ] Dashboard is responsive on mobile
- [ ] Stats update when bookings change

---

## Phase 10: Notifications, SEO, and Legal

### Description
Enhance notifications, implement SEO, analytics, and legal pages.

### Prerequisites
- Phase 9 completed and verified

### Prompt

```
Now let's implement notifications, SEO, and legal pages. Reference:

- FEATURES.md - A10: Notification System, F7: SEO and Analytics, F6: Legal Pages

Implement the following:

1. Email Template Enhancement:

   Create professional HTML email templates:
   
   Booking Confirmation:
   - Shop branding (logo, colors)
   - Greeting with customer name
   - Booking reference number
   - Date and time (formatted nicely)
   - Services list with prices
   - Staff member name
   - Total price and duration
   - Shop address with map link
   - Cancellation policy note
   - Contact information

   Booking Reminder (24h before):
   - Similar to confirmation
   - Emphasis on appointment being tomorrow
   - Cancellation link if within policy

   Booking Cancellation:
   - Confirmation of cancellation
   - Reason if provided
   - Invitation to rebook

   For all templates:
   - Plain text fallback version
   - Support Greek and English
   - Responsive for mobile email clients

2. SEO Implementation:

   Meta Tags:
   - Dynamic title: "Service Name | Shop Name"
   - Meta description from content
   - Open Graph tags for social sharing
   - Canonical URLs

   Structured Data (JSON-LD):
   - LocalBusiness schema on homepage
   - Service schema on service pages

   Sitemap:
   - Auto-generate /sitemap.xml
   - Include public pages
   - Update when content changes

   Robots.txt:
   - Allow public pages
   - Disallow /admin/, /api/, /booking/

3. Analytics Integration:

   Google Analytics:
   - Load after cookie consent
   - Track page views
   - Track booking funnel events
   - Track conversions

   Meta Pixel:
   - Load after cookie consent
   - PageView, ViewContent, InitiateCheckout, Purchase events

4. Cookie Consent:

   GDPR-compliant banner:
   - Appears on first visit
   - Options: Accept All, Reject Non-Essential, Customize
   - Store preference (1 year)
   - Block analytics until consent

5. Legal Pages:

   Terms of Service (/terms):
   - Service description
   - User obligations
   - Booking and cancellation policy
   - Limitation of liability

   Privacy Policy (/privacy):
   - Data collection and usage
   - Legal basis (GDPR)
   - User rights
   - Contact information

   Cookie Policy (/cookies):
   - Cookie types used
   - How to control cookies

   Footer Links:
   - Add links to all legal pages
   - "Cookie Settings" to reopen consent

6. Calendar Attachment:

   Generate .ics files:
   - For booking confirmation email
   - For "Add to Calendar" button
   - Include event details and location

Environment variables:
- NEXT_PUBLIC_GA_ID
- NEXT_PUBLIC_META_PIXEL_ID
```

### Verification Checklist
- [ ] Email templates look professional
- [ ] Emails work in Greek and English
- [ ] Calendar attachment imports correctly
- [ ] SEO meta tags display correctly
- [ ] Structured data validates
- [ ] Sitemap generates correctly
- [ ] Cookie consent banner appears
- [ ] Analytics load only after consent
- [ ] Legal pages display correctly
- [ ] Footer links work

---

## Phase 11: Final Polish and Testing

### Description
Final polish, bug fixes, and preparation for deployment.

### Prerequisites
- All previous phases completed

### Prompt

```
Now let's do final polish and prepare for deployment.

1. UI/UX Polish:

   Review all pages for:
   - Consistent spacing and alignment
   - Proper loading states (skeleton loaders)
   - Error states with helpful messages
   - Empty states with guidance
   - Responsive design on all screen sizes
   - Keyboard navigation and accessibility
   - Consistent button styles and colors

2. Error Handling:

   Frontend:
   - Global error boundary
   - API error handling with toast notifications
   - Network offline detection
   - Form validation error display
   - 404 and 500 error pages

   Backend:
   - Consistent error response format
   - Proper HTTP status codes
   - Validation error details
   - Error logging

3. Performance:

   Frontend:
   - Lighthouse audit (aim for 90+ scores)
   - Image optimization
   - Code splitting
   - Lazy loading

   Backend:
   - Database query optimization (check for N+1 problems)
   - Add necessary indexes (TypeORM @Index decorator)
   - Response caching where appropriate

4. Security Review:

   - All sensitive routes protected
   - CORS properly configured
   - Input validation on all endpoints
   - Environment variables not exposed
   - Password hashing working
   - JWT security best practices

5. Testing Checklist:

   Manual testing:
   - Complete booking flow (new customer)
   - Complete booking flow (returning customer)
   - Admin login with and without 2FA
   - All CRUD operations
   - Booking calendar operations
   - All settings pages
   - Language switching
   - Mobile responsiveness

6. Documentation:

   Update README.md:
   - Project description
   - Getting started instructions
   - Environment variables list
   - Available scripts

7. Seed Data:

   Development seed:
   - Comprehensive test data
   - Covers all features

   Production seed:
   - Minimal: Super Admin and empty shop
   - First-run setup flow

Fix any issues found during this review.
```

### Verification Checklist
- [ ] UI is consistent across all pages
- [ ] All loading states implemented
- [ ] All error states handled gracefully
- [ ] Responsive design works on mobile
- [ ] Lighthouse scores are 90+
- [ ] All security checks pass
- [ ] Complete booking flow works end-to-end
- [ ] Admin features all work correctly
- [ ] Documentation is complete
- [ ] No console errors or warnings
- [ ] Ready for deployment

---

## Deployment Guide

Once all phases are complete, follow these steps to deploy:

### Deploy Backend to Railway

1. Create Railway account at railway.app
2. Create new project
3. Add PostgreSQL service
4. Add backend service from GitHub repo
5. Configure environment variables
6. Deploy

### Deploy Frontend to Vercel

1. Create Vercel account at vercel.com
2. Import project from GitHub
3. Select frontend folder as root
4. Configure environment variables (including API URL)
5. Deploy

### Post-Deployment

1. Update CORS settings with production frontend URL
2. Configure custom domain (if applicable)
3. Set up monitoring (optional)
4. Create production admin account
5. Configure real email sending (verify domain with Resend)

---

## Maintenance Notes

After launch, refer to the phase documentation for adding new features, modifying existing functionality, and understanding the codebase.

For Phase 2 features (marketplace, payments, reviews), new prompt documents will be created following the same structure.
