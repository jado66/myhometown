"use client";

import { useState } from "react";
import ErrorReporter from "@/components/ErrorReporter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { reportError } from "@/util/reportError";

// A component that throws during render when told to
function BrokenComponent() {
  throw new Error("BrokenComponent intentionally threw during render");
}

export default function TestErrorReporterPage() {
  const [renderBroken, setRenderBroken] = useState(false);
  const [boundaryKey, setBoundaryKey] = useState(0);
  const [log, setLog] = useState([]);

  function addLog(msg) {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  }

  function triggerJsError() {
    addLog("Triggering TypeError via setTimeout...");
    setTimeout(() => {
      // eslint-disable-next-line no-undef
      undefinedVariable.explode(); // ReferenceError — fires window 'error'
    }, 0);
  }

  function triggerUnhandledRejection() {
    addLog("Triggering unhandled promise rejection...");
    // Intentionally no .catch() — fires 'unhandledrejection'
    Promise.reject(new Error("Intentional unhandled promise rejection"));
  }

  async function triggerManualError() {
    addLog("Calling reportError() directly...");
    await reportError(new Error("Manual reportError() call"), {
      context: "test-error-reporter page",
      triggeredBy: "button click",
    });
    addLog("reportError() call complete — check your error dashboard.");
  }

  return (
    <>
      {/* Mounts the global error listener */}
      <ErrorReporter />

      <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 600 }}>
        <h1>ErrorReporter Test Page</h1>
        <p style={{ color: "#666" }}>
          Each button below triggers a different error pathway that{" "}
          <code>ErrorReporter</code> / <code>reportError</code> should capture.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          {/* 1 — window "error" event */}
          <div style={cardStyle}>
            <strong>1. window.onerror (TypeError)</strong>
            <p style={descStyle}>
              Calls <code>null.explode()</code> inside a <code>setTimeout</code>.
              Fires the global <code>error</code> event caught by{" "}
              <code>ErrorReporter</code>.
            </p>
            <button style={btnStyle} onClick={triggerJsError}>
              Trigger TypeError
            </button>
          </div>

          {/* 2 — unhandledrejection */}
          <div style={cardStyle}>
            <strong>2. Unhandled Promise Rejection</strong>
            <p style={descStyle}>
              Rejects a promise without a <code>.catch()</code>. Fires the{" "}
              <code>unhandledrejection</code> event.
            </p>
            <button style={btnStyle} onClick={triggerUnhandledRejection}>
              Trigger Unhandled Rejection
            </button>
          </div>

          {/* 3 — direct reportError call */}
          <div style={cardStyle}>
            <strong>3. Direct reportError() Call</strong>
            <p style={descStyle}>
              Calls <code>reportError()</code> directly with a custom message and
              metadata. Useful to verify the API endpoint receives the payload.
            </p>
            <button style={btnStyle} onClick={triggerManualError}>
              Call reportError()
            </button>
          </div>

          {/* 4 — render-time React error */}
          <div style={cardStyle}>
            <strong>4. React Render Error</strong>
            <p style={descStyle}>
              Mounts a component that throws during render. React will bubble this
              to the nearest error boundary (or the global error page if none is
              present).
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                style={{ ...btnStyle, background: "#c0392b" }}
                onClick={() => {
                  addLog("Mounting BrokenComponent inside ErrorBoundary...");
                  setRenderBroken(true);
                }}
              >
                Mount Broken Component
              </button>
              <button
                style={{ ...btnStyle, background: "#555" }}
                onClick={() => {
                  setRenderBroken(false);
                  setBoundaryKey((k) => k + 1);
                  addLog("ErrorBoundary reset.");
                }}
              >
                Reset
              </button>
            </div>
            <ErrorBoundary
              key={boundaryKey}
              fallback={
                <p style={{ color: "#c0392b", fontFamily: "monospace", fontSize: "0.85rem", marginTop: 8 }}>
                  Render error caught &amp; reported. Check your dashboard.
                </p>
              }
            >
              {renderBroken && <BrokenComponent />}
            </ErrorBoundary>
          </div>
        </div>

        {/* Activity log */}
        {log.length > 0 && (
          <div style={{ marginTop: "2rem", background: "#1e1e1e", borderRadius: 8, padding: "1rem" }}>
            <strong style={{ color: "#fff", fontSize: "0.85rem" }}>Activity Log</strong>
            {log.map((entry, i) => (
              <div key={i} style={{ color: "#7ec8a0", fontFamily: "monospace", fontSize: "0.8rem", marginTop: 4 }}>
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: "1rem 1.25rem",
  background: "#fafafa",
};

const descStyle = {
  margin: "0.4rem 0 0.75rem",
  fontSize: "0.9rem",
  color: "#444",
};

const btnStyle = {
  padding: "0.5rem 1.25rem",
  background: "#2c3e50",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: "0.9rem",
};
