# S.A.G.E. Agentic Roadmap

S.A.G.E. is the user-approved operating assistant inside STATIC, not an unsupervised bot.

1. **On-site assistant:** Route navigation, feature explanations, local prefills, guided tour, active Entity awareness, and auditable confirmations.
2. **LLM understanding:** Optional OpenAI-backed language interpretation through `sage-agent`, with a local rule-based fallback and explicit paid-call approval.
3. **STATIC workflows:** User-approved creation, scheduling, and publishing inside STATIC.
4. **Provider actions:** Scoped adapters for image, voice, video, storage, and live systems with per-action permissions.
5. **Secure web tools:** Browser navigation only through a purpose-built service with domain allowlists, previews, and human approval.
6. **Publishing automations:** OAuth-connected external accounts, draft review, rate limits, and final publish confirmation.
7. **Live conversation:** Higher-quality voice, interruption handling, low-latency responses, and optional privacy-preserving wake phrase.
8. **Memory and routines:** User-owned preferences and reusable workflows with inspect, edit, export, and delete controls.

## Non-negotiable permissions

- Users connect external accounts explicitly through OAuth where possible.
- STATIC never asks S.A.G.E. to store passwords.
- Posting, publishing, spending, uploads, deletion, external requests, account changes, and going live require confirmation.
- Every action has an audit trail and permissions can be revoked.
- Automation is rate-limited and must follow provider and platform terms.
- Open-ended internet automation is not active in the current build.

