# API Specification

## Overview

The API follows RESTful conventions and uses JSON for request and response bodies. All endpoints are prefixed with `/api/v1` to allow for future API versioning.

## Base URL

During local development, the API runs at `http://localhost:3001/api/v1`. In production, it will be hosted on Railway with a URL like `https://your-app.railway.app/api/v1`.

## Authentication

### Token Types

The API uses JWT (JSON Web Tokens) for authentication. Access tokens have a short expiry of 15 minutes and are used for API requests. Refresh tokens have a longer expiry of 7 days and are used to obtain new access tokens without re-authentication.

### Authentication Headers

Protected endpoints require an Authorization header with the format `Bearer <access_token>`.

### Public Endpoints

The following endpoints do not require authentication: GET /shops/:id for shop public info, GET /shops/:id/services for service catalog, GET /shops/:id/categories for category list, POST /auth/customer/request-otp to request OTP, POST /auth/customer/verify-otp to verify OTP and get token, POST /auth/admin/login for admin login, POST /auth/admin/verify-2fa for 2FA verification, and GET /shops/:id/availability for available time slots.

## Error Response Format

All error responses follow a consistent format with statusCode as the HTTP status code, message as a human-readable error message, error as the error type identifier, and an optional timestamp.

Example error response with status 400:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Pagination

List endpoints support pagination using query parameters. The page parameter specifies the page number starting from 1 and the limit parameter specifies items per page with a default of 20 and maximum of 100.

Paginated responses include a meta object with currentPage, itemsPerPage, totalItems, and totalPages.

Example paginated response:
```json
{
  "data": [...],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

---

## Authentication Endpoints

### Customer Authentication (Passwordless)

#### Request OTP

POST /auth/customer/request-otp

This endpoint sends a 6-digit OTP to the customer's email. If the customer doesn't exist, they are created automatically.

Request body requires shopId as a string (required) representing the shop UUID and email as a string (required) representing the customer's email address.

Example request:
```json
{
  "shopId": "uuid-here",
  "email": "customer@example.com"
}
```

Success response (200):
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

#### Verify OTP

POST /auth/customer/verify-otp

This endpoint verifies the OTP and returns authentication tokens.

Request body requires shopId as a string (required), email as a string (required), and otp as a string (required) representing the 6-digit OTP code.

Success response (200):
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "customer": {
    "id": "uuid",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

Error response when OTP is invalid or expired (401):
```json
{
  "statusCode": 401,
  "message": "Invalid or expired OTP",
  "error": "Unauthorized"
}
```

### Admin Authentication

#### Login

POST /auth/admin/login

This endpoint authenticates admin/staff users with email and password.

Request body requires email as a string (required) and password as a string (required).

Success response when 2FA is not enabled (200):
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": {
      "id": "uuid",
      "name": "Shop Admin"
    }
  }
}
```

Success response when 2FA is required (200):
```json
{
  "requires2FA": true,
  "tempToken": "temp-token-for-2fa"
}
```

#### Verify 2FA

POST /auth/admin/verify-2fa

Request body requires tempToken as a string (required) representing the temporary token from login and code as a string (required) representing the 6-digit TOTP code from authenticator app.

Success response (200) returns the same structure as successful login without 2FA.

#### Setup 2FA

POST /auth/admin/setup-2fa

This endpoint is protected and requires authentication.

Success response (200):
```json
{
  "secret": "BASE32SECRET",
  "qrCode": "data:image/png;base64,..."
}
```

#### Confirm 2FA Setup

POST /auth/admin/confirm-2fa

This endpoint is protected and requires authentication.

Request body requires code as a string (required) representing the 6-digit TOTP code to verify setup.

Success response (200):
```json
{
  "message": "2FA enabled successfully"
}
```

#### Disable 2FA

POST /auth/admin/disable-2fa

This endpoint is protected and requires authentication.

Request body requires code as a string (required) representing the current TOTP code and password as a string (required) representing the user's password for confirmation.

### Token Management

#### Refresh Token

POST /auth/refresh

Request body requires refreshToken as a string (required).

Success response (200):
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

#### Logout

POST /auth/logout

This endpoint is protected and invalidates the refresh token.

Request body requires refreshToken as a string (required).

Success response (200):
```json
{
  "message": "Logged out successfully"
}
```

---

## Shop Endpoints

### Get Shop Public Info

GET /shops/:id

This is a public endpoint that returns shop information for the customer-facing website.

