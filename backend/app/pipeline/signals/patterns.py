"""Pattern matcher — phrase families, not single keywords.

Each family carries its own severity per detection-approach.md's table. Every
match records the exact substring that triggered it as evidence.

false-positives.md rule enforced here: urgency alone is never enough. The
urgency signal is only emitted when the message also contains a link, a payment
request, or a credential request.

English first (build-plan.md Phase 2). Kannada/Hindi families are added later in
the same structure without changing the detector.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional

from app.pipeline.normalizer import NormalizedInput
from app.schemas import Severity, Signal

from . import brands
from .urlutil import parse_url


@dataclass
class PatternFamily:
    id: str
    severity: Severity
    title: str
    detail: str
    patterns: List[str]  # regex fragments, matched case-insensitively


# Phrase families. Patterns are deliberately phrase-shaped, not bare keywords.
FAMILIES: List[PatternFamily] = [
    PatternFamily(
        id="collect_request_to_receive",
        severity=Severity.high,
        title="Asks you to approve a UPI request or enter PIN to receive money",
        detail=(
            "Your UPI PIN is only ever needed to SEND money. Nothing that pays "
            "you into your account will ask for it. If a request needs your PIN, "
            "it is taking money, not giving it."
        ),
        patterns=[
            r"\b(?:approve|accept|enter\s+(?:your\s+)?(?:upi\s+)?pin|scan\s+(?:the\s+)?(?:qr\s+)?code)\b[^.\n]{0,45}\b(?:to\s+receive|to\s+get|to\s+claim|receive|refund|cashback|prize|credit)\b",
            r"\b(?:to\s+receive|for\s+refund|for\s+cashback|to\s+claim\s+prize|to\s+get\s+credit)\b[^.\n]{0,45}\b(?:approve|accept|enter\s+(?:your\s+)?(?:upi\s+)?pin|scan\s+(?:the\s+)?(?:qr\s+)?code|collect\s+request)\b",
            r"\bcollect\s+request\b[^.\n]{0,35}\b(?:approve|accept|pay|receive)\b",
            r"\benter\s+(?:your\s+)?(?:upi\s+)?pin\b[^.\n]{0,35}\b(?:to\s+receive|to\s+get|for\s+cashback|for\s+refund|to\s+claim)\b",
            r"\bscan\s+(?:this\s+|the\s+)?(?:qr\s+)?code\s+to\s+receive\b",
        ],
    ),
    PatternFamily(
        id="upi_collect_request",
        severity=Severity.high,
        title="Asks you to approve a UPI request to 'receive' money",
        detail=(
            "Your UPI PIN is only ever needed to SEND money. Nothing that pays "
            "you into your account will ask for it. If a request needs your PIN, "
            "it is taking money, not giving it."
        ),
        patterns=[
            r"\b(?:approve|accept|enter\s+(?:your\s+)?(?:upi\s+)?pin)\b[^.\n]{0,40}\b(?:receive|get|credit|collect\s+request)\b",
            r"\bcollect\s+request\b[^.\n]{0,30}\b(?:approve|accept|pay)\b",
            r"\benter\s+(?:your\s+)?(?:upi\s+)?pin\b[^.\n]{0,30}\b(?:to\s+receive|to\s+get|for\s+cashback)\b",
        ],
    ),
    PatternFamily(
        id="upi_pin_requested",
        severity=Severity.high,
        title="Requests UPI PIN, ATM PIN, OTP, CVV, or banking password",
        detail=(
            "The message asks for a UPI PIN, ATM PIN, OTP, CVV, or netbanking password. "
            "No genuine bank or company will ever ask you to share or enter these."
        ),
        patterns=[
            r"\b(?:share|enter|provide|send|verify|confirm)\b[^.\n]{0,30}\b(?:upi\s*pin|atm\s*pin|otp|cvv|password|netbanking\s*password|card\s*number)\b",
            r"\b(?:upi\s*pin|atm\s*pin|otp|cvv|password|netbanking\s*password)\b[^.\n]{0,20}\b(?:share|enter|provide|send|verify|required)\b",
            r"\benter\b[^.\n]{0,20}\b(?:upi\s*pin|atm\s*pin|otp|cvv|password)\b",
        ],
    ),
    PatternFamily(
        id="credential_request",
        severity=Severity.high,
        title="Asks for a secret code or card details",
        detail=(
            "The message asks for a PIN, OTP, CVV, password or full card number. "
            "No genuine bank or company will ever ask you to share these."
        ),
        patterns=[
            r"\b(?:share|enter|provide|send|verify|confirm)\b[^.\n]{0,30}\b(?:otp|pin|cvv|password|card\s*number)\b",
            r"\b(?:otp|pin|cvv|password)\b[^.\n]{0,20}\b(?:share|enter|provide|send|verify)\b",
            r"\benter\b[^.\n]{0,20}\b(?:otp|pin|cvv)\b",
        ],
    ),
    PatternFamily(
        id="refund_reversal_bait",
        severity=Severity.high,
        title="Claims accidental transfer or excess refund asking for money back",
        detail=(
            "The sender claims they sent money by mistake, issued an excess refund, "
            "or made a double payment and asks you to return the difference. "
            "This is a common reversal scam; always check your official bank statement "
            "independently inside your bank app."
        ),
        patterns=[
            r"\b(?:sent|transferred|paid)\b[^.\n]{0,40}\b(?:by\s+mistake|accidentally|wrongly)\b",
            r"\b(?:wrong|accidental|mistaken|excess|double)\s+(?:transfer|transaction|payment|refund|credit)\b[^.\n]{0,40}\b(?:return|send\s*back|pay\s*back|refund)\b",
            r"\b(?:return|send\s*back|pay\s*back|transfer\s*back)\b[^.\n]{0,35}\b(?:the\s+)?(?:excess|extra|money|amount|difference|refund)\b",
            r"\btransferred\s+to\s+your\s+account\s+by\s+mistake\b",
            r"\bby\s+mistake\b[^.\n]{0,35}\b(?:return|send\s*back|pay\s*back|transfer)\b",
        ],
    ),
    PatternFamily(
        id="advance_fee",
        severity=Severity.high,
        title="Asks for a payment upfront",
        detail=(
            "You are asked to pay a registration, processing or security fee "
            "before receiving a job, prize or refund. Legitimate employers and "
            "prizes never require an upfront payment."
        ),
        patterns=[
            r"\b(?:registration|processing|security|refundable|activation|form|enrollment|training)\s+(?:fee|deposit|charge|amount)\b",
            r"\bpay\b[^.\n]{0,30}\b(?:to\s+(?:receive|claim|get|unlock|release)|before)\b",
            r"\b(?:deposit|transfer)\b[^.\n]{0,25}\b(?:to\s+claim|to\s+receive|refundable)\b",
            # "Send Rs 1200 for ID card / training material / joining kit" —
            # advance payment framed as an onboarding cost.
            r"\bsend\s+(?:rs\.?\s*|₹\s*)?\d[\d,]*\b[^.\n]{0,40}\b(?:for|to)\b[^.\n]{0,30}\b(?:id\s+card|training|joining|onboarding|kit|material|processing|loan|delivery|release)\b",
            r"\b(?:loan\s+approval|loan\s+sanction|loan\s+processing|delivery\s+clearance)\s+(?:fee|charge|deposit|amount)\b",
        ],
    ),
    PatternFamily(
        id="guaranteed_returns",
        severity=Severity.high,
        title="Promises guaranteed profit",
        detail=(
            "The message promises fixed or guaranteed returns on an investment. "
            "No real investment can guarantee profit; this is a hallmark of "
            "investment fraud."
        ),
        patterns=[
            r"\b(?:guaranteed|fixed|assured|daily|monthly|weekly|double)\s+(?:returns?|profit|income|money|gains?)\b",
            r"\b(?:100%|guaranteed|assured|zero\s+loss|no\s+risk)\b[^.\n]{0,25}\b(?:profit|returns?|gains?|safe)\b",
            # "fixed 15% monthly returns", "guaranteed listing gains of 200%"
            r"\b(?:fixed|guaranteed|assured)\b[^.\n]{0,20}\d+\s*%[^.\n]{0,20}\b(?:returns?|profit|gains?|monthly|daily|weekly)\b",
            r"\b(?:guaranteed|assured)\s+(?:listing\s+)?gains?\b",
        ],
    ),
    PatternFamily(
        id="unsolicited_prize",
        severity=Severity.medium,
        title="Says you won a prize you did not enter",
        detail=(
            "You are told you won a lottery, lucky draw or cashback you never "
            "entered. This is a common lure to collect a fee or your details."
        ),
        patterns=[
            r"\b(?:you\s+have\s+won|won\s+a|winner\s+of|lucky\s+draw|lottery|lucky\s+winner)\b",
            r"\b(?:congratulations|congrats)\b[^.\n]{0,40}\b(?:won|winner|prize|selected)\b",
            r"\bcashback\b[^.\n]{0,25}\b(?:claim|won|credited)\b",
            r"\bwin\b[^.\n]{0,35}\b(?:1st|first|grand|bumper|cash|mega|special)?\s*prize\b",
            r"\b(?:1st|first|grand|bumper|total)\s+prize\b[^.\n]{0,35}\b(?:rs\.?|inr|₹|\d+\s*(?:lakh|crore|car|suv|bike|gold|iphone))\b",
            r"\btotal\s+prize\b",
            r"\bwin\b[^.\n]{0,25}\b(?:suv|car|bike|motorcycle|gold|iphone|cash|lakh|crore)\b",
            r"\b(?:play\s+and\s+win|register\s+(?:now\s+)?(?:to\s+)?win)\b",
        ],
    ),
    PatternFamily(
        id="gambling_betting_lure",
        severity=Severity.high,
        title="Unsolicited gambling, betting, or rummy tournament lure",
        detail=(
            "The message promotes online rummy, betting, lottery, or gambling tournaments with claims of "
            "massive prizes, cash rewards, or luxury cars. In India, unsolicited gaming invitations frequently "
            "lead to unauthorized betting platforms, aggressive deposit traps, or illegal APK downloads."
        ),
        patterns=[
            r"\b(?:play\s+rummy|rummy\s+tournament|prime\s+time\s+rummy|online\s+rummy|rummy\s*circle|teen\s*patti|aviator\s+game|color\s+prediction|satta\s*matka|online\s+betting|sports\s*betting)\b",
            r"\bjoin\b[^.\n]{0,40}\b(?:rummy|tournament|contest|betting|game)\b[^.\n]{0,40}\b(?:prize|win|lakh|crore|car)\b",
            r"\b(?:register|download|deposit)\s+now\b[^.\n]{0,40}\b(?:bonus|cash|free\s+chips|coins|prize|tournament|rummy)\b",
            r"\b(?:win|earn)\b[^.\n]{0,25}\b(?:rs\.?\s*\d|\d+\s*(?:lakh|crore))\b[^.\n]{0,40}\b(?:rummy|poker|bet|casino|game)\b",
        ],
    ),
    PatternFamily(
        id="authority_impersonation",
        severity=Severity.medium,
        title="Claims to be from a bank or authority",
        detail=(
            "The message claims to be from a bank, the police, income tax or a "
            "courier's customs desk, and pairs that authority with a threat or a "
            "demand. Scammers borrow authority to pressure you."
        ),
        # Self-contained account/KYC threat framing. The broader
        # authority-name + threat co-occurrence is handled in detect() because it
        # legitimately spans sentence boundaries.
        patterns=[
            r"\byour\s+(?:account|kyc|pan|aadhaar|number)\b[^.\n]{0,40}\b(?:blocked|suspended|expired|deactivated|disconnected|frozen)\b",
        ],
    ),
    PatternFamily(
        id="delivery_fee",
        severity=Severity.medium,
        title="Asks for a delivery or customs fee",
        detail=(
            "A supposed courier or customs desk asks you to pay a small fee to "
            "release a parcel. Real couriers collect any charges through their "
            "official app or on delivery, not by a link or UPI request."
        ),
        patterns=[
            r"\b(?:parcel|package|shipment|consignment|delivery)\b[^.\n]{0,40}\b(?:customs|clearance|delivery|shipping|handling)\s+(?:fee|charge|duty)\b",
            r"\b(?:pay|clear)\b[^.\n]{0,30}\b(?:customs|clearance)\s+(?:fee|charge|duty)\b",
            r"\byour\s+(?:parcel|package|order|shipment)\b[^.\n]{0,30}\b(?:on\s+hold|held|pending|stuck)\b",
            # "duty of Rs 1200 is pending", "customs duty pending. Clear it..."
            r"\b(?:customs\s+)?duty\b[^.\n]{0,25}\b(?:pending|due|payable|of\s+(?:rs\.?\s*)?\d)\b",
            r"\b(?:redelivery|re-delivery|shipping|handling|delivery)\s+(?:fee|charge)\b",
            r"\bstuck\s+in\s+customs\b",
        ],
    ),
    PatternFamily(
        id="upi_collect_request",
        severity=Severity.high,
        title="Asks you to approve a UPI request to 'receive' money",
        detail=(
            "You do not need to approve a UPI request or enter your PIN to "
            "receive money. Any request that asks you to enter your UPI PIN is "
            "taking money from you, not sending it."
        ),
        patterns=[
            r"\b(?:approve|accept|enter\s+(?:your\s+)?(?:upi\s+)?pin)\b[^.\n]{0,40}\b(?:receive|get|credit|collect\s+request)\b",
            r"\bcollect\s+request\b[^.\n]{0,30}\b(?:approve|accept|pay)\b",
            r"\benter\s+(?:your\s+)?(?:upi\s+)?pin\b[^.\n]{0,30}\b(?:to\s+receive|to\s+get|for\s+cashback)\b",
        ],
    ),
    PatternFamily(
        id="off_channel_redirect",
        severity=Severity.medium,
        title="Pushes you to WhatsApp or a personal number",
        detail=(
            "A supposed institution asks you to continue on WhatsApp or a "
            "personal number. Real organisations keep you on their official "
            "channels."
        ),
        patterns=[
            r"\b(?:contact|message|reach|call|whatsapp)\s+(?:us\s+)?on\s+whatsapp\b",
            r"\bwhatsapp\b[^.\n]{0,15}\b(?:\+?\d[\d\s\-]{7,})\b",
        ],
    ),
    PatternFamily(
        id="generic_salutation",
        severity=Severity.low,
        title="Greets you generically",
        detail=(
            "The message opens with 'Dear Customer' or similar. A company that "
            "genuinely holds your account usually knows your name."
        ),
        patterns=[
            r"\bdear\s+(?:customer|user|sir/madam|account\s+holder)\b",
        ],
    ),
]

# Urgency family is handled specially: it only counts alongside a link, payment,
# or credential request (false-positives.md).
_URGENCY_PATTERNS = [
    r"\b(?:within|in)\s+\d+\s*(?:hours?|hrs?|minutes?|mins?|days?)\b",
    r"\b(?:immediately|urgent(?:ly)?|right\s+now|today|at\s+once|as\s+soon\s+as\s+possible)\b",
    r"\byour\s+account\s+will\s+be\s+(?:blocked|suspended|closed|deactivated)\b",
    r"\b(?:act\s+now|last\s+chance|expires?\s+(?:today|soon|tomorrow))\b",
]

_PAYMENT_PATTERNS = [
    r"\bupi\b",
    r"\b(?:pay|payment|transfer|deposit|₹|rs\.?\s*\d)\b",
    r"\bcollect\s+request\b",
]

# Authority-impersonation co-occurrence: an authority NAME plus a threat/demand
# anywhere in the message. Handled separately from the phrase families because a
# genuine "PAN-Aadhaar linking successful" names an authority but issues no
# threat, while scams pair the name with a penalty/demand — often in a separate
# sentence, which the windowed family patterns cannot span.
_AUTHORITY_NAME_RE = re.compile(
    r"\b(?:income\s*tax|it\s+department|police|cyber\s*cell|cyber\s*crime|"
    r"customs|enforcement\s+directorate|trai|inspector|court|legal\s+department)\b",
    re.IGNORECASE,
)
_AUTHORITY_THREAT_RE = re.compile(
    r"\b(?:pay|fine|penalty|arrest|warrant|case\s+(?:is\s+)?filed|fir|settlement|"
    r"disconnect(?:ed)?|illegal|seized?|blocked|suspend(?:ed)?|avoid\s+(?:arrest|fir))\b",
    re.IGNORECASE,
)


# Negation cues that flip a request into a warning. "Do not share your OTP" is a
# safety instruction, not a credential request — a genuine bank/app SMS.
_NEGATION_RE = re.compile(
    r"\b(?:do\s*n['o]?t|don't|never|no\s+one\s+will|will\s+never|do\s+not)\b",
    re.IGNORECASE,
)

# Families where a preceding negation should suppress the match (a warning about
# the behaviour rather than a request for it).
_NEGATION_SENSITIVE = {"credential_request", "upi_pin_requested"}


def _first_match(text: str, regexes: List[str]) -> Optional[re.Match]:
    for pat in regexes:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m
    return None


def _is_negated(text: str, match: re.Match, window: int = 30) -> bool:
    """True if a negation cue appears shortly before the matched span."""
    start = max(0, match.start() - window)
    preceding = text[start:match.start()]
    return bool(_NEGATION_RE.search(preceding))



_VPA_RE = re.compile(r"\b([a-zA-Z0-9.\-_]{2,64}@([a-zA-Z0-9]{2,32}))\b", re.IGNORECASE)
_EMAIL_SUFFIXES = {".com", ".org", ".net", ".edu", ".gov", ".io", ".co", ".in"}

def _is_vpa(handle: str) -> bool:
    handle_lower = handle.lower()
    for suff in _EMAIL_SUFFIXES:
        if handle_lower.endswith(suff):
            return False
    if "." in handle_lower:
        return False
    return True

_PAYMENT_INTENT_RE = re.compile(
    r"\b(?:pay|payment|transfer|send|deposit|₹|rs\.?\s*\d|bhim|collect|settle|due|bill|fee|cost)\b",
    re.IGNORECASE
)

def _has_unofficial_link(normalized: NormalizedInput) -> bool:
    """True if any extracted URL is NOT an exact official-domain / is an IP.

    An official-domain link (myntra.com, amazon.in, ...) does not, by itself,
    turn legitimate urgency into a scam cue. An IP literal or any non-allowlisted
    domain does count.
    """
    for raw in normalized.urls:
        parsed = parse_url(raw)
        if parsed.is_ip_literal:
            return True
        if parsed.registered_domain not in brands.OFFICIAL_DOMAINS:
            return True
    return False


def detect(normalized: NormalizedInput) -> List[Signal]:
    text = normalized.text
    signals: List[Signal] = []
    matched_ids: set[str] = set()

    for family in FAMILIES:
        m = _first_match(text, family.patterns)
        if not m:
            continue
        # Suppress negated matches for negation-sensitive families: a message
        # telling you to NOT share your OTP is legitimate advice, not a request.
        if family.id in _NEGATION_SENSITIVE and _is_negated(text, m):
            continue
        signals.append(
            Signal(
                id=family.id,
                severity=family.severity,
                evidence=m.group(0).strip(),
                title=family.title,
                detail=family.detail,
            )
        )
        matched_ids.add(family.id)

    # Authority impersonation via co-occurrence: an authority name + a
    # threat/demand anywhere in the message. Only fires if the family pattern
    # above did not already flag it. Evidence is the authority-name span (the
    # exact substring that names the impersonated authority).
    if "authority_impersonation" not in matched_ids:
        name_m = _AUTHORITY_NAME_RE.search(text)
        if name_m and _AUTHORITY_THREAT_RE.search(text):
            signals.append(
                Signal(
                    id="authority_impersonation",
                    severity=Severity.medium,
                    evidence=name_m.group(0).strip(),
                    title="Claims to be from an authority and threatens you",
                    detail=(
                        "The message claims to be from an authority such as the "
                        "police, income tax, customs or a telecom regulator, and "
                        "pairs that claim with a threat or a demand for money. "
                        "Real agencies do not collect fines or settlements this "
                        "way."
                    ),
                )
            )
            matched_ids.add("authority_impersonation")

    # Urgency: only counts alongside a companion risk — a link to a NON-official
    # domain, a payment/credential request. A promo whose only link points to an
    # official brand domain (e.g. myntra.com) is legitimate urgency, not a scam
    # cue (false-positives.md: real messages are urgent; urgency needs company).
    urgency_match = _first_match(text, _URGENCY_PATTERNS)
    if urgency_match:
        has_unofficial_link = _has_unofficial_link(normalized)
        has_payment = _first_match(text, _PAYMENT_PATTERNS) is not None
        has_credential = "credential_request" in matched_ids
        if has_unofficial_link or has_payment or has_credential:
            signals.append(
                Signal(
                    id="urgency_pressure",
                    severity=Severity.medium,
                    evidence=urgency_match.group(0).strip(),
                    title="Creates a false sense of urgency",
                    detail=(
                        "The message pressures you to act immediately. This is "
                        "deliberate — it is meant to stop you from checking "
                        "whether the message is real."
                    ),
                )
            )

    # 4. Unknown / Personal VPA alongside a payment request:
    if "unknown_vpa_payment" not in matched_ids:
        for vpa_m in _VPA_RE.finditer(text):
            full_vpa = vpa_m.group(1).strip()
            handle_part = vpa_m.group(2).strip()
            if _is_vpa(handle_part) and _PAYMENT_INTENT_RE.search(text):
                signals.append(
                    Signal(
                        id="unknown_vpa_payment",
                        severity=Severity.medium,
                        evidence=full_vpa,
                        title="Personal or unverified UPI ID (VPA) in payment request",
                        detail=(
                            f"The message directs payment to a UPI Virtual Payment Address ({full_vpa}). "
                            "Legitimate organizations use verified merchant payment gateways rather than personal VPAs."
                        ),
                        explanation=(
                            f"The message directs payment to a UPI Virtual Payment Address ({full_vpa}). "
                            "Legitimate organizations use verified merchant payment gateways rather than personal VPAs."
                        ),
                    )
                )
                matched_ids.add("unknown_vpa_payment")
                break

    return signals
