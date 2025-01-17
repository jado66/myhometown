import twilio from "twilio";
import redis from "@/util/redis/redis";
import { v4 as uuidv4 } from "uuid";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Helper to generate Redis keys
const getStreamKey = (messageId) => `stream:${messageId}`;
const getControllerKey = (messageId) => `controller:${messageId}`;

// Send message and track status via Redis stream
async function sendTextWithStream({ message, recipient, mediaUrls = [] }) {
  const messageId = uuidv4();
  const streamKey = getStreamKey(messageId);
  const controllerKey = getControllerKey(messageId);

  try {
    // Initialize stream
    await redis.set(streamKey, "active", { ex: 300 });

    // Send status update
    await redis.rpush(
      controllerKey,
      JSON.stringify({
        type: "status",
        message: "Processing message...",
      })
    );

    // Format phone number
    const phoneNumber = recipient.phone.toString();
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    const toNumber =
      formattedPhone.length === 10
        ? `+1${formattedPhone}`
        : `+${formattedPhone}`;

    // Prepare message options
    const messageOptions = {
      body: message,
      to: toNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    };

    // Add media if provided
    if (mediaUrls.length > 0) {
      messageOptions.mediaUrl = mediaUrls.filter(Boolean).map((url) => {
        try {
          return decodeURIComponent(url);
        } catch {
          return url;
        }
      });
    }

    // Send message through Twilio
    const messageResponse = await client.messages.create(messageOptions);

    // Send success status
    await redis.rpush(
      controllerKey,
      JSON.stringify({
        recipient: recipient.name,
        status: "success",
        messageId: messageResponse.sid,
        timestamp: new Date().toISOString(),
        mediaCount: messageOptions.mediaUrl?.length || 0,
      })
    );

    // Send completion message
    await redis.rpush(
      controllerKey,
      JSON.stringify({
        type: "complete",
        timestamp: new Date().toISOString(),
      })
    );

    // Clean up Redis keys after a short delay
    setTimeout(async () => {
      await Promise.all([redis.del(streamKey), redis.del(controllerKey)]);
    }, 100);

    return {
      success: true,
      messageId: messageResponse.sid,
      streamId: messageId,
    };
  } catch (error) {
    console.error("Error sending text message:", error);

    // Send error status if stream is still active
    try {
      const isActive = await redis.get(streamKey);
      if (isActive) {
        await redis.rpush(
          controllerKey,
          JSON.stringify({
            type: "error",
            error: error.message,
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (streamError) {
      console.error("Error sending error status:", streamError);
    }

    // Clean up Redis keys
    try {
      await Promise.all([redis.del(streamKey), redis.del(controllerKey)]);
    } catch (cleanupError) {
      console.error("Error cleaning up Redis keys:", cleanupError);
    }

    return {
      success: false,
      error: error.message,
      streamId: messageId,
    };
  }
}

// Simplified function for single text message without streaming
async function sendSimpleText({ message, phone, name }) {
  try {
    const phoneNumber = phone.toString();
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    const toNumber =
      formattedPhone.length === 10
        ? `+1${formattedPhone}`
        : `+${formattedPhone}`;

    const messageResponse = await client.messages.create({
      body: message,
      to: toNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return {
      success: true,
      messageId: messageResponse.sid,
    };
  } catch (error) {
    console.error("Error sending simple text:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Utility function for class signup notification
async function sendClassSignupText({ firstName, phone, classDoc }) {
  try {
    // Format the date range if start and end dates are different
    const startDate = new Date(classDoc.startDate).toLocaleDateString();
    const endDate = classDoc.endDate
      ? new Date(classDoc.endDate).toLocaleDateString()
      : startDate;
    const dateRange =
      startDate === endDate ? startDate : `${startDate} - ${endDate}`;

    // Format meeting times
    const meetingSchedule = formatMeetingTimes(classDoc.meetings);

    const message = `Hello ${firstName}, Thank you for signing up for ${classDoc.title}. Here are the details:
  Date: ${dateRange}
  Schedule:
  ${meetingSchedule}
  Location: ${classDoc.location}
  
  We look forward to seeing you there!
  
  Best Regards,
  myHometown`;

    return sendSimpleText({
      message,
      phone,
      name: firstName,
    });
  } catch (error) {
    console.error("Error formatting class signup message:", error);
    return {
      success: false,
      error: "Error formatting message",
    };
  }
}

function formatTime(time24) {
  try {
    // Parse the time string (assuming HH:mm format)
    const [hours24, minutes] = time24
      .split(":")
      .map((num) => parseInt(num, 10));

    // Convert to 12-hour format
    let period = hours24 >= 12 ? "pm" : "am";
    let hours12 = hours24 % 12;
    hours12 = hours12 === 0 ? 12 : hours12; // Convert 0 to 12 for midnight

    // Format with leading zero removed for hours but kept for minutes
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return time24; // Return original format if parsing fails
  }
}

function formatMeetingTimes(meetings) {
  if (!meetings || meetings.length === 0) return "Time not specified";

  if (meetings.length === 1) {
    const meeting = meetings[0];
    return `${meeting.day}s ${formatTime(meeting.startTime)} - ${formatTime(
      meeting.endTime
    )}`;
  }

  // For multiple meetings, create a list
  return meetings
    .map(
      (meeting) =>
        `${meeting.day}s ${formatTime(meeting.startTime)} - ${formatTime(
          meeting.endTime
        )}`
    )
    .join("\n");
}

export { sendTextWithStream, sendSimpleText, sendClassSignupText };
