// app/api/validate-address/route.js
import { NextResponse } from "next/server";

async function getAccessToken() {
  const clientId = process.env.USPS_API_KEY;
  const clientSecret = process.env.USPS_API_SECRET;

  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);

  const tokenResponse = await fetch("https://api.usps.com/oauth2/v3/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await tokenResponse.json();
  return data.access_token;
}

export async function POST(req) {
  try {
    const { address } = await req.json();
    console.log("Validating address:", address);

    // Validate required fields
    if (
      !address.street1 ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "All required fields must be provided",
          suggestions: [],
        },
        { status: 400 }
      );
    }

    try {
      const accessToken = await getAccessToken();

      const queryParams = new URLSearchParams({
        streetAddress: address.street1,
        city: address.city,
        state: address.state,
        ZIPCode: address.zipCode,
      });

      // Only add secondaryAddress if it exists and isn't empty
      if (address.street2 && address.street2.trim()) {
        queryParams.append("secondaryAddress", address.street2);
      }

      const response = await fetch(
        `https://api.usps.com/addresses/v3/address?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      // Check for API error response
      if (data.error) {
        return NextResponse.json(
          {
            valid: false,
            error: data.error.message || "Address validation failed",
            suggestions: [],
          },
          { status: 400 }
        );
      }

      // Check if we have a valid address response
      if (data.address) {
        return NextResponse.json({
          valid: true,
          standardized: {
            addressStreet1: data.address.streetAddress,
            addressStreet2: data.address.secondaryAddress || "",
            addressCity: data.address.city,
            addressState: data.address.state,
            addressZipCode:
              data.address.ZIPCode +
              (data.address.ZIPPlus4 ? `-${data.address.ZIPPlus4}` : ""),
          },
          additionalInfo: {
            deliveryPoint: data.additionalInfo?.deliveryPoint,
            carrierRoute: data.additionalInfo?.carrierRoute,
            isResidential: data.additionalInfo?.business === "N",
            isVacant: data.additionalInfo?.vacant === "Y",
          },
        });
      }

      throw new Error("Invalid response format from USPS API");
    } catch (apiError) {
      console.error("USPS API Error:", apiError);
      return NextResponse.json(
        {
          valid: false,
          error: "USPS API Error: " + apiError.message,
          suggestions: [],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Unable to validate address. Please try again.",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
