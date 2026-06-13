# Provider adapters

This directory is reserved for future server-backed provider integrations.

Rules:

- Never commit API keys, secrets, private endpoints, or service credentials.
- Do not call paid generation providers directly from browser code.
- Put vendor-specific behavior behind a narrow adapter interface.
- Validate authentication, authorization, rate limits, cost limits, moderation,
  and ownership rules before sending a request to any provider.
- Keep preview interfaces honest when an adapter is not configured.

Potential future adapters include generation, authentication, database, object
storage, payments, analytics, email, search, recommendations, and moderation.
