# Problem Statement — AI-Powered Digital Safety Co-pilot

**Team Hayagreeva** · Satvik Pandurangi, Prateek Deshpande
YUKTIMANTHAN 2.0 Hackathon

---

## 1. The problem

Digital fraud in India has moved faster than public awareness of it. Phishing links, fake KYC
updates, impersonated bank messages, fraudulent job offers, investment schemes, and UPI collect
requests arrive daily over SMS, WhatsApp, email, and social platforms.

The victims are rarely careless. They are usually people without the technical vocabulary to
evaluate a message — someone who cannot tell that `sbi-rewards.in` is not the State Bank of India,
or that a "verified" recruiter asking for a registration fee is a known pattern.

Existing tools return a binary verdict. A user who is told "unsafe" and nothing else learns nothing,
and gains no ability to evaluate the next message. A user who is told "safe" incorrectly is worse
off than before, because the tool has lent its authority to a scam.

**The gap is explanation, not detection.**

## 2. Proposed solution

A web-based Digital Safety Co-pilot. The user pastes suspicious text or uploads a screenshot. The
system returns a structured, evidence-backed assessment in language a non-technical user can act on.

Output structure:

1. **Risk level** — Safe / Suspicious / Dangerous / Cannot Determine
2. **Detected warning signs** — the specific things found, quoted from the content
3. **Explanation** — why each sign matters, in plain language
4. **Recommended action** — what to do, and what not to do

## 3. Worked example

**Input:**
> Dear customer, your SBI account will be blocked today. Complete KYC immediately:
> http://sbi-kyc-verify.online/update

**Output:**

- **Risk: Dangerous**
- **Warning signs found:**
  - The link domain `sbi-kyc-verify.online` is not an official SBI domain (official: `onlinesbi.sbi`)
  - The domain was registered 6 days ago
  - Message creates artificial urgency ("today", "immediately")
  - Addresses you as "Dear customer" — your bank knows your name
- **Why this matters:** Real banks never ask you to complete KYC through a link in an SMS. Scammers
  register lookalike domains that contain the bank's name to appear official. The urgency is designed
  to stop you from checking.
- **What to do:** Do not open the link. If you're unsure about your account, call the number printed
  on your debit card or visit your branch. You can report this message to 1930 or at cybercrime.gov.in.

## 4. Key innovation

Three things distinguish this from a classifier with a user interface:

**Evidence over verdict.** Every risk assessment cites specific, quoted elements of the submitted
content. The user can verify our reasoning rather than trusting it.

**An honest uncertainty tier.** Most tools force every input into safe or unsafe. Legitimate banks
do send links; legitimate recruiters do email about jobs. When signals conflict, we say so and give
the user a manual verification path instead of guessing. See [`false-positives.md`](false-positives.md).

**Regional language output.** The population most exposed to these scams is often least served by
English-only security tooling. Explanations are delivered in Kannada and Hindi alongside English.

## 5. Expected impact

Users gain the ability to:

- Recognise the structural patterns of a scam, not just the instance in front of them
- Avoid malicious links and fraudulent payment requests before acting
- Identify impersonation of banks, government bodies, and employers
- Distinguish legitimate opportunities from fee-advance job and investment fraud
- Reach the right reporting channel when they encounter fraud

Secondary impact: every checked message is a teaching moment. A user who understands *why* a
lookalike domain is dangerous does not need us for the next one.

## 6. Hackathon objective

Ship a working prototype covering the full path: submission → analysis → risk scoring →
evidence-backed explanation → recommended action → reporting handoff.

Scope is deliberately narrowed to text and screenshot input. Measured accuracy on a hand-built
evaluation set will be presented as part of the demo — see [`evaluation.md`](evaluation.md).

## 7. Limitations we acknowledge

- We cannot verify claims that require access to the user's actual account or transaction history
- Novel scam patterns not represented in our signal rules depend entirely on the language model's
  judgment, which is less reliable than deterministic checks
- Domain reputation data has coverage gaps, particularly for very new or very obscure sites
- The system is an advisory aid, not an authority. It is designed to slow a user down and give them
  reasons, not to make the decision for them.
