# False Positives and the Uncertainty Tier

## The problem nobody demos

Scam detection demos always show scams. The failure that actually kills the product is the opposite
case: the tool flagging a real message from a real bank.

Legitimate institutions genuinely do:

- send SMS containing links
- create urgency ("your payment is due tomorrow")
- ask you to verify identity
- use short domains you don't recognise (`sbi.co.in` vs `onlinesbi.sbi`)
- message from short codes and unfamiliar sender IDs

If the co-pilot cries wolf on three legitimate messages, the user stops opening it. The tool's
lifetime usefulness is bounded by how few times it embarrasses itself on real mail.

---

## The four-tier design

Most tools use two tiers. We use four, and the third one is the interesting one.

| Tier | Meaning | User is told |
|---|---|---|
| **Safe** | No warning signs found | Nothing alarming here. Normal caution still applies |
| **Suspicious** | Real warning signs, but not conclusive | Here's what looks off. Verify before acting |
| **Dangerous** | Multiple strong indicators | Do not act. Here's exactly why |
| **Cannot Determine** | Signals conflict or data is missing | We can't tell. Here's how to check for yourself |

**Cannot Determine is a feature, not a cop-out.** A tool that admits the limits of what it knows is
more trustworthy than one that guesses confidently. It's also honest engineering: our brand allowlist
is finite, WHOIS data has holes, and a message about a company we've never heard of genuinely is
undecidable from content alone.

---

## When Cannot Determine fires

- Domain is unknown to the allowlist and no other signal fires either way
- Domain-age lookup fails or returns nothing
- Signals conflict — e.g. legitimate registered domain with old registration, but strong urgency and
  a credential request
- OCR confidence is low enough that we may be analysing garbled text
- Message is too short to carry meaningful signal ("Click here" and nothing else)
- Content is in a language our pattern sets don't cover

---

## What Cannot Determine actually returns

This tier must not be a dead end. The user came with a question and deserves a path forward. The
output is a **manual verification checklist**, adapted to what the message claims to be:

**If it claims to be your bank**
- Do not use any number or link in the message
- Call the number printed on your debit card or passbook
- Or open your bank's official app directly and check for notifications there

**If it claims to be a job offer**
- Search the company name plus "reviews" and "scam"
- Check whether the recruiter's email domain matches the company's real website
- Note: legitimate employers never ask you to pay for a job

**If it claims to be a delivery or customs notice**
- Check the courier's official site or app using your order number
- Real couriers do not collect fees by UPI or personal payment link

**If it involves a payment request**
- Confirm with the person on a channel you already trust — call them, don't reply
- UPI does not require you to enter your PIN to *receive* money. If something asks for your PIN to
  receive a payment, it is taking money, not sending it.

**Always available**
- Report suspected fraud to 1930 or at cybercrime.gov.in

---

## Reducing false positives in the signal layer

- **Severity is tiered, not binary.** A `.online` TLD alone is medium. Alone, it never reaches
  Dangerous.
- **High severity requires combination.** Dangerous needs two independent high signals — a single
  aggressive rule can't push a legitimate message to the top tier.
- **Known-good domains short-circuit.** A URL matching an official allowlist domain exactly
  suppresses TLD, subdomain, and shortener signals for that URL.
- **Urgency alone is never enough.** Real messages are urgent. Urgency only counts alongside a link,
  a payment request, or a credential request.

---

## Testing for it

The evaluation set is 50% legitimate messages, not 10%. Details in [`evaluation.md`](evaluation.md).
False positive rate is reported alongside detection rate on the demo slide — reporting only detection
rate is how a tool that flags everything scores 100%.

Target: **false positive rate under 10%** on the legitimate half of the evaluation set.

---

## One case to demo live

During judging, deliberately submit a **real bank SMS** — one an actual bank sent, containing a link.
Show the tool handling it correctly rather than panicking.

Most teams will only demo scams. Demonstrating restraint is more memorable than demonstrating
detection, and it's the thing a judge who has built something similar will be looking for.
