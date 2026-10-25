# Appointment Booking Platform SaaS

A multi-tenant appointment booking platform designed to help businesses manage their services, staff, availability, and customer appointments through a centralized system.

The project is being developed with a focus on backend engineering, database design, authentication, authorization, appointment scheduling, and data integrity.

**Project Status:** Backend deployed | Frontend in progress

**Live Backend:** [Appointment Booking API](https://appointment-booking-platform-saas-backend.onrender.com/)

**Backend Health Check:** [Check API Health](https://appointment-booking-platform-saas-backend.onrender.com/health)

---

## Table of Contents

- [Overview](#overview)
- [Project Status](#project-status)
- [Features](#features)
- [Backend Architecture](#backend-architecture)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Appointment Scheduling and Data Integrity](#appointment-scheduling-and-data-integrity)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Live Deployment](#live-deployment)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Frontend](#frontend)
- [Future Improvements](#future-improvements)

---

## Overview

The Appointment Booking Platform is a SaaS application designed to support multiple businesses on a shared platform.

Each organization can manage its services, staff members, availability, and appointments while access to organization-specific resources is controlled through membership and role-based authorization.

The backend provides the foundation for appointment scheduling, authentication, organization management, and database-level protection against conflicting bookings.

The frontend is currently under development and will provide the user interface for interacting with these backend capabilities.

### Key Objectives

- Build a multi-tenant application with organization-based resource management.
- Implement authentication and role-based authorization.
- Design relational database models and relationships.
- Build REST APIs using Node.js, Express, and TypeScript.
- Implement appointment scheduling with conflict prevention.
- Use Prisma ORM and PostgreSQL for persistent data storage.
- Deploy the backend and production database infrastructure.

---

## Project Status

| Component | Status |
|---|---|
| Backend API | Implemented |
| Authentication | Implemented |
| Organization management | Implemented |
| Membership and role-based access | Implemented |
| Service management | Implemented |
| Staff-service assignments | Implemented |
| Availability management | Implemented |
| Appointment management | Implemented |
| PostgreSQL database | Configured |
| Prisma migrations | Applied; schema reported up to date |
| Backend deployment | Live on Render |
| Frontend application | In progress |
| End-to-end production verification | Ongoing |

---

## Features

### 1. Authentication and Authorization

The backend includes authentication and access-control functionality.

- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- Role-based authorization.
- Organization membership checks.

Protected operations can verify whether a user is authorized to access or modify organization-specific resources.

### 2. Multi-Tenant Organization Management

The platform supports multiple organizations.

- Create and manage organizations.
- Associate users with organizations through memberships.
- Support organization-specific resources.
- Apply membership and role checks to protected operations.

The multi-tenant design provides a foundation for supporting multiple businesses through one application.

### 3. Service Management

Organizations can manage the services they offer.

- Create services.
- Retrieve organization services.
- Retrieve individual services.
- Update service information.
- Support partial service updates.
- Associate services with staff members.

Service information includes properties such as price and duration.

### 4. Staff Management

The backend supports assigning services to staff members.

These assignments provide the foundation for determining which staff members can perform particular services.

Authorization checks help restrict management operations to permitted organization members.

### 5. Availability Management

The backend includes availability-management functionality.

- Create availability records.
- Update availability.
- Retrieve availability information.

This functionality forms part of the scheduling system used to determine when appointments can be booked.

### 6. Appointment Management

The backend includes appointment-related functionality for managing bookings.

Appointment scheduling must account for staff availability, appointment duration, and conflicting bookings.

The database also includes protection against overlapping active appointments for the same staff member.

### 7. Database-Level Conflict Prevention

The PostgreSQL database uses an exclusion constraint to prevent overlapping appointment time ranges for the same staff member when the appointment status is `PENDING` or `CONFIRMED`.

This provides an additional integrity safeguard at the database level, rather than relying exclusively on application-level validation.

---

## Backend Architecture

The backend follows a modular structure that separates HTTP routing, request handling, validation, business logic, and database access.

### Request Flow

```text
Client / Frontend
       |
       v
   HTTP Request
       |
       v
Express Application
       |
       v
Authentication Middleware
       |
       v
Authorization Middleware
       |
       v
Request Validation
       |
       v
Controller Layer
       |
       v
Service / Business Logic
       |
       v
Prisma ORM
       |
       v
PostgreSQL Database
```

The exact middleware applied depends on the endpoint.

### Architecture Components

**Express.js**

Handles HTTP requests, routing, middleware, and API responses.

**TypeScript**

Provides static typing throughout the backend codebase.

**Zod**

Provides request validation schemas and TypeScript type inference.

**Prisma ORM**

Provides database access, schema management, and migration tooling.

**PostgreSQL**

Stores application data, including users, organizations, services, availability, and appointments.

**JWT**

Supports authentication for protected endpoints.

**bcrypt**

Supports secure password hashing.

**Helmet and CORS**

Provide HTTP security headers and cross-origin request configuration.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | Backend web framework |
| TypeScript | Static typing |
| PostgreSQL | Relational database |
| Prisma ORM 7 | Database access and migrations |
| Zod | Request validation |
| JSON Web Tokens | Authentication |
| bcrypt | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin access configuration |
| Neon | Hosted PostgreSQL database |
| Render | Backend deployment |
| Git and GitHub | Version control and source code hosting |

The frontend technology stack and deployment configuration will be documented as frontend development progresses.

---

## Database Design

The Prisma data model includes entities for identity, organizations, service management, scheduling, payments, and notifications.

### Core Models

| Model | Responsibility |
|---|---|
| `User` | Stores user information and authentication-related data |
| `Organization` | Represents a business or tenant |
| `OrganizationMember` | Represents a user's membership in an organization |
| `Service` | Stores services offered by an organization |
| `StaffService` | Associates staff members with services |
| `Availability` | Stores staff availability information |
| `AvailabilityException` | Represents exceptions to regular availability |
| `BusinessClosure` | Represents business closure periods |
| `Appointment` | Stores appointment and booking information |
| `Payment` | Stores payment-related records |
| `Notification` | Stores notification-related records |

The database also defines enums for application-specific states and roles.

The exact relationships and constraints are defined in the Prisma schema.

---

## Appointment Scheduling and Data Integrity

Appointment scheduling is a central part of this project.

One important database constraint is:

`Appointment_no_overlapping_active_staff_appointments`

The PostgreSQL exclusion constraint uses GiST indexing and the `btree_gist` extension to enforce scheduling rules.

Conceptually, it prevents two appointments from having overlapping time ranges when they belong to the same staff member and have a status of `PENDING` or `CONFIRMED`.

Appointments use half-open time ranges:

```text
[startTime, endTime)
```

This allows consecutive appointments without treating them as overlapping.

For example:

```text
Appointment A: 10:00 AM - 10:30 AM
Appointment B: 10:30 AM - 11:00 AM
```

These appointments can coexist because the first appointment's end time is excluded from its time range.

However:

```text
Appointment A: 10:00 AM - 10:30 AM
Appointment B: 10:15 AM - 10:45 AM
```

These appointments conflict when assigned to the same staff member and both have an active status covered by the constraint.

Database-level enforcement helps protect data integrity when concurrent requests attempt to create conflicting appointments.

---

## API Overview

The backend exposes REST API endpoints through the Express application.

The following table describes the main API areas.

| API Area | Base Path | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Registration and login |
| Organizations | `/api/organizations` | Organization-related operations |
| Services | `/api/organizations` | Organization service management |
| Availability | Defined by the availability router | Availability management |
| Appointments | Defined by the appointment router | Appointment operations |
| Health | `/health` | Application health check |

Some resource endpoints require authentication and organization membership or role authorization.

The exact HTTP methods, parameters, and request bodies are defined in the backend routes and validation schemas.

### Live Backend

**Base URL:**

https://appointment-booking-platform-saas-backend.onrender.com/

**Health endpoint:**

https://appointment-booking-platform-saas-backend.onrender.com/health

The health endpoint verifies that the application responds to HTTP requests. It does not, by itself, verify every API operation or database-dependent workflow.

---

## Project Structure

The repository contains separate backend and frontend directories.

```text
appointment-booking-platform/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── server.ts
│   │
│   ├── prisma.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   └── Frontend application (in progress)
│
├── docker-compose.yml
└── README.md
```

The exact directory structure may evolve as development continues.

---

## Live Deployment

The backend is deployed on Render, with PostgreSQL hosted on Neon.

- **Backend API:** [Open the deployed backend](https://appointment-booking-platform-saas-backend.onrender.com/)
- **Health Check:** [Check backend health](https://appointment-booking-platform-saas-backend.onrender.com/health)

The production database migrations have been reconciled, and Prisma reports that the database schema is up to date.

Production API workflows should continue to be verified as the frontend is integrated.

---

## Getting Started

### Prerequisites

Install the following before running the backend locally:

- Node.js and npm.
- PostgreSQL, or access to a PostgreSQL database.
- Git.
- A compatible Prisma configuration and environment setup.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd appointment-booking-platform
```

Replace the placeholder with the actual GitHub repository URL.

### 2. Navigate to the Backend

```bash
cd backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

Configure the variables required by your application, including the database connection string and authentication secret.

See the next section for details.

### 5. Generate the Prisma Client

```bash
npx prisma generate
```

### 6. Start the Development Server

```bash
npm run dev
```

The backend will start according to the development configuration in `package.json`.

---

## Environment Variables

Configure the required environment variables in your local `backend/.env` file and in your deployment environment.

Example:

```env
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
JWT_SECRET="YOUR_STRONG_SECRET"
NODE_ENV="development"
FRONTEND_URL="YOUR_FRONTEND_ORIGIN"
```

These values are examples, not production credentials.

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret used to sign and verify JWTs.
- `NODE_ENV`: Application environment.
- `FRONTEND_URL`: Frontend origin used for cross-origin configuration, if required by the application.

Use the exact variable names expected by your backend code.

**Never commit `.env` files, database credentials, JWT secrets, or other sensitive configuration to GitHub.**

Use environment variables in Render for production configuration.

---

## Database Migrations

The project uses Prisma Migrate to manage database schema changes.

### Check Migration Status

```bash
npx prisma migrate status
```

### Apply Pending Migrations

```bash
npx prisma migrate deploy
```

### Generate Prisma Client

```bash
npx prisma generate
```

Migrations should be committed to version control and applied in the appropriate environment.

For production databases, inspect failed migrations and the actual database state before attempting recovery. Do not mark a migration as applied unless its intended database changes have already been applied.

---

## Frontend

**Status: In progress**

The frontend will provide the user interface for interacting with the deployed backend.

Planned capabilities include:

- User registration and login.
- Organization onboarding and management.
- Service creation and management.
- Staff and service assignment.
- Availability management.
- Appointment booking and management.
- API integration with the deployed backend.
- Loading states, validation feedback, and error handling.

The frontend will use the deployed backend URL through environment-based API configuration.

The frontend implementation and deployment instructions will be added to this README as development progresses.

---

## Future Improvements

Potential areas for continued development include:

- Complete frontend integration.
- End-to-end testing of production workflows.
- Automated backend integration tests.
- API documentation using OpenAPI or Swagger.
- Improved observability and structured logging.
- Rate limiting and abuse protection.
- Appointment reminders and notification delivery.
- Payment-provider integration.
- Improved deployment automation.
- CI/CD pipelines.
- Monitoring, backups, and production reliability improvements.

These items represent future work and should not be interpreted as already implemented.

---

## Project Goal

The goal is to build a maintainable, production-oriented SaaS application that demonstrates backend engineering skills, relational database design, multi-tenant authorization, appointment scheduling, and reliable deployment practices.

The backend foundation is deployed, and frontend development is the next major phase.

**Backend:** Deployed  
**Frontend:** In progress

---
