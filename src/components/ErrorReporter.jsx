"use client";

import { useEffect } from "react";
import { reportError } from "@/util/reportError";

export default function ErrorReporter() {
  useEffect(() => {
    const handleError = (event) => {
      reportError(event.error || event.message, {
        context: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event) => {
      reportError(event.reason || "Unhandled promise rejection", {
        context: "unhandledrejection",
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
