# Workspace

## Overview

pnpm workspace monorepo usando TypeScript. Sistema de tickets de soporte técnico con portal para clientes y portal de administración.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Email**: Resend (transactional email)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── soporte-tickets/    # React + Vite frontend (portal cliente + admin)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Portal Cliente (/)
- Formulario de carga de tickets: nombre, empresa, tipo de problema (hardware/software), descripción, teléfono, email
- Al enviar: recibe número de ticket por email

### Portal Admin (/admin)
- Lista de todos los tickets con filtros por estado
- Vista de detalle de ticket con todos los datos
- Cambio de estado: Cargado → En revisión → Finalizado
- Comentarios internos (solo admin) o mensajes al cliente (se envía por email)
- Notificación por email al admin cuando llega un nuevo ticket

## Database Schema

- **tickets**: id, ticketNumber, clientName, company, email, phone, problemType, description, status, createdAt, updatedAt
- **comments**: id, ticketId, content, isInternal, createdAt

## Email (Resend)

Requiere `RESEND_API_KEY` configurado como secreto.
- Notificación al cliente con número de ticket al crear
- Notificación al admin (matiasagustinpatti123@gmail.com) cuando llega un ticket nuevo
- Notificación al cliente cuando el admin agrega un mensaje público

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes: tickets CRUD, comments.

### `artifacts/soporte-tickets` (`@workspace/soporte-tickets`)

React + Vite frontend. Portal cliente en `/`, portal admin en `/admin`, detalle de ticket en `/admin/ticket/:id`.

### `lib/db` (`@workspace/db`)

Database schema: tickets, comments tables.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec + codegen config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks.
