"use client";
import { useState } from "react";

export default function TestTextPage() {
  const [email, setEmail] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canSend, setCanSend] = useState(false);
  const [message, setMessage] = useState("");

  // Bulk send state
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState("");
  const [bulkConfirm, setBulkConfirm] = useState(false);

  // Test batch state
  const [testBatchLoading, setTestBatchLoading] = useState(false);
  const [testBatchResult, setTestBatchResult] = useState(null);
  const [testBatchError, setTestBatchError] = useState("");

  const TEST_BATCH_EMAILS = [
    "jado66@gmail.com",
    "kcraven10@gmail.com",
    "jerrycraven@gmail.com",
  ];

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    setCanSend(false);
    setMessage("");
    try {
      const res = await fetch(
        "/api/cron/test-text?email=" + encodeURIComponent(email),
      );
      const data = await res.json();
      if (data && data.previewMessage) {
        setResponse(data);
        setMessage(data.previewMessage);
        setCanSend(
          !!data.missionaryFound &&
            !!data.missionary &&
            !!data.missionary.contact_number,
        );
      } else {
        setError(data.error || "No preview message returned.");
      }
    } catch (e) {
      setError("Error: " + e.message);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cron/test-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data && data.success) {
        setResponse(data);
        setCanSend(false);
      } else {
        setError(data.error || "Failed to send text.");
      }
    } catch (e) {
      setError("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        padding: 24,
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <h2>Test Missionary Text</h2>
      <label>
        Email Address:
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter missionary email"
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
      </label>
      <button
        onClick={handleCheck}
        disabled={loading || !email}
        style={{ marginRight: 8 }}
      >
        Preview Text
      </button>
      <button
        onClick={handleSend}
        disabled={loading || !canSend}
        style={{ background: canSend ? "#0070f3" : "#ccc", color: "#fff" }}
      >
        Send Text
      </button>
      {loading && <div style={{ marginTop: 16 }}>Loading...</div>}
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      {message && (
        <div
          style={{
            marginTop: 24,
            background: "#f9f9f9",
            padding: 16,
            borderRadius: 6,
          }}
        >
          <strong>Preview Message:</strong>
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{message}</div>
        </div>
      )}
      {response && response.result && (
        <div style={{ marginTop: 24, color: "green" }}>
          <strong>Text sent!</strong>
        </div>
      )}

      {/* ── Bulk Send Section ── */}
      <hr style={{ margin: "32px 0" }} />
      <h2>Bulk Send All Reminders</h2>
      <p style={{ fontSize: 14, color: "#555" }}>
        Sends hours-reminder texts to all missionaries with a phone number.
        Skips anyone already texted today.
      </p>

      <button
        onClick={async () => {
          setBulkLoading(true);
          setBulkError("");
          setBulkPreview(null);
          setBulkResult(null);
          setBulkConfirm(false);
          try {
            const res = await fetch("/api/cron/send-hours-reminder");
            const data = await res.json();
            setBulkPreview(data);
          } catch (e) {
            setBulkError("Error: " + e.message);
          }
          setBulkLoading(false);
        }}
        disabled={bulkLoading}
        style={{ marginRight: 8 }}
      >
        Preview Count
      </button>

      <button
        onClick={async () => {
          setTestBatchLoading(true);
          setTestBatchError("");
          setTestBatchResult(null);
          try {
            const res = await fetch("/api/cron/send-hours-reminder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ testEmails: TEST_BATCH_EMAILS }),
            });
            const data = await res.json();
            setTestBatchResult(data);
          } catch (e) {
            setTestBatchError("Error: " + e.message);
          }
          setTestBatchLoading(false);
        }}
        disabled={testBatchLoading || bulkLoading}
        style={{
          marginRight: 8,
          background: "#1890ff",
          color: "#fff",
          padding: "8px 16px",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        {testBatchLoading ? "Sending..." : "Send Test Batch (3)"}
      </button>

      {testBatchResult && (
        <div
          style={{
            marginTop: 16,
            background: "#e6f7ff",
            padding: 16,
            borderRadius: 6,
            border: "1px solid #91d5ff",
          }}
        >
          <strong>Test Batch Result:</strong> Sent: {testBatchResult.sent},
          Failed: {testBatchResult.failed}, Total: {testBatchResult.total}
          {testBatchResult.errors?.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary>Errors ({testBatchResult.errors.length})</summary>
              <pre style={{ fontSize: 12, maxHeight: 200, overflow: "auto" }}>
                {JSON.stringify(testBatchResult.errors, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {testBatchError && (
        <div style={{ color: "red", marginTop: 8 }}>{testBatchError}</div>
      )}

      {bulkPreview && !bulkConfirm && (
        <div
          style={{
            marginTop: 16,
            background: "#fffbe6",
            padding: 16,
            borderRadius: 6,
            border: "1px solid #ffe58f",
          }}
        >
          <strong>{bulkPreview.wouldSend}</strong> missionaries will receive a
          text.
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 180,
                background: "#f6ffed",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #b7eb8f",
              }}
            >
              <strong style={{ color: "#389e0d" }}>
                Logged Hours: {bulkPreview.loggedHoursCount ?? 0}
              </strong>
              <div
                style={{
                  maxHeight: 200,
                  overflow: "auto",
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                {bulkPreview.loggedHours?.map((m) => (
                  <div key={m.id}>
                    {m.first_name} — {m.hours}h ({m.email})
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 180,
                background: "#fff2e8",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #ffbb96",
              }}
            >
              <strong style={{ color: "#d4380d" }}>
                Not Logged: {bulkPreview.notLoggedCount ?? 0}
              </strong>
              <div
                style={{
                  maxHeight: 200,
                  overflow: "auto",
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                {bulkPreview.notLogged?.map((m) => (
                  <div key={m.id}>
                    {m.first_name} ({m.email})
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setBulkConfirm(true)}
            style={{
              marginTop: 12,
              background: "#d4380d",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Confirm &amp; Send All
          </button>
        </div>
      )}

      {bulkConfirm && !bulkResult && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={async () => {
              setBulkLoading(true);
              setBulkError("");
              try {
                const res = await fetch("/api/cron/send-hours-reminder", {
                  method: "POST",
                });
                const data = await res.json();
                setBulkResult(data);
              } catch (e) {
                setBulkError("Error: " + e.message);
              }
              setBulkLoading(false);
            }}
            disabled={bulkLoading}
            style={{
              background: "#d4380d",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {bulkLoading ? "Sending..." : "Yes, Send Now"}
          </button>
          <button
            onClick={() => setBulkConfirm(false)}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        </div>
      )}

      {bulkResult && (
        <div
          style={{
            marginTop: 16,
            background: "#f6ffed",
            padding: 16,
            borderRadius: 6,
            border: "1px solid #b7eb8f",
          }}
        >
          <strong>Done!</strong> Sent: {bulkResult.sent}, Failed:{" "}
          {bulkResult.failed}, Total: {bulkResult.total}
          {bulkResult.elapsedSeconds && (
            <span> — {bulkResult.elapsedSeconds}s</span>
          )}
          {bulkResult.errors?.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary>Errors ({bulkResult.errors.length})</summary>
              <pre style={{ fontSize: 12, maxHeight: 200, overflow: "auto" }}>
                {JSON.stringify(bulkResult.errors, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {bulkError && (
        <div style={{ color: "red", marginTop: 16 }}>{bulkError}</div>
      )}

      {bulkLoading && (
        <div style={{ marginTop: 16 }}>Loading… this may take a while.</div>
      )}
    </div>
  );
}
