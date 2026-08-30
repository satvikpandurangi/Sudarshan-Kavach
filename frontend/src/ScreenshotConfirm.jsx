// Screenshot picker with drag-and-drop, preview, and client-side validation.
// On selection it hands the file up to the parent, which calls the OCR endpoint.
// The extracted text is shown above the result so the user can confirm what was
// read from their screenshot (api-spec.md / requirement 9).

import { useRef, useState } from "react";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export default function ScreenshotConfirm({ onFile, onError, s }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  function validateAndSend(file) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      onError(s.imgTypeError);
      return;
    }
    if (file.size > MAX_BYTES) {
      onError(s.imgSizeError);
      return;
    }
    onError(null);
    setPreview(URL.createObjectURL(file));
    onFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    validateAndSend(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="input-card">
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click(); }}
        aria-label="Upload a screenshot"
      >
        {preview ? (
          <img className="dropzone-preview" src={preview} alt="Selected screenshot" />
        ) : (
          <>
            <div className="dropzone-icon" aria-hidden="true">🖼️</div>
            <div className="dropzone-primary">{s.dropPrimary}</div>
            <div className="dropzone-hint">{s.dropHint}</div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => validateAndSend(e.target.files?.[0])}
      />
      <p className="dropzone-note">{s.dropNote}</p>
    </div>
  );
}
