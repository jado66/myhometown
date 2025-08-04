// scripts/cleanupRedisStreams.js
// This script can be run manually or via cron to clean up orphaned Redis keys

import redis from "../src/util/redis/redis.js";

async function cleanupRedisStreams() {
  console.log("Starting Redis stream cleanup...");
  console.log("Timestamp:", new Date().toISOString());

  try {
    // Get all keys
    const streamKeys = await redis.keys("stream:*");
    const controllerKeys = await redis.keys("controller:*");
    const userStreamKeys = await redis.keys("user-stream:*");

    console.log(`Found ${streamKeys.length} stream keys`);
    console.log(`Found ${controllerKeys.length} controller keys`);
    console.log(`Found ${userStreamKeys.length} user stream keys`);

    // Track stats
    const stats = {
      orphanedControllers: 0,
      expiredStreams: 0,
      oldStreams: 0,
      totalCleaned: 0,
    };

    // 1. Clean up orphaned controller keys
    const activeMessageIds = new Set(
      streamKeys.map((key) => key.replace("stream:", ""))
    );

    for (const controllerKey of controllerKeys) {
      const messageId = controllerKey.replace("controller:", "");
      if (!activeMessageIds.has(messageId)) {
        console.log(`Deleting orphaned controller: ${controllerKey}`);
        await redis.del(controllerKey);
        stats.orphanedControllers++;
      }
    }

    // 2. Clean up expired or old streams
    const now = Date.now();
    const MAX_AGE = 10 * 60 * 1000; // 10 minutes

    for (const streamKey of streamKeys) {
      try {
        const ttl = await redis.ttl(streamKey);
        const streamData = await redis.get(streamKey);

        let shouldDelete = false;
        let reason = "";

        // Check if key is expired
        if (ttl <= 0) {
          shouldDelete = true;
          reason = "expired TTL";
          stats.expiredStreams++;
        }

        // Check stream age
        if (streamData) {
          try {
            const parsed = JSON.parse(streamData);
            if (parsed.startTime && now - parsed.startTime > MAX_AGE) {
              shouldDelete = true;
              reason = `too old (${Math.round(
                (now - parsed.startTime) / 1000 / 60
              )} minutes)`;
              stats.oldStreams++;
            }
          } catch (e) {
            // Not JSON, check if it's a simple value
            if (streamData === "active") {
              // Old format without timestamp, delete it
              shouldDelete = true;
              reason = "old format";
              stats.oldStreams++;
            }
          }
        }

        if (shouldDelete) {
          const messageId = streamKey.replace("stream:", "");
          console.log(`Deleting stream ${messageId} - ${reason}`);

          // Delete all related keys
          await Promise.all([
            redis.del(streamKey),
            redis.del(`controller:${messageId}`),
            // Look for any user stream keys with this messageId
            ...userStreamKeys
              .filter((key) => redis.get(key).then((val) => val === messageId))
              .map((key) => redis.del(key)),
          ]);

          stats.totalCleaned++;
        }
      } catch (error) {
        console.error(`Error processing stream ${streamKey}:`, error);
      }
    }

    // 3. Clean up orphaned user stream keys
    for (const userStreamKey of userStreamKeys) {
      try {
        const messageId = await redis.get(userStreamKey);
        if (messageId && !activeMessageIds.has(messageId)) {
          console.log(`Deleting orphaned user stream key: ${userStreamKey}`);
          await redis.del(userStreamKey);
          stats.totalCleaned++;
        }
      } catch (error) {
        console.error(`Error processing user stream ${userStreamKey}:`, error);
      }
    }

    // 4. Reset daily counters from previous days
    const today = new Date().toISOString().split("T")[0];
    const monitorKeys = await redis.keys("stream-monitor:*");

    for (const monitorKey of monitorKeys) {
      const keyDate = monitorKey.replace("stream-monitor:", "");
      if (keyDate !== today) {
        console.log(`Deleting old monitor key: ${monitorKey}`);
        await redis.del(monitorKey);
      }
    }

    console.log("\nCleanup completed!");
    console.log("Stats:", JSON.stringify(stats, null, 2));

    // Get current state
    const remainingStreams = await redis.keys("stream:*");
    const remainingControllers = await redis.keys("controller:*");

    console.log(`\nRemaining active streams: ${remainingStreams.length}`);
    console.log(`Remaining controllers: ${remainingControllers.length}`);

    return stats;
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  } finally {
    // Ensure Redis connection is closed
    await redis.quit();
  }
}

// Run the cleanup
cleanupRedisStreams()
  .then(() => {
    console.log("Cleanup script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Cleanup script failed:", error);
    process.exit(1);
  });
