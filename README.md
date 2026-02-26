# Golura

Node.js/Express backend for a multi-tenant field service management platform — handling estimates, scheduling, invoicing, payments, real-time communications, and AI-assisted analysis across company workspaces.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Runtime | Node.js, Express |
| Database | MySQL, Sequelize ORM |
| Real-time | Socket.IO |
| Payments | Stripe (subscriptions, ACH, webhooks) |
| Communications | Twilio (SMS, voice), Mailgun |
| Media | Cloudinary, Vimeo |
| Search | MeiliSearch |
| AI | OpenAI, Ollama (local) |
| Monitoring | Sentry |
| DevOps | PM2 (ecosystem.config.js) |

## Code Tour

| Path | What to look at |
|------|----------------|
| `helpers/stripe.js` | Subscription lifecycle, webhooks, proration logic |
| `helpers/twilio.js` | SMS/voice communication layer |
| `helpers/permissions.js` | RBAC permission resolution |
| `helpers/security.js` | Rate limiting, token validation, audit hooks |
| `helpers/paginate.js` | Reusable cursor-based pagination |
| `helpers/activityLogger.js` | Audit trail and activity feed system |
| `ai/estimates.js` | OpenAI prompt construction and response parsing |
| `functions/estimates.js` | Full estimate lifecycle (create, version, approve) |
| `functions/payrolls.js` | Payroll processing with PDF generation |
| `models/` | 60+ Sequelize models with associations and hooks |
| `migrations/` | 80+ ordered schema migrations |

## Project Structure

```
golura/
├── functions/        # Route handlers (estimates, users, invoices, etc.)
├── helpers/          # Shared logic (Stripe, Twilio, RBAC, PDF, email)
├── ai/               # OpenAI + Ollama integrations
├── models/           # Sequelize models and associations
├── migrations/       # Database schema migrations
├── routes/           # Express route definitions
├── public/           # AngularJS frontend (controllers, directives, views)
├── config/           # Database and service configuration
├── app.js            # Express app setup, middleware, CORS
├── routes.js         # Top-level route registration
└── sockets.js        # Socket.IO event handlers
```

## Notes

This repo is sanitized for public viewing. Secrets have been removed and replaced with placeholders — see `.env.example` for the full configuration schema. The app is not intended to be run from this repo; it's here to demonstrate code quality and architecture.
