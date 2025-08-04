"use client";
import StreamMonitor from "@/components/health/StreamMonitor";
import RedisHealth from "@/components/health/RedisHealth";

export default function HealthPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <RedisHealth />
      <StreamMonitor />
    </div>
  );
}
