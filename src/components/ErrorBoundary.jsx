"use client";

import { Component } from "react";
import { reportError } from "@/util/reportError";

export default class ErrorBoundary extends Component {
  state = { crashed: false, errorMessage: null };

  static getDerivedStateFromError(error) {
    return { crashed: true, errorMessage: error.message };
  }

  componentDidCatch(error, info) {
    reportError(error, {
      context: "ErrorBoundary",
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.crashed) {
      return (
        this.props.fallback ?? (
          <p style={{ color: "#c0392b", fontFamily: "monospace", fontSize: "0.85rem" }}>
            Render error caught: {this.state.errorMessage}
          </p>
        )
      );
    }
    return this.props.children;
  }
}
