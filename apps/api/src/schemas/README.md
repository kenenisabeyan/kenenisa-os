# API Request Schemas

This directory contains endpoint validation schemas written in Zod.

## Pattern

- Each feature module defines its request body, query, and param Zod schemas.
- Route middleware uses `validate({ body: schema })` before passing control to controllers.
