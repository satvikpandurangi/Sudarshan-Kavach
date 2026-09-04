# Scope

## The scoping principle

The original proposal listed eight input types: SMS, WhatsApp, email, screenshots, URLs, QR codes,
documents, and job/investment communications. Built in a hackathon window, that produces eight
shallow features. A judge who tries the QR scanner and finds it half-working will discount the whole
demo, including the parts that work well.

We build two input paths properly and present the rest as a roadmap. Depth demos better than breadth.

---

## In scope (MVP)

### Input
- **Pasted text** — any message body: SMS, WhatsApp, email, social DM. The single most common case.
- **Screenshot upload** — image → OCR → same text pipeline. Covers users who forward screenshots
  rather than copy text, which is the dominant behaviour among the users we're targeting.

Both paths converge on the same analysis engine after extraction. This is why they're the right pair:
the second costs an OCR call and reuses everything else.

### Analysis
- URL extraction from message text
- Domain inspection: lookalike detection against a known-brand list, domain age, TLD risk, IP-literal
  and URL-shortener detection
- Pattern signals: urgency language, credential requests, payment/fee-advance requests, prize claims,
  authority impersonation, contact-channel mismatch
- Language model reasoning over the content plus the collected signals

### Output
- Four-tier risk level including an explicit **Cannot Determine** tier
- Quoted evidence for every warning sign raised
- Plain-language explanation per sign
- Recommended action, including what *not* to do
- Reporting handoff: 1930 helpline and cybercrime.gov.in
- Language toggle: English, Hindi, Kannada, Telugu

### Non-functional
- Under 1–2 seconds end to end for text input (Groq inference ~700ms)
- Mobile-first layout
- Zero data retention: no stored submissions or user tracking

---

## Explicitly out of scope

| Cut | Reason |
|---|---|
| QR code decoding | Adds a scan/decode surface for marginal gain — a QR resolves to a URL we already handle if the user pastes it |
| PDF / document analysis | Different extraction pipeline, low frequency in the target scam set |
| Browser extension | Separate build, separate review process, no demo advantage |
| Voice input | Nice for accessibility, but a whole speech pipeline |
| Live threat feeds | API keys, rate limits, and dependency risk during a live demo |
| User accounts and history | Zero demo value; adds auth surface and privacy obligations |
| Sender phone number reputation | No reliable free data source for Indian numbers |
| Automated report filing | Legal and abuse concerns — we hand off, we don't file on the user's behalf |

---

## Roadmap (post-hackathon)

**Near term**
- QR code decoding, reusing the existing URL inspection path
- Two more regional languages (Telugu, Marathi)
- Shareable result cards, so a user can forward the explanation to the family member who received
  the message

**Medium term**
- Browser extension for inline link checking
- WhatsApp bot — meets users in the app where scams actually arrive
- Anonymised pattern aggregation to detect emerging campaigns

**Long term**
- Partnership with a bank or telecom for an authoritative domain allowlist
- Public API for other consumer apps

---

## Definition of done for the hackathon

The prototype is demo-ready when:

- [ ] Both input paths work end to end without manual intervention
- [ ] All four risk tiers can be triggered by real examples we can show live
- [ ] Every warning sign in the output quotes the specific content that triggered it
- [ ] Kannada and Hindi output verified by a native reader on the team
- [ ] Evaluation set of 100 messages run, accuracy figure on a slide
- [ ] At least one deliberate false-positive case handled correctly by the Cannot Determine tier
- [ ] Works offline-of-our-laptop: hosted, or a local fallback if venue wifi fails
