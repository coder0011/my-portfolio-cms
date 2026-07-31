# My Portfolio CMS

Custom portfolio and blogging CMS built with Laravel, Inertia, React, and TypeScript. The application provides an authenticated admin dashboard for managing content, a public JSON API for frontend consumption, role-based access control, comment moderation, newsletter subscriber management, and webhook-based frontend rebuilds.

## Overview

This repository is structured as a headless-friendly CMS:

- Admin users manage content through an authenticated dashboard.
- Public consumers read published content through versioned API endpoints under `/api/v1`.
- Content changes can dispatch queued webhook jobs to trigger frontend rebuilds or cache purges.
- Roles and permissions gate access to editorial, moderation, and operational actions.

The current implementation is suitable for a portfolio site, a technical blog, or a custom content backend for a separate frontend application.

## Core Features

### Admin dashboard

- Dashboard metrics for posts, likes, comments, and subscribers.
- Recent posts and recent comments summary on the dashboard.
- Inertia-powered admin pages built with React and TypeScript.

### Post management

- Create, edit, list, and delete posts.
- Publish scheduling using `published_at`.
- Category assignment for posts.
- Tags and secondary keywords stored as JSON arrays.
- SEO-oriented fields including meta title, meta description, focus keyword, and `no_index`.
- Main image upload with storage-backed file handling.
- Difficulty and estimated reading time metadata.
- Automatic post revision snapshot creation before updates.

### Comment moderation

- Public comment submission via API.
- Admin moderation workflow with approval toggling.
- Admin comment editing and deletion.
- Admin replies to comments using threaded parent/child relationships.

### Subscribers

- Public newsletter subscription endpoint.
- Admin subscriber listing and deletion.

### Roles and permissions

- Spatie Laravel Permission for persisted roles and permissions.
- Gate-based authorization at controller level.
- Global Super Admin bypass via `Gate::before(...)`.
- Seeded roles include:
  - Super Admin
  - Editor
  - Moderator

### Auth and account security

- Laravel Fortify authentication.
- Email verification for dashboard access.
- Passkey support.
- Two-factor authentication columns and security settings flow.
- Profile and appearance settings pages.

### Async frontend rebuild hooks

- Content events dispatch `DispatchWebhookJob` to the queue.
- Optional `FRONTEND_REBUILD_WEBHOOK_URL` integration for static-site rebuilds or cache invalidation.

## Tech Stack

### Backend

- PHP 8.3+
- Laravel 13
- Laravel Fortify
- Inertia Laravel
- Spatie Laravel Permission
- Pest
- PHPStan
- Laravel Pint

### Frontend

- React 19
- TypeScript
- Vite 8
- Inertia React
- Tailwind CSS 4
- Radix UI primitives

## Project Structure

Key areas of the codebase:

- `app/Http/Controllers/Admin`: authenticated CMS actions for posts, comments, logs, and subscribers.
- `app/Http/Controllers/Api`: public API endpoints for frontend consumption.
- `app/Jobs`: queued jobs such as frontend rebuild webhook dispatching.
- `app/Models`: content, analytics, comments, revisions, settings, subscribers, and users.
- `database/migrations`: database schema, including roles and permissions tables.
- `database/seeders`: initial roles, permissions, and default admin user.
- `resources/js/pages`: Inertia pages for dashboard, auth, admin, and settings.
- `routes/web.php`: admin and dashboard routes.
- `routes/api.php`: public versioned API routes.
- `docs/LARAVEL_CMS_PLAN.md`: higher-level implementation and roadmap notes.

## Requirements

Before running the project, make sure you have:

- PHP 8.3 or newer
- Composer
- Node.js 20+ recommended
- npm or pnpm
- A supported database configured in `.env`
- Queue support configured if you want asynchronous webhook dispatching

## Installation

### 1. Clone and enter the project

```bash
git clone <your-repository-url>
cd my-portfolio-cms
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Create environment file

```bash
copy .env.example .env
```

If `.env` already exists, keep your current version and update only the required values.

### 4. Configure environment values

Update at minimum:

```env
APP_NAME="My Portfolio CMS"
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=my_portfolio_cms
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database

