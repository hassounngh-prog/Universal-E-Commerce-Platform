# Project Overview

## Name

CommerceCore — Universal E-Commerce Platform

---

## Description

CommerceCore is a production-grade universal e-commerce platform that powers virtually any online business through configuration, extension, and branding instead of code changes. It supports physical goods, digital products, services, subscriptions, and more across any industry (fashion, electronics, furniture, books, cosmetics, food, and beyond).

---

# Business Context

## Problem

Businesses face high costs building custom e-commerce platforms. Off-the-shelf solutions lack flexibility. Most platforms are tied to specific business domains, requiring rewrites to pivot or expand.

## Goals

- Single platform powering multiple e-commerce domains without code changes
- Configurable white-label branding per store
- Provider-agnostic architecture (payment, storage, search, shipping)
- Extensible via plugins without modifying the core
- Fast, mobile-first shopping experience
- Secure checkout and payment processing
- Scalable from single store to enterprise marketplace

## Target Users

Primary: E-commerce businesses, store owners, merchants
Secondary: Developers extending the platform, administrators

---

# Core Features

- Product Catalog — any product type (physical, digital, service, subscription)
- Dynamic Attributes — industries define their own product properties
- Shopping Cart — session-persistent, guest-to-user merge
- Checkout — modular address, shipping, tax, payment pipeline
- Orders — full lifecycle with status tracking
- Multi-tenant — support multiple stores from one deployment
- White Label — all branding configurable per tenant
- Provider System — swappable payment, storage, search, shipping, tax engines
- Plugin System — isolated extensions (wishlist, loyalty, affiliate, marketplace)
- CMS — pages, blog, content blocks
- Admin Panel — domain-agnostic management

---

# Architecture Summary

```
Application Layer (Store, Admin, API, CMS)
        ↓
Business Configuration (per-tenant)
        ↓
Commerce Core (business-agnostic engine)
        ↓
Shared Platform (utilities, types, validation)
        ↓
Infrastructure (provider implementations)
        ↓
External Services (database, storage, payment, search)
```

---

# Development Principles

This project follows `.ai/core/*` standards:
- Clean Architecture with strict layer boundaries
- Feature-driven development
- Domain-Driven Design where appropriate
- Mobile-first, server-first, API-first
- Security-first mindset
- Configuration over hardcoding
- Provider abstraction over vendor lock-in

---

# Current Project State

Phase: Architecture Transformation

Completed (Foundation):
- .ai framework initialization
- Project documentation
- Application scaffolding (Next.js 16, TypeScript strict, Tailwind v4)
- Database schema (requires universal extension)
- Authentication (NextAuth.js v5)
- Route protection (Next.js 16 proxy)
- Validation layer (Zod)

Next:
- Universal platform architecture layer creation
- Provider interface definitions
- Database schema extension for multi-type products
- Core commerce engine implementation

---

# Important Decisions

See `.ai/project/decisions.md` and `.ai/project/universal-platform.md`.
