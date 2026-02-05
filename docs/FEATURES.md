# Features Specification

## Overview

This document provides detailed specifications for each feature of the booking application. It serves as a reference for implementation and should be consulted when building each component.

---

## Frontend Features (Customer-Facing)

### F1: Shop Presentation (Homepage)

#### Description
The homepage serves as the main entry point for customers and presents the shop as a branded website. It should feel like the shop's own website rather than a booking platform.

#### Components

The Hero Section displays a cover image (full-width or contained), the shop logo, shop name, and a brief tagline or description. A prominent "Book Now" call-to-action button appears here.

The About Section contains the full shop description in the customer's preferred language (Greek or English) and can include the shop's story, specialties, or unique selling points.

The Services Preview shows featured services organized by category with a "View All Services" link that leads to the full catalog.

The Location Section displays the shop address, an embedded Google Map showing the location, and contact information including phone and email.

The Working Hours Section shows a table of operating hours for each day of the week and indicates today's hours prominently. Special days like holidays are displayed if they fall within the next 2 weeks.

#### User Stories
As a customer, I want to see the shop's information and services so I can decide if I want to book. As a customer, I want to quickly access the booking flow from the homepage. As a customer, I want to see the shop's location on a map so I can plan my visit.

#### Technical Notes
The page should be server-side rendered for SEO purposes. Structured data in JSON-LD format should be implemented for local business schema. The page should be fully responsive with a mobile-first approach.

---

### F2: Service Catalog

#### Description
A comprehensive view of all services offered by the shop, organized by category with filtering and search capabilities.

#### Layout

The Category Navigation displays category tabs or sidebar for filtering. The "All" option shows all services across categories.

Each Service Card displays the service name in the current language, price formatted with currency symbol, duration shown in human-readable format like "30 min" or "1h 15min", a brief description truncated if needed, and an optional service image. A visual indicator shows if the service is popular or new.

#### Functionality
Users can filter by category by clicking category tabs. Searching works by typing in a search box that filters by service name. Clicking on a service opens a detail modal or page with full description. Each service has an "Add to Booking" button that adds it to the booking cart.

#### Technical Notes
Services are fetched from the API and cached using React Query. The category list is loaded once and cached. Search is performed client-side for the current category's services. Deep linking works so that going to /services?category=manicure pre-filters the view.

---

### F3: Booking Flow

#### Description
A multi-step process that guides customers through selecting services, choosing an employee (if applicable), picking a date and time, and confirming their booking.

#### Step 1: Service Selection

The service list displays all available services organized by category, similar to the catalog but with multi-select capability. A booking summary sidebar shows selected services, running total price, and total duration. Users can add or remove services, and the minimum requirement is at least one service. Once ready, the user clicks "Continue" to proceed.

#### Step 2: Employee Selection (Conditional)

This step is shown only if employeeSelection setting is "mandatory" or "optional". If "disabled", this step is skipped entirely.

The employee list shows available employees who can perform all selected services. Each employee card shows their name, avatar, and optionally their specialties. When employeeSelection is "optional", an "Any Available" option appears first. When employeeSelection is "mandatory", the user must select a specific employee.

#### Step 3: Date and Time Selection

The date picker shows a calendar view highlighting available dates. Dates without availability are grayed out. The view shows the current month plus navigation to view up to maxAdvanceBooking months ahead. Dates before today plus minBookingNotice are disabled.

The time slots section appears after selecting a date. Slots are calculated based on service duration plus buffer time, showing only slots where the selected employee is available. If "Any Available" was chosen, slots show when any employee is available. Each slot displays the start time in the shop's timezone. Unavailable times are hidden entirely to avoid confusion.

#### Step 4: Customer Details

For returning authenticated customers, their information is pre-filled from their profile. For new or guest customers, a form collects email (required), first name (required), last name (required), and phone (conditional based on shop settings). There's an option to add notes for the appointment.

For guest customers, submitting this form triggers OTP verification before the booking is confirmed.

#### Step 5: Confirmation

The booking summary shows a complete overview including all selected services with individual prices, the assigned employee name, date and time formatted nicely, total price and duration, and any customer notes.

The user can review and confirm by clicking "Confirm Booking" to submit, or go back to edit any step. After confirmation, a success screen shows a confirmation number, booking details, and an option to add the appointment to their calendar.

#### Technical Notes
The booking state is managed using React Context or URL state to survive page refreshes. Availability is checked in real-time when selecting slots. A final availability check happens on submit to handle race conditions. If a slot becomes unavailable during the flow, the user is notified and returned to the datetime step.

---

### F4: Customer Authentication

