---
name: database-skill
description: Design and manage relational database schemas, tables, and migrations. Use for data modeling, schema evolution, and persistence layers.
---

# Database Skill – Schema Design & Migrations

## Instructions

1. **Schema Design**
   - Identify core entities and relationships
   - Define clear primary and foreign keys
   - Normalize data to reduce redundancy
   - Choose appropriate data types and constraints
   - Enforce data integrity at the database level

2. **Table Creation**
   - Create tables with explicit columns and constraints
   - Use indexes for frequently queried fields
   - Include timestamps (`created_at`, `updated_at`) where applicable
   - Ensure naming consistency and clarity
   - Design for multi-user and scalable use cases

3. **Migrations**
   - Use versioned, incremental migrations
   - Make migrations reversible when possible
   - Avoid destructive changes without a clear strategy
   - Keep migrations small and focused
   - Test migrations against real data scenarios

4. **Relationships & Constraints**
   - Define foreign keys with proper cascading rules
   - Enforce uniqueness and not-null constraints
   - Model one-to-many and many-to-many relationships explicitly
   - Prevent orphaned or inconsistent records

## Best Practices

- Treat the database schema as a long-term contract
- Prefer explicit constraints over application-only validation
- Index based on query patterns, not assumptions
- Avoid premature optimization, but plan for growth
- Document schema changes and migration intent
- Keep schema design aligned with domain and specs

## Example Table Definition

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
