# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timestock backend is a time tracking application built on **Strapi 5** with TypeScript. It allows users to track time on projects, manage tasks, receive reminders, and get push notifications.

## Commands

```bash
pnpm dev          # Start development server with hot-reload
pnpm build        # Build admin panel and compile for production
pnpm start        # Start production server (requires build first)
```

## Architecture

### Strapi API Structure

Each API module in `src/api/` follows Strapi conventions:
- `content-types/*/schema.json` - Entity schema definition
- `controllers/*.ts` - Request handlers (extend core controller with `factories.createCoreController`)
- `routes/*.ts` - Route definitions
- `services/*.ts` - Business logic (two patterns: `*.service.ts` for static class services, `*.ts` for Strapi factory services)

### Core Domain Models

- **time-entry** - Time tracking records with start/end times, linked to project and task
- **project** - Projects with owner, members, color, and aggregated `time_spent`
- **task** - Tasks within projects with estimated time and completion status
- **daily-aggregate** - Pre-calculated daily time totals per user/project (with timezone handling)
- **project-reminder** - Scheduled push notification reminders for projects

### Shared Utilities (`src/shared/`)

- **`utils/context.ts`** - `Context` class wraps Koa context, provides typed access to user ID, body, params, filters, populate. Use in controllers: `const context = new Context(ctx)`
- **`lib/response.ts`** - Response helpers: `sendResponse()`, `sendError()`, `sendValidationError()`, `sendNotFoundError()`
- **`lib/validate-payload.ts`** - Zod schema validation with `validatePayload(schema, data)`
- **`services/push.service.ts`** - `PushService.sendToUser()` for web push notifications via VAPID

### Validation

Use Zod schemas for request validation. Pattern from `src/api/auth/`:
```typescript
const { data: body, error, success } = schema.safeParse(rawBody);
if (!success) {
  return sendValidationError({ details: error.format() });
}
```

### Cron Tasks (`config/cron-tasks.ts`)

- `sendNotifications` - Runs every minute, sends project reminders that are due
- `longTrackNotification` - Runs every minute, notifies users of timers running >8 hours

### Project Time Recalculation

When time entries change, `ProjectService.recalculateTotalDuration()` updates project's `time_spent` field using raw SQL aggregation. This is called from `time-entry` controller, not lifecycle hooks.

### Authentication

Custom OTP-based authentication via email in `src/api/auth/`. Uses Strapi's `users-permissions` plugin with extended user schema and session manager for JWT/refresh tokens.

### Database

Supports PostgreSQL (production) and SQLite (development). Configured via environment variables in `config/database.ts`.

## Code Patterns

- Controllers access current user via `context.getUserId()` after wrapping ctx
- Use `strapi.documents('api::entity.entity')` for document API (Strapi 5)
- Raw SQL via `strapi.db.connection.raw()` when needed for performance
- Russian comments are used throughout the codebase