#### Description
Passwordless authentication for customers using email OTP (one-time password). Customers don't need to create traditional accounts with passwords.

#### Flow

The trigger points for authentication include proceeding to book as a guest, accessing "My Bookings" or account area, and returning customers who want to log in.

The email entry step shows an email input field. The user enters their email and clicks "Continue". The system sends a 6-digit OTP to the email.

At the OTP verification step, a 6-digit input field appears where digits auto-advance as the user types. There's a 10-minute expiration countdown visible. A "Resend Code" option is available after 60 seconds. If the OTP is correct, the user is authenticated.

For new customers, a customer record is created automatically with just their email. They can fill in additional details (name, phone) during booking or later.

#### Security Considerations
OTP codes are hashed before storage using bcrypt. Codes expire after 10 minutes. Rate limiting applies to prevent brute force attacks, set at 5 attempts per email per hour. After 3 failed attempts, the code is invalidated.

---

### F5: Customer Account

#### Description
A dashboard for authenticated customers to manage their bookings and profile.

#### Sections

The Upcoming Bookings section shows a list of future appointments with date, time, services, and assigned employee for each. Action buttons allow rescheduling (if within policy) and cancellation (if within policy). Quick view shows the full booking details.

The Past Bookings section displays a history of completed appointments, each showing the same information as upcoming. A "Book Again" shortcut creates a new booking with the same services.

The Profile Settings section contains an edit form for first name, last name, and phone. The email is displayed but not editable since it's the account identifier. There's also language preference selection.

#### Technical Notes
Bookings are fetched with appropriate filters for upcoming versus past. Pagination is implemented for past bookings. Real-time updates use polling or WebSocket for status changes.

---

### F6: Legal Pages

#### Description
Static pages required for legal compliance, specifically GDPR.

#### Pages

The Terms of Service page contains the legal agreement for using the booking service. The Privacy Policy page explains how customer data is collected, used, and protected. The Cookie Policy page details what cookies are used and why.

#### Cookie Consent Banner

On first visit, a banner appears at the bottom of the screen explaining that the site uses cookies. Options include "Accept All", "Reject Non-Essential", and "Customize". If rejected, only essential cookies (session) are used. Preferences are saved in a cookie that lasts 1 year.

#### Technical Notes
Legal content should be easily editable, ideally stored as markdown files or CMS content. The cookie consent state is managed globally and affects analytics loading.

---

### F7: SEO and Analytics

#### Description
Search engine optimization and tracking implementation for the customer-facing website.

#### SEO Implementation

Meta tags include a dynamic title with the format "Service Name | Shop Name" or "Shop Name - Booking". The meta description is generated from service or shop description. Open Graph tags are included for social sharing. The canonical URL is set properly.

Structured data includes LocalBusiness schema with all shop details and Service schema for each service page. These appear as JSON-LD in the page head.

The sitemap at /sitemap.xml is auto-generated and includes all public pages. It updates when services or categories change.

The robots.txt file allows search engine crawling of public pages, disallows crawling of admin panel and API routes, and references the sitemap location.

#### Analytics Implementation

Google Analytics uses the gtag.js implementation. It loads only after cookie consent and tracks page views, booking funnel events, and conversion events.

Meta Pixel also loads only after cookie consent. It tracks standard events including PageView, ViewContent for service pages, InitiateCheckout for booking start, and Purchase for booking completion.

---

## Admin Panel Features

### A1: Dashboard

#### Description
The main landing page for staff and admins showing key metrics and today's overview.

#### Components

The Stats Cards section displays today's bookings count, this week's revenue, pending bookings requiring attention, and new customers this week. Values compare to the previous period with up or down arrows.

Today's Schedule shows a timeline view of all bookings for today, color-coded by status (confirmed, pending, completed). Clicking a booking opens its details.

Recent Activity shows a feed of recent events including new bookings, cancellations, and customer registrations.

Quick Actions provide shortcut buttons for creating a new booking and adding a new customer.

#### Permission Requirements
Viewing the dashboard requires the reports.view permission. Staff without this permission see a simplified view with only their own bookings.

---

### A2: Booking Calendar

#### Description
The central hub for viewing and managing all bookings in a calendar interface.

#### Views

Day View shows a detailed timeline for a single day. The vertical axis displays time from shop opening to closing. The horizontal axis shows columns per staff member. Bookings appear as blocks on the appropriate staff column. Colors indicate status (green for confirmed, yellow for pending, gray for completed, red for cancelled).

Week View shows 7 days with a simplified timeline for each. Each day column shows booking blocks. Less detail than day view, focused on overview.

#### Interactions

