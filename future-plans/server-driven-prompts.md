# Server-Driven Prompts

Push prompts (rate us, surveys, announcements, changelogs) from the server to extensions through the SDK — giving developers a direct communication channel with their users without shipping extension updates.

## Why this matters

Extension developers have no way to reach users after install. App stores show ratings but don't let you ask for them at the right moment. Email requires users to provide it. This feature turns the analytics SDK into a two-way channel: events flow up, prompts flow down.

## How it works

### Piggyback delivery

No extra network requests. When the SDK sends any event (`track`, `trackOpen`, lifecycle events), the API response includes pending prompts for that install. The SDK already talks to the server — we just enrich the response.

```
SDK: POST /v1/events { eventName: "open", installId: "abc" }
API: { ok: true, eventId: "...", prompts: [{ id: "p1", type: "rate_us", payload: { ... } }] }
```

### SDK integration

The extension registers a callback during init. The SDK passes prompt data — the extension decides how to render it.

```ts
import { init } from "@zuka98/zanalytics-sdk";

await init({
  productKey: "pigment",
  version: "1.2.0",
  apiUrl: "https://api.example.com",
  onPrompt: (prompt) => {
    // prompt: { id, type, payload, dismissable }
    if (prompt.type === "rate_us") showRatingDialog(prompt);
    if (prompt.type === "announcement") showBanner(prompt);
  },
});
```

### Prompt lifecycle

1. **Create** — admin panel or API: define prompt type, payload, targeting rules
2. **Match** — API checks targeting criteria when an install sends an event
3. **Deliver** — prompt included in event response, SDK fires `onPrompt`
4. **Acknowledge** — SDK calls `POST /v1/prompts/:id/ack` with the outcome (dismissed, completed, rated 4/5, etc.)
5. **Done** — prompt marked as delivered for that install, never sent again

## Prompt types

| Type | Payload | User response |
|------|---------|---------------|
| `rate_us` | title, message, storeUrl | rating (1-5), dismissed |
| `survey` | title, questions[] | answers, dismissed |
| `announcement` | title, body, ctaUrl, ctaLabel | clicked, dismissed |
| `changelog` | title, version, changes[] | viewed, dismissed |
| `custom` | arbitrary JSON | arbitrary JSON |

## Targeting

Prompts can target installs based on:

- **Product** — which extension
- **Version** — specific version or range (e.g., `>=1.2.0`)
- **Install age** — active for at least N days (don't ask for ratings on day 1)
- **Event count** — users who have triggered N+ events (engaged users)
- **Status** — only active installs
- **OS / browser** — platform-specific announcements
- **Percentage** — roll out to X% of matching installs (A/B testing)

## Database changes

### `prompts` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| productId | uuid | FK to products |
| type | text | rate_us, survey, announcement, changelog, custom |
| payload | jsonb | Type-specific content |
| targeting | jsonb | Rules (minAge, minEvents, versions, os, percentage) |
| status | text | draft, active, paused, archived |
| priority | int | Higher = delivered first |
| maxDeliveries | int | Cap total deliveries (null = unlimited) |
| startsAt | timestamp | Go live date |
| expiresAt | timestamp | Auto-archive date |
| createdAt | timestamp | |

### `prompt_deliveries` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| promptId | uuid | FK to prompts |
| installId | uuid | Which install received it |
| deliveredAt | timestamp | When it was sent |
| outcome | text | pending, dismissed, completed, clicked |
| response | jsonb | User's response data (rating, answers, etc.) |
| acknowledgedAt | timestamp | When user acted |

## API changes

### New endpoints

- `GET /v1/prompts` — list prompts for a product (admin)
- `POST /v1/prompts` — create a prompt (admin)
- `PATCH /v1/prompts/:id` — update prompt (admin)
- `DELETE /v1/prompts/:id` — archive prompt (admin)
- `POST /v1/prompts/:id/ack` — SDK acknowledges delivery with outcome

### Modified endpoints

- `POST /v1/events` — response gains `prompts` array with pending prompts for the install

## SDK changes

- `InitOptions` gains optional `onPrompt: (prompt: Prompt) => void` callback
- `track()` and lifecycle functions check the response for prompts and fire the callback
- New `acknowledgePrompt(id, outcome, response?)` exported function
- No UI in the SDK — extensions own rendering entirely

## Admin panel

- Prompts page: list, create, pause/resume, archive
- Prompt detail: delivery stats, outcome breakdown (% rated, % dismissed)
- Prompt builder: form with type selection, payload editor, targeting rules, scheduling

## Considerations

- **Rate limiting prompts**: max 1 prompt per session to avoid annoying users
- **Cooldown**: don't prompt the same install more than once per N days regardless of prompt type
- **Priority queue**: if multiple prompts match, deliver highest priority first
- **Offline**: SDK should not cache/retry prompts — if the user isn't online when the prompt matches, they'll get it next time
- **Privacy**: prompts are matched server-side using installId (anonymous), no PII involved
- **Graceful degradation**: if `onPrompt` isn't registered, prompts are silently ignored — existing SDK users aren't affected
