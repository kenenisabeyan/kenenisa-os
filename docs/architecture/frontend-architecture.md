# Frontend Architecture — `apps/web`

## Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS v3 + CSS Variables + Glassmorphism
- **Routing:** React Router DOM v6
- **Utilities:** `clsx`, `tailwind-merge` (`cn()`), centralized `dateTime.ts`

## Folder Organization

```
src/
├── app/
│   ├── config/      # Frontend environment config
│   ├── providers/   # React context & provider wrapper
│   └── router/      # React Router route declarations
├── components/
│   ├── ui/          # Reusable UI primitives (buttons, inputs, cards)
│   ├── layout/      # Nav, Header, Sidebar, Footer
│   └── shared/      # Feature-agnostic shared components
├── features/        # Feature modules (academic, engineering, etc.)
├── pages/           # Screen level components
├── hooks/           # Custom React hooks
├── lib/             # Shared frontend utilities (cn, dateTime)
├── services/        # API client & endpoint functions
└── types/           # Web-specific TypeScript types
```
