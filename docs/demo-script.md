# Demo Script

Assumes a 5-minute slot with questions after. Adjust proportionally if shorter.

**Rule for the whole demo:** every message you paste should be a real one you actually received.
Say so. "This came to my phone last Tuesday" lands differently from a message you clearly wrote for
the slide, and judges can tell the difference.

---

## 0:00 — 0:30 · The problem, in one message

Open with the screen already showing a scam SMS. Don't start with a title slide.

> "My grandmother got this last month. It says her bank account will be blocked today. She almost
> clicked it. The existing tools you can check this with will tell you 'unsafe' — and then stop.
> That doesn't teach her anything, and next month there's a new message."

One sentence of framing, then move. Do not spend a minute on scam statistics.

---

## 0:30 — 1:45 · Core demo: the dangerous case

Paste the bank phishing message. Let it run live.

Walk the output in the order it renders:

- **Risk level** — "Dangerous"
- **Warning signs** — point at each one, and specifically at the quoted evidence. *"Notice it's not
  saying 'suspicious link'. It's showing her the exact domain, and telling her what the real one is."*
- **The domain age line** — "this website was created 6 days ago" is the single most persuasive thing
  on the screen. Pause on it.
- **Recommended action** — including what *not* to do

Then the point of the whole project:

> "Everything on this screen cites something in the message. She can check our reasoning. That's the
> difference between a verdict and an explanation."

---

## 1:45 — 2:30 · The screenshot path

Upload a screenshot of a WhatsApp scam — a fake job offer works well.

> "Most people don't copy text. They screenshot and forward it to a relative. So that's the second
> input we support."

Show the extracted text confirming the OCR read correctly, then the analysis. Keep this segment
short; it's a capability proof, not a second full walkthrough.

---

## 2:30 — 3:15 · The restraint demo *(the one that wins)*

Paste a **real bank message that contains a real link**.

> "This one is genuine. My actual bank sent it, and it has a link in it, and it's a bit urgent.
> A tool that flags everything would call this a scam — and then I'd stop using the tool."

Show it returning Safe, or Cannot Determine with a verification checklist.

> "Knowing when to stay quiet is half of what makes this usable. Most scam detectors are tuned to
> never miss, and they become noise."

This is the segment judges remember, because nobody else will run it.

---

## 3:15 — 3:45 · Regional language (Kannada, Hindi, Telugu)

Toggle the same result into Kannada, Hindi, or Telugu.

> "The people most exposed to these scams are often the ones least served by English-only security
> tools. The explanation is the product, so the explanation has to be in a language you actually
> think in."

Do not re-read the whole output. Toggle between Kannada, Hindi, and Telugu, let them see it, move on.

---

## 3:45 — 4:30 · The numbers

One slide:

```
100 messages · 50 scams, 50 legitimate

Detection rate            87%
False positive rate        6%
Dangerous-tier precision  93%
```

> "We built an evaluation set instead of guessing. Half of it is legitimate messages, deliberately —
> including hard ones like real bank alerts with links. If we'd only tested on scams, a tool that
> flags everything would score 100%."

Then volunteer the limitation before anyone asks:

> "It's 100 messages, hand-collected. It's indicative, not a benchmark."

---

## 4:30 — 5:00 · Close

> "Right now it handles pasted text and screenshots. Next is QR codes and a WhatsApp bot, because
> that's where these messages actually arrive. But the core idea doesn't change: don't just tell
> people it's a scam. Show them why, so they can spot the next one without us."

End on the tagline slide: *Before you Click, Pay, Share, or Trust.*

---

## Preparation checklist

- [ ] All demo messages saved in a text file, ready to paste — never type live
- [ ] Screenshot file on the desktop, not buried in a folder
- [ ] Every demo message pre-run that morning to confirm output
- [ ] Personal details in demo messages sanitized
- [ ] Phone hotspot ready as wifi backup
- [ ] Degraded mode tested — know what the demo looks like with no network
- [ ] Kannada output checked by a native reader on the team
- [ ] Numbers slide matches your latest evaluation run
- [ ] Laptop charged, notifications off, browser zoom set for projector visibility

---

## Anticipated questions

**"How is this different from Google Safe Browsing?"**
Safe Browsing checks whether a URL is on a blocklist. We analyse the whole message, and explain the
reasoning. Blocklists also lag — a domain registered six days ago usually isn't on one yet, which is
exactly the window scams operate in.

**"What if the model is wrong?"**
The model can escalate a risk level but cannot lower one set by the deterministic rules. A
hallucinated "this is fine" is the failure mode we most need to prevent, so we made it structurally
impossible.

**"Can't a scammer just avoid your patterns?"**
Yes, for the pattern layer. The domain checks are harder to evade — a scam needs a link, and a fresh
lookalike domain is expensive to avoid. And we're honest about the ceiling: sophisticated targeted
fraud with an aged domain will get past us.

**"How do you make money?"**
We haven't tried to. It's consumer safety infrastructure. The plausible paths are a bank or telecom
licensing it, or a public-interest deployment. We'd rather answer that honestly than invent a
business model.

**"What data do you store?"**
Nothing. People paste bank messages into this. Content is processed in memory and discarded.
