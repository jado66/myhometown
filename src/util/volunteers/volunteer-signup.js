/**
 * Submit volunteer signup form data to the API
 * @param {Object} formData - The form data to submit
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function submitVolunteerSignup(formData) {
  try {
    const response = await fetch("/api/volunteer-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to submit volunteer application",
        errorType: result.errorType,
      };
    }

    return {
      success: true,
      message:
        result.message || "Volunteer application submitted successfully!",
      data: result.data,
    };
  } catch (error) {
    console.error("Error submitting volunteer signup:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}
