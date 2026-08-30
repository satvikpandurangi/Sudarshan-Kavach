# Evaluation

## Why bother during a hackathon

"Our AI detects scams" invites one question from any judge who has built something similar: *how
accurately?* Teams that answer with a number are in a different conversation from teams that answer
with a shrug.

The build cost is a few hours of collecting messages. The return is a slide that most competing
teams will not have.

---

## The dataset

**Target: 100 messages, split 50 / 50.**

The even split is the important design choice. A set that's 90% scams lets a tool that flags
everything score 90%. Half the value of this system is knowing when to stay quiet, so half the test
set must be messages where staying quiet is correct.

### Scam half (50)

Sources, in order of preference:

1. Messages the team, family, and friends have actually received — most representative, and you can
   verify they're real
2. Publicly documented Indian scam campaigns (RBI advisories, bank fraud-awareness pages, news
   coverage of specific campaigns)
3. Crowd-sourced from classmates — a WhatsApp ask to your batch will produce dozens in a day

Target composition:

| Category | Count |
|---|---|
| Bank / KYC phishing | 12 |
| Fake job offers with advance fee | 8 |
| Investment / guaranteed-returns fraud | 8 |
| Delivery / customs fee scams | 6 |
| Prize, lottery, cashback | 6 |
| UPI collect-request fraud | 5 |
| Impersonation (police, tax, relative in trouble) | 5 |

### Legitimate half (50)

Deliberately include the hard cases — real messages that *look* alarming:

| Category | Count |
|---|---|
| Real bank transaction alerts | 10 |
| Real bank messages containing links | 8 |
| Genuine OTP messages | 6 |
| Real delivery notifications with tracking links | 6 |
| Legitimate recruiter outreach | 6 |
| Real promotional messages with urgency | 6 |
| Government / utility notifications | 5 |
| Genuine payment reminders | 3 |

**Sanitize everything.** Strip real account numbers, names, phone numbers, and amounts before the set
goes anywhere near a repo or a slide. Replace with obvious placeholders.

---

## Metrics

### Primary

**Detection rate** — of the 50 scams, what fraction were flagged Suspicious or Dangerous?

**False positive rate** — of the 50 legitimate messages, what fraction were flagged Suspicious or
Dangerous?

Report both together, always. Either alone is misleading.

### Secondary

**Dangerous-tier precision** — of everything marked Dangerous, what fraction really was? This tier
carries the strongest instruction ("do not act"), so it needs the highest bar.

**Cannot Determine rate** — how often we punt. Healthy is roughly 10–20%. Near zero means the tier
isn't working; above 30% means the system isn't useful.

**Explanation groundedness** — sample 20 outputs by hand. For each warning sign, does the quoted
evidence actually appear in the input? This directly tests our core claim. Any fabricated evidence
is a serious bug, not a rounding error.

---

## Targets

| Metric | Target | Stretch |
|---|---|---|
| Detection rate | ≥ 85% | ≥ 92% |
| False positive rate | ≤ 10% | ≤ 5% |
| Dangerous-tier precision | ≥ 90% | ≥ 95% |
| Cannot Determine rate | 10–20% | — |
| Explanation groundedness | 100% | — |

Groundedness has no stretch target because anything below 100% means the system fabricates evidence,
and that isn't a tuning issue.

---

## Running it

Keep the set as a CSV: `id, text, true_label, category, source`.

A script that runs all 100 through the API and writes a results CSV takes under an hour to write and
lets you re-measure after every tuning change. Build it early — it turns "does this rule change help?"
from an argument into a number.

Re-run before the demo. Put the final figures on the slide with the sample size next to them:
*"87% detection, 6% false positives, n=100."* The sample size shown unprompted reads as honest, and
judges notice.

---

## Presenting honestly

Say the limitations before you're asked:

- 100 messages is a small sample; treat figures as indicative
- The set is hand-collected and skews toward scams we could find, which are common ones
- It's a point-in-time measurement against current campaigns

Volunteering this is more persuasive than being caught by it. A team that knows the weaknesses of
its own evaluation looks like a team that understands what it built.
