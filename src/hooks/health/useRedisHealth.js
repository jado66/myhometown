import { useState, useEffect } from "react";

export function useRedisHealth(pollInterval = 30000) {
  // Default 30 seconds
  const [healthStatus, setHealthStatus] = useState({
    isConnected: true, // Optimistic initial state
    latency: null,
    lastChecked: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health/redis");
        const data = await response.json();

        setHealthStatus({
          isConnected: data.isConnected,
          latency: data.latency,
          lastChecked: data.timestamp,
          isLoading: false,
        });
      } catch (error) {
        setHealthStatus({
          isConnected: false,
          latency: null,
          lastChecked: new Date().toISOString(),
          error: error.message,
          isLoading: false,
        });
      }
    };

    // Initial check
    checkHealth();

    // Set up polling
    const interval = setInterval(checkHealth, pollInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [pollInterval]);

  return healthStatus;
}
