// Result view. Evidence is the product: every warning card shows the exact
// quoted text/domain that triggered it, visually dominant over the explanation.
//
// `s` is the localized UI string table for the language this result was
// analysed in. Risk-level labels/leads and severity words come from `s`; the
// summary, explanations, and recommended-action text come already-localized
// from the API.

const TONE = {
  safe: "safe",
  suspicious: "suspicious",
  dangerous: "dangerous",
  cannot_determine: "unknown",
};
const ICON = { safe: "✓", suspicious: "!", dangerous: "✕", cannot_determine: "?" };

function ConfidenceDots({ level, label }) {
  const filled = { high: 3, medium: 2, low: 1 }[level] || 0;
  return (
    <span className="confidence" title={`${label}: ${level}`}>
      <span className="confidence-label">{label}</span>
      <span className="dots" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`dot ${i < filled ? "on" : ""}`} />
        ))}
      </span>
      <span className="sr-only">{level}</span>
    </span>
  );
}

export default function RiskResult({ result, onReset, s, lang }) {
  const level = result.risk_level || "cannot_determine";
  const tone = TONE[level] || "unknown";
  const action = result.recommended_action || {};
  const reporting = action.reporting || {};
  const isCD = level === "cannot_determine";
  const hasSignals = result.signals && result.signals.length > 0;

  return (
    <section className={`result tone-${tone}`} aria-live="polite" lang={lang || "en"}>
      {/* Risk banner */}
      <div className="risk-banner">
        <div className="risk-icon" aria-hidden="true">{ICON[level]}</div>
        <div className="risk-headline">
          <div className="risk-label">{s.labels[level]}</div>
          <div className="risk-lead">{s.leads[level]}</div>
        </div>
        <div className="risk-meta">
          {result.risk_score != null && (
            <div className="risk-score">
              <span className="score-num">{result.risk_score}</span>
              <span className="score-den">/100</span>
            </div>
          )}
          <ConfidenceDots level={result.confidence} label={s.confidence} />
        </div>
      </div>

      {result.degraded && (
        <div className="degraded-note" role="note">
          <strong>{s.degradedTitle}</strong> {s.degradedBody}
        </div>
      )}

      {result.summary && <p className="summary">{result.summary}</p>}

      {/* Warning-sign cards — evidence forward */}
      {hasSignals && (
        <div className="signals">
          <h2 className="section-title">
            {isCD ? s.noticedTitle : s.warningsTitle}
          </h2>
          {result.signals.map((sig, i) => (
            <article key={i} className={`signal-card sev-${sig.severity}`}>
              <header className="signal-head">
                <h3 className="signal-title">{sig.title || sig.id}</h3>
                <span className={`badge badge-${sig.severity}`}>
                  {s.severity[sig.severity] || sig.severity}
                </span>
              </header>

              {/* THE EVIDENCE — the whole product thesis. Prominent, monospace,
                  quoted straight from the user's message. */}
              <div className="evidence-block">
                <span className="evidence-label">{s.fromYourMessage}</span>
                <mark className="evidence-mark">{sig.evidence}</mark>
              </div>

              {sig.explanation && (
                <p className="signal-explanation">{sig.explanation}</p>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Recommended action */}
      {action.primary && (
        <div className="action-block">
          <h2 className="section-title">
            {isCD ? s.howToCheck : s.whatToDo}
          </h2>
          <p className="action-primary">{action.primary}</p>
          {action.steps && action.steps.length > 0 && (
            <ul className="action-steps">
              {action.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Reporting handoff */}
      {reporting.helpline && (
        <div className="reporting-block">
          <div className="reporting-text">{reporting.text}</div>
          <div className="reporting-actions">
            <a className="report-btn call" href={`tel:${reporting.helpline}`}>
              📞 {reporting.helpline}
            </a>
            {reporting.url && (
              <a
                className="report-btn visit"
                href={reporting.url}
                target="_blank"
                rel="noreferrer"
              >
                {reporting.url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Links found */}
      {result.extracted_urls && result.extracted_urls.length > 0 && (
        <details className="urls">
          <summary>{s.linksFound} ({result.extracted_urls.length})</summary>
          <ul>
            {result.extracted_urls.map((u, i) => (
              <li key={i} className="url-item">{u}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="result-footer">
        <button className="btn-ghost" type="button" onClick={onReset}>
          {s.checkAnother}
        </button>
        {result.processing_ms != null && (
          <span className="timing">{s.analysedIn} {result.processing_ms} ms</span>
        )}
      </div>
    </section>
  );
}