FRONTEND_REBUILD_WEBHOOK_URL=
```

Notes:

- `FRONTEND_REBUILD_WEBHOOK_URL` is optional. If empty, webhook jobs log and exit safely.
- `QUEUE_CONNECTION=database` is a practical default for local development if you run a queue worker.

### 5. Generate the application key

```bash
php artisan key:generate
```

### 6. Run migrations and seeders

```bash
php artisan migrate --seed
```

This seeds roles, permissions, and a default admin account.

### 7. Install frontend dependencies

```bash
npm install
```

### 8. Create the storage symlink

```bash
php artisan storage:link
```

This is required for uploaded blog images and other storage-backed assets to be publicly accessible.

## Default Admin Account

The database seeder creates a default Super Admin account:

- Email: `admin@admin.com`
- Password: `password`

Change this immediately outside local development.

## Running the App

### Recommended development workflow

Use the Composer dev script to run the full local stack:

```bash
composer run dev
```

This starts:

- Laravel development server
- Queue listener
- Vite development server

### Alternative manual workflow

Backend:

```bash
php artisan serve
```

Queue worker:

```bash
php artisan queue:listen --tries=1 --timeout=0
```

Frontend assets:

```bash
npm run dev
```

## Available Scripts

### Composer scripts

- `composer run setup`: install dependencies, create `.env`, generate key, migrate, install JS packages, and build assets.
- `composer run dev`: run Laravel, queue listener, and Vite concurrently.
- `composer run lint`: run Laravel Pint.
- `composer run lint:check`: run Pint in check mode.
- `composer run types:check`: run PHPStan analysis.
- `composer run test`: clear config, run Pint check, run PHPStan, and execute the Laravel test suite.
- `composer run ci:check`: run JS lint check, formatting check, TypeScript check, and backend tests.

### Frontend scripts

- `npm run dev`: start Vite.
- `npm run build`: production frontend build.
- `npm run build:ssr`: build client and SSR bundles.
- `npm run lint`: ESLint with fixes.
- `npm run lint:check`: ESLint in check mode.
- `npm run format`: Prettier write on `resources/`.
- `npm run format:check`: Prettier check on `resources/`.
- `npm run types:check`: TypeScript no-emit typecheck.

## Roles and Permissions

Seeded permissions:

- `posts.create`
- `posts.edit`
- `posts.delete`
- `posts.publish`
- `revisions.restore`
- `comments.approve`
- `comments.delete`
- `subscribers.manage`
- `logs.view`

Seeded roles:

- `Super Admin`: full access, including a global Gate bypass.
- `Editor`: post management, revision access, and log viewing.
- `Moderator`: comment approval and deletion.

## Public API

All public endpoints are prefixed with `/api/v1`.

### Settings

- `GET /api/v1/settings`

Returns public site settings such as site name and branding asset paths.

### Posts

- `GET /api/v1/posts`
- `GET /api/v1/posts/{slug}`
- `POST /api/v1/posts/{id}/like`

Supported list query parameters:

- `category`: filter by category slug.
- `tag`: filter by tag value.
- `limit`: paginator page size.

Only published posts where `published_at <= now()` and `no_index = false` are returned in the listing endpoint.

### Comments

- `POST /api/v1/posts/{postId}/comments`

Expected payload:

```json
{
  "name": "Jane Doe",
  "comment": "Great post.",
  "user_id": "browser-local-uuid",
  "parent_id": null
}
```

New comments are created as unapproved and require admin moderation.

### Subscribers

- `POST /api/v1/subscribers`

Expected payload:

```json
{
  "email": "reader@example.com"
}
```

## Webhook Rebuild Flow

The CMS dispatches queued webhook jobs for these events:

- `post.created`
- `post.updated`
- `post.deleted`
- `comment.approved`

When `FRONTEND_REBUILD_WEBHOOK_URL` is configured, the job sends a POST request containing:

```json
{
  "event": "post.updated",
  "timestamp": "2026-07-31T12:00:00+00:00",
  "data": {
    "post_id": 1,
    "slug": "example-post"
  }
}
```

If no webhook URL is configured, the job skips dispatch and writes a log entry instead.

## Development Notes

- Uploaded images are stored under `storage/app/public/blogs/images` and exposed through `/storage/...` URLs.
- The dashboard routes require authenticated and verified users.
- Some security-related settings pages require recent password confirmation.
- Passkey discovery is exposed at `/.well-known/passkey-endpoints`.

## Quality Checks

Run the main verification pipeline with:

```bash
composer run test
```

For a fuller cross-stack check:

```bash
composer run ci:check
```

## Deployment Notes

- Set `APP_ENV=production` and disable debug mode.
- Use a real queue worker in production.
- Replace the seeded admin credentials.
- Configure a production-safe database and mail provider.
- Set `FRONTEND_REBUILD_WEBHOOK_URL` if your frontend depends on rebuild or cache purge hooks.
- Ensure `php artisan storage:link` has been run on the deployed instance.

## License

This project is currently distributed under the repository's applicable licensing terms. If you plan to publish it publicly, add an explicit license file.