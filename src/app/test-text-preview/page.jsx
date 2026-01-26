"use client";
import { useState } from "react";

export default function TestTextPage() {
  const [email, setEmail] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canSend, setCanSend] = useState(false);
  const [message, setMessage] = useState("");

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
    </div>
  );
}
