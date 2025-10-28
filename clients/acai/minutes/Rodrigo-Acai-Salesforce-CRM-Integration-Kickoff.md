# Acai CRM Integration Kickoff

**Participants:** Elena Levi (Lead/Product Owner), Rodrigo Medina (Tech), Sergey (Engineer), Camilla (Observer) | **Duration:** ~41 min
**Project Duration:** 5-6 weeks

## Objective

Integrate Acai's AI travel assistant with Front and Salesforce CRM systems.

## Key Decision

**Start with Front (not Salesforce)** — Multiple clients requesting Front vs. one for Salesforce. Front API is simpler, better documented, less bureaucracy.

## How It Works

**Integration Flow:**
1. Case created in Front → Webhook notifies Acai
2. Acai fetches case data via REST API
3. Acai analyzes (GDS lookups, penalties, AI)
4. Acai posts: internal notes, email draft, annotations, platform link

**Example:** Cancellation Request
```text
Traveler: "Can I cancel my flight? How much back?"
→ Acai reads PNR, queries GDS → Non-refundable ticket, €0 refund
→ Outputs: internal note + pre-filled email draft
→ Agent copies draft, sends manually
```

**Features (Phase 1):** Internal notes, penalties/refund summary, email drafts, annotations, platform links, audit trail

**Future (Phase 2):** Direct AI response to traveler, automated sending

## Technical Details

**Architecture:** Connector/adapter that reads CRM case data and writes back AI-generated content.

**Integration Method:**
- **Incoming:** Webhooks notify Acai when new cases arrive
- **Processing:** REST API calls fetch complete case data from CRM
- **Outgoing:** REST API calls post internal notes, email drafts, and custom attributes

**Data Exchanged:**
- **From CRM:** Complete email messages, customer metadata, custom fields, booking references (PNR, OID)
- **To CRM:** AI case summaries, pre-written email responses, agent annotations, compliance audit trail

**Core Requirements:**
- Email-based workflow (not real-time chat)
- All AI recommendations logged in CRM for compliance/audit
- Support for multiple CRM platforms (Front, Salesforce, etc.)
- Access to booking data for travel analysis (GDS integration)

## Action Items

| Owner | Tasks |
|-------|-------|
| **Rodrigo** | Discovery on Front API, technical research, document findings, ready for dev once commercial clears |
| **Elena** | Product requirements, commercial discussion, product support during development |
| **Sergey** | Contractor onboarding (repo, PR workflow, deployment), technical guidance, code review |
| **Camilla** | Product support alongside Elena, onboarding observation, GDS expertise |

## Timeline

| Timeframe | Actions |
|-----------|---------|
| **Today** | Slack setup, GitHub access, product demo |
| **Week 1** | API research, test environments, technical discussions |
| **Week 2** | Commercial discussion, architecture finalized, sprint planning |

## Status & Next Actions

**Commercial:** Needs clarification before development starts (non-blocking for discovery phase)

**Rodrigo's Discovery (In Progress):**
- Created development account in Front
- Reading Front API documentation
- Will document findings and blockers in Slack
- Ready to start development once commercial is clear

**Product & Onboarding:**
- Camilla added as product person alongside Elena
- Sergei starting contractor onboarding process ASAP
- Onboarding scope: repository access, pull request workflow, deployment process

**Development Readiness:**
- Define testing approach (smoke tests, test environment setup)
- Confirm existing test suite to reproduce if available
- Code standards and documentation requirements to be confirmed

## Key Notes

- Same functionality for Front & Salesforce — Front first informs implementation
- Communication: Dedicated Slack channel (async)
- Elena provides comprehensive product docs
- Camilla (new GDS expert) onboarding in progress
- Commercial discussion non-blocking
