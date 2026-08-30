// Client for the Digital Safety Co-pilot API.
// Relative paths so the Vite dev proxy (and any same-origin deploy) route to
// the FastAPI backend.

const BASE = "/api/v1";

// Friendly, user-facing messages for each documented API error code
// (api-spec.md). Falls back to the server message, then a generic line.
const ERROR_MESSAGES = {
  content_empty: "Please paste a message before analysing.",
  content_too_long: "That message is too long. Please shorten it to under 5000 characters.",
  unsupported_file_type: "That file type isn't supported. Upload a PNG, JPG, or WEBP screenshot.",
  file_too_large: "That image is too large. Please upload one under 5 MB.",
  ocr_failed: "We couldn't read any text from that image. Try a clearer screenshot, or paste the text instead.",
  analysis_unavailable: "The analysis service is temporarily unavailable. Please try again in a moment.",
  rate_limited: "You're going a bit fast. Please wait a minute and try again.",
};

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

function messageFor(code, serverMessage, status) {
  return (
    ERROR_MESSAGES[code] ||
    serverMessage ||
    `Something went wrong (${status}). Please try again.`
  );
}

async function parseOrThrow(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const code = data?.error?.code || "unknown";
    throw new ApiError(code, messageFor(code, data?.error?.message, res.status));
  }
  return data;
}

export async function analyze(content, language = "en") {
  let res;
  try {
    res = await fetch(`${BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, language }),
    });
  } catch {
    // Network-level failure (server down, no connection).
    throw new ApiError(
      "network",
      "Couldn't reach the analysis service. Check your connection and try again."
    );
  }
  return parseOrThrow(res);
}

export async function analyzeImage(file, language = "en") {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);

  let res;
  try {
    res = await fetch(`${BASE}/analyze/image`, { method: "POST", body: form });
  } catch {
    throw new ApiError(
      "network",
      "Couldn't reach the analysis service. Check your connection and try again."
    );
  }
  return parseOrThrow(res);
}
