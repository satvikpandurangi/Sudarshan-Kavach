# API Specification

Base URL: `/api/v1`

No authentication in the MVP. No submission is persisted.

---

## `POST /analyze`

Analyze pasted text content.

### Request

```json
{
  "content": "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update",
  "language": "en"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `content` | string | yes | 1–5000 characters |
| `language` | string | no | `en` \| `kn` \| `hi`. Default `en`. Controls output language only |

### Response — `200`

```json
{
  "risk_level": "dangerous",
  "risk_score": 88,
  "confidence": "high",
  "signals": [
    {
      "id": "lookalike_domain",
      "severity": "high",
      "evidence": "sbi-kyc-verify.online",
      "title": "Link is not an official SBI address",
      "explanation": "This web address contains 'sbi' but it is not owned by State Bank of India. The bank's real address is onlinesbi.sbi. Scammers register addresses containing a bank's name so the link looks official at a glance."
    },
    {
      "id": "new_domain",
      "severity": "high",
      "evidence": "sbi-kyc-verify.online",
      "title": "This website was created 6 days ago",
      "explanation": "Real bank websites have existed for years. Sites created days ago are usually built for a single fraud campaign and taken down soon after."
    },
    {
      "id": "urgency_pressure",
      "severity": "medium",
      "evidence": "will be blocked today",
      "explanation": "The message pressures you to act immediately. This is deliberate — it is meant to stop you from checking whether the message is real."
    }
  ],
  "summary": "This message pretends to be from SBI and sends you to a fake website created less than a week ago. Opening the link and entering your details would give your banking credentials to a scammer.",
  "recommended_action": {
    "primary": "Do not open the link and do not enter any details.",
    "steps": [
      "Delete the message",
      "If you are worried about your account, call the number printed on your debit card",
      "Never complete KYC through a link received by SMS"
    ],
    "reporting": {
      "helpline": "1930",
      "url": "https://cybercrime.gov.in",
      "text": "You can report this to the national cybercrime helpline on 1930."
    }
  },
  "extracted_urls": ["http://sbi-kyc-verify.online/update"],
  "processing_ms": 2140
}
```

### Field reference

| Field | Values / notes |
|---|---|
| `risk_level` | `safe` \| `suspicious` \| `dangerous` \| `cannot_determine` |
| `risk_score` | 0–100. Display aid only — `risk_level` is the authoritative field |
| `confidence` | `high` \| `medium` \| `low`. Low always implies `cannot_determine` |
| `signals[].severity` | `low` \| `medium` \| `high` |
| `signals[].evidence` | **Always** an exact substring of the submitted content. Never paraphrased |
| `signals[].title` | Short heading for the UI. Optional |
| `summary` | Two to three sentences, non-technical |

### `cannot_determine` responses

`signals` may be empty. `recommended_action.steps` carries the manual verification checklist instead:

```json
{
  "risk_level": "cannot_determine",
  "risk_score": null,
  "confidence": "low",
  "signals": [],
  "summary": "We could not find clear warning signs, but we also could not confirm this message is genuine. The company mentioned is not one we can verify.",
  "recommended_action": {
    "primary": "Verify independently before acting.",
    "steps": [
      "Do not use any phone number or link inside this message",
      "Search for the company's official website yourself",
      "Contact them using details from that website only"
    ],
    "reporting": { "helpline": "1930", "url": "https://cybercrime.gov.in" }
  }
}
```

---

## `POST /analyze/image`

Screenshot upload. `multipart/form-data`.

| Field | Type | Required |
|---|---|---|
| `file` | image (png, jpg, webp), max 5 MB | yes |
| `language` | string | no |

Response is identical to `/analyze`, with two additions:

```json
{
  "extracted_text": "Dear customer, your SBI account...",
  "ocr_confidence": 0.94
}
```

`ocr_confidence` below 0.6 forces `risk_level: "cannot_determine"` — analysing garbled text and
returning a confident verdict is worse than admitting the read failed. The UI shows `extracted_text`
so the user can confirm we read their screenshot correctly.

---

## Errors

```json
{ "error": { "code": "content_too_long", "message": "Content must be under 5000 characters." } }
```

| Code | Status | Cause |
|---|---|---|
| `content_empty` | 400 | Empty or whitespace-only |
| `content_too_long` | 400 | Over 5000 characters |
| `unsupported_file_type` | 400 | Not a supported image |
| `file_too_large` | 413 | Over 5 MB |
| `ocr_failed` | 422 | No text extracted |
| `analysis_unavailable` | 503 | Reasoning layer unreachable — see degraded mode |
| `rate_limited` | 429 | Over 20 requests/minute per IP |

### Degraded mode

If the reasoning layer is unavailable, return `200` with signal-layer results only and a flag:

```json
{ "degraded": true, "risk_level": "suspicious", "signals": [ ... ], "summary": null }
```

The UI renders signal titles without the generated explanations. Partial output beats an error page,
and this is the path that saves the demo when venue wifi dies.

---

## `GET /health`

```json
{ "status": "ok", "reasoning_layer": "ok", "ocr": "ok" }
```
