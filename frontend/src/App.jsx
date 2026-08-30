import { useState } from "react";
import { analyze, analyzeImage } from "./api.js";
import { t } from "./strings.js";
import RiskResult from "./RiskResult.jsx";
import Loading from "./Loading.jsx";
import ScreenshotConfirm from "./ScreenshotConfirm.jsx";

const SAMPLE =
  "Dear customer, your SBI account will be blocked today. Complete KYC immediately: http://sbi-kyc-verify.online/update";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिन्दी" },
];

const MAX_CHARS = 5000;

export default function App() {
  const [mode, setMode] = useState("text"); // "text" | "image"
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);
  // The language the current result was analysed in — the result view uses this
  // so it stays consistent even if the user changes the dropdown afterwards.
  const [resultLang, setResultLang] = useState("en");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageName, setImageName] = useState(null);

  const s = t(language); // strings for the input UI (current selection)

  function reset() {
    setResult(null);
    setError(null);
    setImageName(null);
  }

  async function onAnalyzeText() {
    setError(null);
    setResult(null);
    if (!content.trim()) {
      setError(s.pasteFirst);
      return;
    }
    setLoading(true);
    try {
      const data = await analyze(content, language);
      setResultLang(language);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onImageSelected(file) {
    setError(null);
    setResult(null);
    setImageName(file.name);
    setLoading(true);
    try {
      const data = await analyzeImage(file, language);
      setResultLang(language);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const showInput = !result && !loading;

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">🛡️</span>
          <span className="brand-name">Digital Safety Co-pilot</span>
        </div>
        <p className="brand-tagline">{s.tagline}</p>
      </header>

      <main className="content">
        {showInput && (
          <>
            <p className="intro">{s.intro}</p>

            <div className="mode-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={mode === "text"}
                className={`mode-tab ${mode === "text" ? "active" : ""}`}
                onClick={() => { setMode("text"); setError(null); }}
              >
                {s.tabText}
              </button>
              <button
                role="tab"
                aria-selected={mode === "image"}
                className={`mode-tab ${mode === "image" ? "active" : ""}`}
                onClick={() => { setMode("image"); setError(null); }}
              >
                {s.tabImage}
              </button>
            </div>

            {mode === "text" ? (
              <div className="input-card">
                <textarea
                  className="textarea"
                  rows={7}
                  value={content}
                  maxLength={MAX_CHARS}
                  placeholder={s.placeholder}
                  onChange={(e) => setContent(e.target.value)}
                  aria-label={s.tabText}
                />
                <div className="input-row">
                  <span className="char-count">
                    {content.length}/{MAX_CHARS}
                  </span>
                  <button
                    className="link-btn"
                    type="button"
                    onClick={() => setContent(SAMPLE)}
                  >
                    {s.trySample}
                  </button>
                </div>
              </div>
            ) : (
              <ScreenshotConfirm onFile={onImageSelected} onError={setError} s={s} />
            )}

            <div className="action-bar">
              <label className="lang-select">
                <span className="lang-label">{s.outputLanguage}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label={s.outputLanguage}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </label>

              {mode === "text" && (
                <button
                  className="btn-analyze"
                  type="button"
                  onClick={onAnalyzeText}
                  disabled={!content.trim()}
                >
                  {s.analyze}
                </button>
              )}
            </div>

            {error && <div className="error" role="alert">{error}</div>}

            <p className="privacy">{s.privacy}</p>
          </>
        )}

        {loading && (
          <Loading
            label={mode === "image" ? s.loadingImage : s.loadingText}
            steps={s.loadingSteps}
          />
        )}

        {error && !showInput && !loading && (
          <div className="error-panel">
            <div className="error" role="alert">{error}</div>
            <button className="btn-ghost" type="button" onClick={reset}>
              {s.tryAgain}
            </button>
          </div>
        )}

        {result && !loading && (
          <>
            {result.extracted_text && (
              <div className="ocr-readout">
                <span className="ocr-label">
                  {t(resultLang).ocrReadout}
                  {result.ocr_confidence != null && (
                    <> · {Math.round(result.ocr_confidence * 100)}% {t(resultLang).confident}</>
                  )}
                </span>
                <p className="ocr-text">{result.extracted_text}</p>
              </div>
            )}
            <RiskResult result={result} onReset={reset} s={t(resultLang)} lang={resultLang} />
          </>
        )}
      </main>

      <footer className="site-footer">
        <span>{s.footerTeam}</span>
        <span className="footer-privacy">{s.footerPrivacy}</span>
      </footer>
    </div>
  );
}