Success response (200):
```json
{
  "id": "uuid",
  "name": "Beauty Salon",
  "description": "Professional beauty services...",
  "email": "info@salon.com",
  "phone": "+30 210 1234567",
  "address": "123 Main Street",
  "city": "Athens",
  "postalCode": "10431",
  "country": "GR",
  "latitude": 37.9838,
  "longitude": 23.7275,
  "timezone": "Europe/Athens",
  "logo": "https://cloudinary.com/...",
  "coverImage": "https://cloudinary.com/...",
  "images": ["url1", "url2"],
  "workingHours": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "20:00",
      "isOpen": true
    }
  ],
  "settings": {
    "employeeSelection": "optional"
  }
}
```

### Update Shop (Admin)

PATCH /shops/:id

This endpoint is protected and requires the settings.update permission.

Request body can include name, description, email, phone, address, city, postalCode, country, timezone, logo, and coverImage fields.

### Update Shop Settings (Admin)

PATCH /shops/:id/settings

This endpoint is protected and requires the settings.booking permission.

Request body:
```json
{
  "minBookingNotice": 30,
  "maxAdvanceBooking": 90,
  "bufferTime": 15,
  "cancellationDeadline": 120,
  "employeeSelection": "optional"
}
```

### Update Working Hours (Admin)

PUT /shops/:id/working-hours

This endpoint is protected and requires the settings.hours permission.

Request body:
```json
{
  "hours": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "20:00",
      "isOpen": true
    }
  ]
}
```

### Manage Special Days (Admin)

GET /shops/:id/special-days, POST /shops/:id/special-days, PUT /shops/:id/special-days/:dayId, and DELETE /shops/:id/special-days/:dayId are all protected and require the settings.hours permission.

---

## Category Endpoints

### List Categories

GET /shops/:id/categories

This is a public endpoint. Query parameters include includeInactive as a boolean with default false (admin only).

Success response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Μανικιούρ",
      "nameEn": "Manicure",
      "description": "...",
      "sortOrder": 1,
      "isActive": true,
      "serviceCount": 5
    }
  ]
}
```

### Create Category (Admin)

POST /shops/:id/categories

This endpoint is protected and requires the categories.manage permission.

Request body:
```json
{
  "name": "Μανικιούρ",
  "nameEn": "Manicure",
  "description": "Professional manicure services",
  "sortOrder": 1
}
```

### Update Category (Admin)

PATCH /shops/:id/categories/:categoryId

This endpoint is protected and requires the categories.manage permission.

### Delete Category (Admin)

DELETE /shops/:id/categories/:categoryId

This endpoint is protected and requires the categories.manage permission. Services in this category will have their categoryId set to null.

### Reorder Categories (Admin)

PUT /shops/:id/categories/reorder

This endpoint is protected and requires the categories.manage permission.

Request body:
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Service Endpoints

### List Services

GET /shops/:id/services

This is a public endpoint. Query parameters include categoryId as a string to filter by category, includeInactive as a boolean (admin only), and search as a string to search by name.

Success response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Απλό Μανικιούρ",
      "nameEn": "Simple Manicure",
      "description": "...",
      "duration": 30,
      "price": "15.00",
      "image": "https://...",
      "category": {
        "id": "uuid",
        "name": "Μανικιούρ"
      },
      "staff": [
        {
          "id": "uuid",
          "firstName": "Maria",
          "lastName": "P."
        }
      ],
      "isActive": true
    }
  ]
}
```

### Get Service Details

GET /shops/:id/services/:serviceId

This is a public endpoint.

### Create Service (Admin)

POST /shops/:id/services

This endpoint is protected and requires the services.create permission.

Request body:
```json
{
  "name": "Απλό Μανικιούρ",
  "nameEn": "Simple Manicure",
  "description": "Classic manicure with polish",
  "categoryId": "uuid",
  "duration": 30,
  "price": 15.00,
  "bufferTime": 10,
  "staffIds": ["uuid1", "uuid2"]
}
```

### Update Service (Admin)

PATCH /shops/:id/services/:serviceId

This endpoint is protected and requires the services.update permission.

### Delete Service (Admin)

DELETE /shops/:id/services/:serviceId

This endpoint is protected and requires the services.delete permission. This performs a soft delete and existing bookings are preserved.

---

## Staff Endpoints

### List Staff (Admin)

GET /shops/:id/staff

This endpoint is protected and requires the staff.view permission. Query parameters include includeInactive as a boolean.

### List Staff (Public - for booking)

GET /shops/:id/staff/available

This is a public endpoint that returns only active staff with their services for the booking flow employee selection. Query parameters include serviceIds as a string (comma-separated) to filter by services.

