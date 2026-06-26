# S.A.G.E. Memory Plan

S.A.G.E. memory is not active yet. The first implementation must be scoped, inspectable, editable, and deletable.

## Data Model

```js
sageMemoryProfile = {
  userId,
  accountPreferences: {},
  defaultEntityId: null,
  sagePersonaId: null,
  tourProgress: {},
  providerPreferences: {},
  permissions: {},
  createdAt,
  updatedAt,
}

sageTaskMemory = {
  id,
  userId,
  entityId,
  taskType,
  summary,
  draftRefs: [],
  status,
  retentionClass,
  createdAt,
  updatedAt,
  expiresAt,
}

sageAutomationEvent = {
  id,
  userId,
  automationId,
  action,
  approvalState,
  resultSummary,
  providerCost,
  createdAt,
}
```

## Categories

- account preferences;
- default Entity;
- user's S.A.G.E. persona;
- bounded summaries of prior tasks;
- content draft references;
- tour progress;
- provider status and preferences, never secrets;
- action permissions and revoked grants;
- automation approvals, results, and cost;
- safety boundaries and account policy flags.

## Rules

1. No silent long-term memory.
2. Show what will be saved before first use.
3. Separate required account state from optional personalization.
4. Never store API keys, payment data, raw passwords, or private provider payloads.
5. Sensitive actions require fresh approval even when a preference exists.
6. Summarize prior work; do not retain recordings by default.
7. Provide per-item delete, category reset, export, and account deletion.
8. Apply retention periods to task and automation history.
9. Do not train on private memory without separate explicit consent.
10. Log memory reads and writes that affect an action.

## Storage

Use Supabase tables with Row Level Security by `user_id`. Provider credentials stay in server environment variables or a dedicated encrypted secrets service.

Local development may use namespaced device-only records but may not present them as durable cloud memory.

## Retrieval

Use deterministic fields first. Add semantic retrieval only after users can inspect indexed content, embeddings are server-side, records have strict RLS, retrieval is scoped by user and Entity, deletion reaches the vector index, and prompt-injection defenses are tested.

## Rollout

1. Preferences, default Entity, and tour progress.
2. Draft references and task summaries.
3. Permission ledger and automation history.
4. Optional semantic retrieval for approved records.
5. Cross-device personalization after privacy review.

## Not Allowed Initially

- unrestricted transcript retention;
- autonomous action based on old consent;
- background microphone memory;
- provider secrets in user records;
- inferred sensitive traits;
- cross-user memory without explicit collaboration controls.
