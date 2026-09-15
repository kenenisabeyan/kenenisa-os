# Intelligence Core — Architecture & Reasoning System

The Intelligence Core is the reasoning and contextual assistance layer of **KENENISA OS**. It sits above the deterministic domain services and PostgreSQL database, providing context-aware advice across execution, planning, capacity, learning, skills, evidence, reviews, opportunities, and analytics.

---

## Key Principles

1. **AI is an Advisor, Not Truth**: The PostgreSQL database and deterministic business services remain authoritative.
2. **No Direct Database Access**: The AI cannot execute SQL, Prisma, or shell commands directly.
3. **Bounded Context**: Context is deterministically constructed before LLM calls and strictly scoped to `req.auth.userId`.
4. **Action Confirmation Protocol**: Mutations require explicit user consent via `PROPOSE` $\rightarrow$ `CONFIRM` $\rightarrow$ `VALIDATE` $\rightarrow$ `EXECUTE` $\rightarrow$ `VERIFY` $\rightarrow$ `REPORT`.
5. **Provider Abstraction & Fallback**: `AIProvider` interface supports OpenAI-compatible LLMs with automatic fallback to `MockAIProvider` if API key is missing or offline.

---

## Operating Loop

```text
              USER MESSAGE
                   │
                   ▼
         AUTHENTICATION & SCOPING
                   │
                   ▼
       BUILD DETERMINISTIC CONTEXT
                   │
                   ▼
           CALL AI PROVIDER
                   │
                   ▼
        VALIDATE RESPONSE / TOOL
                   │
                   ▼
       PROPOSE ACTION / EXECUTE
                   │
                   ▼
             RETURN TO USER
```
