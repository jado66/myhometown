"use client";

import { useEffect } from "react";
import { reportError } from "@/util/reportError";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    reportError(error, { context: "global-error-boundary" });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f5f5f5" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(23,70,161,.1)",
              padding: "3rem 2.5rem",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="56"
              height="56"
              style={{ marginBottom: "1rem" }}
              fill="none"
              stroke="#318D43"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.5rem",
                color: "#196127",
              }}
            >
              Something went wrong
            </h1>
            <p style={{ color: "#686868", margin: "0 0 2rem", lineHeight: 1.6 }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              onClick={reset}
              style={{
                background: "#318D43",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 2rem",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
