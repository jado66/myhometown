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
async function sendTextWithStream({
  message,
  recipient,
  mediaUrls = [],
  messageId,
}) {
  // Don't create a new messageId - use the one from the route
  const streamKey = getStreamKey(messageId);
  const controllerKey = getControllerKey(messageId);

  try {
    // Don't initialize a new stream - the stream route already did this
    // Just send the status update that we're processing this recipient
    await redis.rpush(
      controllerKey,
      JSON.stringify({
        type: "processing",
        recipient: recipient.phone,
        message: `Processing message for ${recipient.name}...`,
        timestamp: new Date().toISOString(),
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

    // Don't send the success status here - let the route handle it
    // Just return the result
    return {
      success: true,
      messageId: messageResponse.sid,
      // Don't include streamId since we're using the shared messageId
    };
  } catch (error) {
    console.error("Error sending text message:", error);

    // Don't send error status here either - let the route handle it
    return {
      success: false,
      error: error.message,
    };
  }

  // Remove all the Redis cleanup code - let the stream route handle it
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
async function sendClassSignupText({
  firstName,
  phone,
  classDoc,
  isWaitlisted = false,
  wasPromoted = false,
}) {
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

    let message;

    if (wasPromoted) {
      // Promotion confirmation message
      message = `Good news, ${firstName}! A spot has opened up in ${classDoc.title} and you've been moved from the waitlist to enrolled status.

Class Details:
Date: ${dateRange}
Schedule:
${meetingSchedule}
Location: ${classDoc.location}
  
We look forward to seeing you there!
  
Best Regards,
myHometown`;
    } else if (isWaitlisted) {
      // Waitlist confirmation message
      message = `Hello ${firstName}, Thank you for joining the waitlist for ${classDoc.title}.
      
This class is currently at capacity, but we've added you to our waitlist. We'll contact you if a spot becomes available.

Class Details:
  Date: ${dateRange}
  Schedule:
  ${meetingSchedule}
  Location: ${classDoc.location}
  
We appreciate your interest and hope to accommodate you soon.
  
Best Regards,
myHometown`;
    } else {
      // Regular signup confirmation message
      message = `Hello ${firstName}, Thank you for signing up for ${classDoc.title}. Here are the details:
  Date: ${dateRange}
  Schedule:
  ${meetingSchedule}
  Location: ${classDoc.location}
  
  We look forward to seeing you there!
  
  Best Regards,
  myHometown`;
    }

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