Clicking an empty slot opens the "Create Booking" form with pre-filled date, time, and staff. Clicking an existing booking opens a detail panel with full information, action buttons (edit, cancel, mark complete), and customer quick view.

Drag and drop functionality allows dragging a booking to a different time slot, and the system checks availability before confirming the move.

#### Filters
Filters are available for specific staff members (if the user has bookings.view permission), booking status, and date range navigation.

#### Technical Notes
The calendar uses a performant library like FullCalendar or custom implementation. Data is fetched for the visible date range plus buffer. Optimistic updates are used for drag-and-drop with rollback on failure.

---

### A3: Booking Management

#### Description
Creating and editing individual bookings.

#### Create Booking Form

The customer selection section offers searching for an existing customer by name or email. If not found, there's the option to create a new customer inline. Required fields are email and name.

The service selection section uses a searchable multi-select of available services. The running total and duration update as services are added.

The staff selection section shows a dropdown of available staff filtered by who can perform selected services. Availability status is shown next to each name.

The date and time selection section uses a date picker with an availability indicator and time slot selection based on staff and service requirements.

The notes section has a text area for internal staff notes that the customer cannot see.

#### Edit Booking

All fields are editable except customer, though the assigned customer cannot be changed but can view their details. Changes to time or staff trigger availability check. There's a history log of changes at the bottom.

#### Permission Requirements
Creating a booking requires the bookings.create permission. Editing requires the bookings.update permission.

---

### A4: Service Management

#### Description
CRUD operations for services and categories.

#### Service List

The table displays columns for service name, category, duration, price, status (active or inactive), and actions (edit, delete, toggle status). The list is sortable by each column. Filters are available for category and status. Drag-and-drop reordering is available within each category.

#### Service Form

For basic information, required fields include name in Greek and name in English, along with an optional description in both languages.

The category dropdown shows all categories with the option to create a new one inline.

Pricing and duration fields include duration in minutes using a number input with presets, price using a decimal input, and optional buffer time override.

The staff assignment section uses a multi-select checkbox list of all staff members. It shows which staff can perform this service.

An image upload component allows uploading a service image with preview and cropping capability.

#### Category Management

Categories can be managed inline from the services page or via a dedicated section. The form includes name in Greek, name in English, optional description, and sort order. Deleting a category moves its services to "Uncategorized".

---

### A5: Staff Management

#### Description
Managing staff members, their schedules, and time blocks.

#### Staff List

The table shows avatar, name, email, role, status, and actions. Filters are available for role and status. There's quick access to view each staff member's schedule.

#### Staff Form

Account information includes email (unique, used for login), a temporary password that requires change on first login, first name, last name, phone, and avatar upload.

The role assignment dropdown shows all available roles with a description of permissions for the selected role.

The service assignment uses a multi-select of services this staff member can perform. A "Select All" option is available.

The schedule setup is covered in detail below.

#### Staff Schedule

The weekly schedule shows each day with working toggle (on or off), start time, and end time. There's a "Copy to All" feature to apply one day's schedule to all days. Visual preview shows the week at a glance.

Time blocks represent recurring blocks like lunch breaks. These need a day, start time, end time, and reason. One-time blocks are used for specific dates when the staff member is unavailable, requiring a date, start time, end time, and reason. All blocks are shown in a list with the ability to delete.

---

### A6: Role Management

#### Description
Creating and managing custom roles with specific permissions.

#### Role List

The table shows role name, number of users assigned, whether it's a system role, and actions. System roles (Shop Admin, Super Admin) cannot be edited or deleted.

#### Role Form

Basic information includes the role name and optional description.

The permission editor shows permissions grouped by category (Bookings, Services, Staff, etc.). Each category is expandable with individual permission checkboxes. A "Select All" toggle is available per category. There's a visual indicator showing what the role can and cannot do.

#### Permission Groups

Bookings permissions include view all, view own only, create, update, and delete/cancel.

Services permissions include view, create, update, and delete.

Categories permissions include view and manage.

Staff permissions include view, create, update, and delete.

Customers permissions include view, update, delete, and notes.

Settings permissions include view, update, hours, and booking configuration.

Roles permissions include view, create, update, and delete.

Reports permissions include view and export.

---

### A7: Customer Management

#### Description
Viewing and managing customer records.

#### Customer List

The table shows name, email, phone, booking count, last visit, and actions. Search functionality covers name and email. The export option creates a CSV file.

#### Customer Detail View

The profile section shows contact information with an edit capability and internal notes field (for staff only).

The booking statistics section displays total bookings, completed, cancelled, and no-shows, along with total amount spent and average booking value.

The booking history is a chronological list of all bookings with quick links to booking details.

---

### A8: Shop Settings

#### Description
Configuration options for the shop.

