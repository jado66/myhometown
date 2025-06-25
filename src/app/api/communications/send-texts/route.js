// util/communication/sendTexts.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get communication preference for a phone number
async function getCommunicationPreference(phoneNumber) {
  try {
    // Normalize phone number (remove non-digits, ensure consistent format)
    const normalizedPhone = phoneNumber.replace(/\D/g, "");

    const { data, error } = await supabase
      .from("user_communication_preferences")
      .select("preferred_channel")
      .eq("phone_number", normalizedPhone)
      .single();

    if (error || !data) {
      // Default to SMS if no preference found
      return "sms";
    }

    return data.preferred_channel;
  } catch (error) {
    console.error("Error fetching communication preference:", error);
    // Default to SMS on error
    return "sms";
  }
}

// Send via SMS (existing implementation)
async function sendViaSMS({ message, recipient, mediaUrls }) {
  // Your existing Twilio SMS implementation
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  const client = require("twilio")(accountSid, authToken);

  const messageData = {
    body: message,
    from: twilioPhoneNumber,
    to: recipient.phone,
  };

  if (mediaUrls && mediaUrls.length > 0) {
    messageData.mediaUrl = mediaUrls;
  }

  try {
    const twilioMessage = await client.messages.create(messageData);
    return {
      success: true,
      messageId: twilioMessage.sid,
      channel: "sms",
    };
  } catch (error) {
    throw error;
  }
}

// Send via WhatsApp (placeholder - implement when WhatsApp Business API is ready)
async function sendViaWhatsApp({ message, recipient, mediaUrls }) {
  // TODO: Implement WhatsApp Business API integration
  // For now, fallback to SMS
  console.log("WhatsApp sending not yet implemented, falling back to SMS");
  return sendViaSMS({ message, recipient, mediaUrls });
}

// Enhanced sendTextWithStream function with preference checking
export async function sendTextWithStream({
  message,
  recipient,
  mediaUrls,
  messageId,
}) {
  try {
    // Normalize phone number
    const normalizedPhone = recipient.phone.replace(/\D/g, "");

    // Get user's communication preference
    const preferredChannel = await getCommunicationPreference(normalizedPhone);

    let result;
    let actualChannel = preferredChannel;

    // Try preferred channel first
    try {
      if (preferredChannel === "whatsapp") {
        result = await sendViaWhatsApp({ message, recipient, mediaUrls });
      } else {
        result = await sendViaSMS({ message, recipient, mediaUrls });
      }
    } catch (channelError) {
      // If preferred channel fails and it was WhatsApp, fallback to SMS
      if (preferredChannel === "whatsapp") {
        console.log(
          `WhatsApp delivery failed, falling back to SMS: ${channelError.message}`
        );
        result = await sendViaSMS({ message, recipient, mediaUrls });
        actualChannel = "sms";
      } else {
        throw channelError;
      }
    }

    // Update stream with channel information
    if (messageId && typeof sendMessageToStream === "function") {
      await sendMessageToStream(messageId, {
        type: "delivery",
        status: "sent",
        recipient: recipient.phone,
        channel: actualChannel,
        preferredChannel: preferredChannel,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      ...result,
      channel: actualChannel,
      preferredChannel: preferredChannel,
    };
  } catch (error) {
    console.error("Error in sendTextWithStream:", error);
    throw error;
  }
}

// Utility function to set user preference (for future use)
export async function setUserPreference(phoneNumber, channel) {
  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, "");

    const { data, error } = await supabase
      .from("user_communication_preferences")
      .upsert(
        {
          phone_number: normalizedPhone,
          preferred_channel: channel,
        },
        {
          onConflict: "phone_number",
        }
      );

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error setting user preference:", error);
    return { success: false, error: error.message };
  }
}

// Utility function to get user preference
export async function getUserPreference(phoneNumber) {
  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, "");

    const { data, error } = await supabase
      .from("user_communication_preferences")
      .select("preferred_channel")
      .eq("phone_number", normalizedPhone)
      .single();

    if (error || !data) {
      return { success: true, channel: "sms" }; // Default to SMS
    }

    return { success: true, channel: data.preferred_channel };
  } catch (error) {
    console.error("Error getting user preference:", error);
    return { success: false, error: error.message, channel: "sms" };
  }
}

// Utility function to delete user preference
export async function deleteUserPreference(phoneNumber) {
  try {
    const normalizedPhone = phoneNumber.replace(/\D/g, "");

    const { error } = await supabase
      .from("user_communication_preferences")
      .delete()
      .eq("phone_number", normalizedPhone);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting user preference:", error);
    return { success: false, error: error.message };
  }
}