Success response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Maria",
      "lastName": "P.",
      "avatar": "https://...",
      "services": ["uuid1", "uuid2"]
    }
  ]
}
```

### Get Staff Member (Admin)

GET /shops/:id/staff/:staffId

This endpoint is protected and requires the staff.view permission.

### Create Staff Member (Admin)

POST /shops/:id/staff

This endpoint is protected and requires the staff.create permission.

Request body:
```json
{
  "email": "staff@example.com",
  "password": "initialPassword123",
  "firstName": "Maria",
  "lastName": "Papadopoulou",
  "phone": "+30 690 1234567",
  "roleId": "uuid",
  "serviceIds": ["uuid1", "uuid2"],
  "schedule": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isWorking": true
    }
  ]
}
```

### Update Staff Member (Admin)

PATCH /shops/:id/staff/:staffId

This endpoint is protected and requires the staff.update permission.

### Delete Staff Member (Admin)

DELETE /shops/:id/staff/:staffId

This endpoint is protected and requires the staff.delete permission. Deactivates rather than deletes if staff has bookings.

### Update Staff Schedule (Admin)

PUT /shops/:id/staff/:staffId/schedule

This endpoint is protected and requires the staff.update permission.

### Manage Staff Time Blocks (Admin)

GET /shops/:id/staff/:staffId/time-blocks, POST /shops/:id/staff/:staffId/time-blocks, and DELETE /shops/:id/staff/:staffId/time-blocks/:blockId are all protected and require the staff.update permission.

---

## Role Endpoints

### List Roles (Admin)

GET /shops/:id/roles

This endpoint is protected and requires the roles.view permission.

### Create Role (Admin)

POST /shops/:id/roles

This endpoint is protected and requires the roles.create permission.

Request body:
```json
{
  "name": "Senior Staff",
  "description": "Experienced staff with additional permissions",
  "permissions": [
    "bookings.view",
    "bookings.create",
    "bookings.update",
    "services.view",
    "customers.view",
    "customers.notes"
  ]
}
```

### Update Role (Admin)

PATCH /shops/:id/roles/:roleId

This endpoint is protected and requires the roles.update permission.

### Delete Role (Admin)

DELETE /shops/:id/roles/:roleId

This endpoint is protected and requires the roles.delete permission. Cannot delete roles that are assigned to users and cannot delete system roles.

### Get Available Permissions (Admin)

GET /shops/:id/roles/permissions

This endpoint is protected and requires the roles.view permission. Returns the list of all available permission strings grouped by category.

---

## Customer Endpoints

### List Customers (Admin)

GET /shops/:id/customers

This endpoint is protected and requires the customers.view permission. Query parameters include search as a string to search by name or email, page as an integer, and limit as an integer.

### Get Customer Details (Admin)

GET /shops/:id/customers/:customerId

This endpoint is protected and requires the customers.view permission.

Success response (200):
```json
{
  "id": "uuid",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+30 690 1234567",
  "notes": "Prefers morning appointments",
  "createdAt": "2024-01-15T10:00:00Z",
  "bookingStats": {
    "totalBookings": 15,
    "completedBookings": 12,
    "cancelledBookings": 2,
    "noShows": 1,
    "totalSpent": "450.00"
  },
  "recentBookings": [...]
}
```

### Update Customer (Admin)

PATCH /shops/:id/customers/:customerId

This endpoint is protected and requires the customers.update permission.

### Update Customer Notes (Admin)

PATCH /shops/:id/customers/:customerId/notes

This endpoint is protected and requires the customers.notes permission.

### Get Current Customer Profile

GET /customers/me

This endpoint is protected with customer auth.

### Update Current Customer Profile

PATCH /customers/me

This endpoint is protected with customer auth. Request body can include firstName, lastName, and phone.

---

## Availability Endpoints

### Get Available Slots

GET /shops/:id/availability

This is a public endpoint that returns available time slots for booking.

Query parameters include date as a string (required, format YYYY-MM-DD), serviceIds as a string (required, comma-separated service UUIDs), and staffId as a string (optional, specific staff member).

Success response (200):
```json
{
  "date": "2024-03-15",
  "slots": [
    {
      "startTime": "09:00",
      "endTime": "10:30",
      "availableStaff": [
        {
          "id": "uuid",
          "firstName": "Maria",
          "lastName": "P."
        }
      ]
    },
    {
      "startTime": "09:30",
      "endTime": "11:00",
      "availableStaff": [...]
    }
  ]
}
```

### Get Available Dates

GET /shops/:id/availability/dates

This is a public endpoint that returns dates with availability in a date range.

Query parameters include startDate as a string (required), endDate as a string (required), serviceIds as a string (required), and staffId as a string (optional).

Success response (200):
```json
{
  "availableDates": ["2024-03-15", "2024-03-16", "2024-03-18"]
}
```

---

## Booking Endpoints

### Create Booking (Customer)

POST /shops/:id/bookings

This endpoint is protected with customer auth or requires customer details in body.

Request body for authenticated customer:
```json
{
  "serviceIds": ["uuid1", "uuid2"],
  "staffId": "uuid",
  "startTime": "2024-03-15T09:00:00Z",
  "customerNotes": "Please use gel polish"
}
```

Request body for guest booking:
```json
{
  "serviceIds": ["uuid1", "uuid2"],
  "staffId": "uuid",
  "startTime": "2024-03-15T09:00:00Z",
  "customer": {
    "email": "guest@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+30 690 1234567"
  },
  "customerNotes": "First time visit"
}
```

Success response (201):
```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "startTime": "2024-03-15T09:00:00Z",
  "endTime": "2024-03-15T10:30:00Z",
  "totalPrice": "45.00",
  "totalDuration": 90,
  "services": [...],
  "staff": {...},
  "customer": {...}
}
```

Error response when slot unavailable (409):
```json
{
  "statusCode": 409,
  "message": "Selected time slot is no longer available",
  "error": "Conflict"
}
```

### Create Booking (Admin)

POST /shops/:id/bookings/admin

This endpoint is protected and requires the bookings.create permission. Allows creating bookings for walk-ins or phone bookings.

Request body:
```json
{
  "customerId": "uuid",
  "serviceIds": ["uuid1"],
  "staffId": "uuid",
  "startTime": "2024-03-15T09:00:00Z",
  "staffNotes": "Walk-in customer"
}
```

### List Bookings (Admin)

GET /shops/:id/bookings

This endpoint is protected and requires bookings.view or bookings.view_own permission.

Query parameters include startDate as a string (required), endDate as a string (required), staffId as a string to filter by staff, status as a string to filter by status, and customerId as a string to filter by customer.

### Get Booking Details

GET /shops/:id/bookings/:bookingId

This endpoint is protected and requires bookings.view permission for admin or ownership for customer.

### Update Booking (Admin)

PATCH /shops/:id/bookings/:bookingId

This endpoint is protected and requires the bookings.update permission. Request body can include staffId, startTime, status, and staffNotes.

### Cancel Booking (Customer)

POST /shops/:id/bookings/:bookingId/cancel

This endpoint is protected with customer auth and is subject to cancellation policy. Request body can include reason as an optional string.

### Cancel Booking (Admin)

POST /shops/:id/bookings/:bookingId/admin-cancel

This endpoint is protected and requires the bookings.delete permission. Request body requires reason as a string.

### Get Customer Bookings

GET /customers/me/bookings

This endpoint is protected with customer auth. Query parameters include status as a string ("upcoming" or "past") and page and limit for pagination.

---

## Dashboard/Stats Endpoints (Admin)

### Get Dashboard Stats

GET /shops/:id/dashboard

This endpoint is protected and requires the reports.view permission. Query parameters include period as a string ("today", "week", "month", or "year").

Success response (200):
```json
{
  "period": "week",
  "bookings": {
    "total": 45,
    "confirmed": 40,
    "cancelled": 3,
    "completed": 2,
    "pending": 0
  },
  "revenue": {
    "total": "1350.00",
    "average": "30.00"
  },
  "customers": {
    "total": 38,
    "new": 12,
    "returning": 26
  },
  "topServices": [
    {
      "id": "uuid",
      "name": "Manicure",
      "bookingCount": 20
    }
  ],
  "upcomingToday": [...]
}
```

---

## Upload Endpoints

### Upload Image

POST /uploads/image

This endpoint is protected with admin auth. Request content type is multipart/form-data with a file field containing the image file (max 5MB, jpg/png/webp).

Success response (200):
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "booking-app/services/abc123"
}
```

### Delete Image

DELETE /uploads/image/:publicId

This endpoint is protected with admin auth.

---

## Rate Limiting

The API implements rate limiting to prevent abuse. Default limits apply to all endpoints at 100 requests per minute per IP. Authentication endpoints have stricter limits of 10 requests per minute per IP. OTP requests are limited to 3 requests per minute per email.

Rate limit headers are included in responses with X-RateLimit-Limit showing the request limit, X-RateLimit-Remaining showing remaining requests, and X-RateLimit-Reset showing when the limit resets as a Unix timestamp.

## API Versioning

The current API version is v1. When breaking changes are introduced in the future, a new version (v2) will be created while maintaining v1 for backward compatibility. Version is specified in the URL path as /api/v1/ and deprecation notices will be communicated via response headers.