#### General Settings

Business information includes shop name, description in both languages, contact email, and phone.

Address fields include street address, city, postal code, country, and map location picker for coordinates.

The media section handles logo upload, cover image upload, and a gallery for multiple images.

#### Working Hours

Each day has a toggle for open or closed status, along with start and end time if open. There's a "Copy First Day" feature for quick setup.

Special days can be added as one-time or recurring, with the option to mark as fully closed or set custom hours. A reason or name can be assigned.

#### Booking Settings

The timing section includes minimum notice (dropdown with 15, 30, 60, 120, 240 minutes), maximum advance booking (dropdown with 1, 2, 3, 6 months), buffer time between appointments (number input in minutes), and cancellation deadline (dropdown with options).

Policy settings include employee selection mode (mandatory, optional, or disabled), default booking status (confirmed or pending), and whether phone number is required for booking.

---

### A9: Admin Authentication

#### Description
Login system for staff and admin users.

#### Login Page

The form includes email input, password input, "Remember Me" checkbox, and "Forgot Password" link. After successful login, users are redirected to the dashboard.

If 2FA is enabled, users see a separate form for entering their 6-digit code. The "Remember this device" option is available for 30 days.

#### Password Reset

The request flow involves entering an email address. If the email exists, a reset link is sent that expires in 1 hour. The reset flow requires entering and confirming a new password, with password strength requirements enforced.

#### 2FA Setup

Users find this in their profile settings. The setup flow involves clicking "Enable 2FA", scanning a QR code with an authenticator app, entering the current code to verify, and saving backup codes.

The disable flow requires entering the current 2FA code and password for confirmation.

#### Session Management

JWT access tokens expire after 15 minutes. Refresh tokens last 7 days with rotation enabled, meaning each use generates a new refresh token. Inactive sessions are terminated after 7 days.

---

### A10: Notification System

#### Description
Email notifications for booking events.

#### Notification Types

Booking confirmation is sent immediately after a successful booking. It includes a summary of the appointment, is sent to the customer, and shows the shop's contact information.

Booking reminder is sent 24 hours before the appointment, or at a configurable time. It includes the appointment details and provides cancellation instructions if still within the policy window.

Booking cancellation is sent immediately when a booking is cancelled. It's sent to the customer and includes the reason if one was provided.

Booking update is sent when booking details change (time, services, staff). It's sent to the customer and highlights what changed.

#### Email Templates

Templates support multiple languages (Greek and English). They're HTML-based with a plain text fallback. Templates include the shop's branding (logo, colors). Variables are replaced with actual data (customer name, booking details, etc.).

#### Technical Architecture

The notification service is abstracted to support multiple providers. The current implementation uses Resend. The design is ready for future addition of SMS, WhatsApp, and Viber. All notifications are logged in the database for tracking.

---

## Cross-Cutting Features

### X1: Internationalization (i18n)

#### Supported Languages
Greek (el) and English (en) are supported, with Greek as the default.

#### Detection Logic
The priority order is URL path prefix if present, then saved user preference in a cookie, then Accept-Language header from the browser, and finally fallback to Greek.

#### Translation Structure
Translations are organized by namespace including common for buttons and navigation, booking for the booking flow, admin for the admin panel, errors for error messages, and emails for email templates.

#### Implementation
The frontend uses next-intl or react-i18next. The backend returns translation keys for error messages. Database content (services, categories) stores both languages.

---

### X2: Timezone Handling

#### Storage
All times are stored in UTC in the database. The shop's timezone is stored in its settings.

#### Display
Times are converted to the shop's timezone for display. Customers see times in the shop's timezone (not their own) to avoid confusion. The admin panel shows times in the shop's timezone.

#### Input
When creating bookings, users select times in the shop's timezone. The system converts to UTC before storing.

---

### X3: Error Handling

#### User-Facing Errors
Friendly error messages are shown in the user's language. Technical details are hidden from users. Actionable guidance is provided where possible (for example, "Try again" or "Contact support").

#### Error Types
Validation errors appear inline next to the relevant form field. Network errors show a toast notification with retry option. Not found errors show a dedicated 404 page. Server errors show a generic error page with a support contact.

#### Error Logging
All errors are logged with context. Critical errors may trigger alerts in the future. Error boundaries catch React errors gracefully.

---

### X4: Loading States

#### Page Loading
Skeleton loaders show the page structure while content loads. Critical content loads first, followed by secondary content.

#### Action Loading
Buttons show a spinner while processing. Forms are disabled during submission. Optimistic updates are used where appropriate.

#### Progressive Loading
Lists load in batches if large. Images use lazy loading. Calendar data loads as the user navigates.
