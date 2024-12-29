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

      // Extract base ZIP and ZIP+4 if it exists
      const [baseZip, zipPlus4] = address.zipCode.split("-");

      const queryParams = new URLSearchParams({
        streetAddress: address.street1,
        city: address.city,
        state: address.state,
        ZIPCode: baseZip,
      });

      // Only add secondaryAddress if it exists and isn't empty
      if (address.street2 && address.street2.trim()) {
        queryParams.append("secondaryAddress", address.street2);
      }

      console.log("Query params:", queryParams.toString());

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
      console.log("USPS API Response:", data);

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
        // If the API returns a different ZIP+4, use it; otherwise keep the original
        const responseZipPlus4 = data.address.ZIPPlus4;
        const finalZipPlus4 = responseZipPlus4 || zipPlus4 || "";

        // Construct the full ZIP code
        const fullZipCode = finalZipPlus4
          ? `${data.address.ZIPCode}-${finalZipPlus4}`
          : data.address.ZIPCode;

        // Check if the address is substantially different
        const isSubstantiallyDifferent =
          data.address.streetAddress.toLowerCase() !==
            address.street1.toLowerCase() ||
          data.address.city.toLowerCase() !== address.city.toLowerCase() ||
          data.address.state !== address.state ||
          data.address.ZIPCode !== baseZip;

        // If the address is the same, just validate without suggesting changes
        if (!isSubstantiallyDifferent) {
          return NextResponse.json({
            valid: true,
            standardized: null, // Don't suggest changes for identical addresses
            additionalInfo: {
              deliveryPoint: data.additionalInfo?.deliveryPoint,
              carrierRoute: data.additionalInfo?.carrierRoute,
              isResidential: data.additionalInfo?.business === "N",
              isVacant: data.additionalInfo?.vacant === "Y",
            },
          });
        }

        return NextResponse.json({
          valid: true,
          standardized: {
            addressStreet1: data.address.streetAddress,
            addressStreet2: data.address.secondaryAddress || "",
            addressCity: data.address.city,
            addressState: data.address.state,
            addressZipCode: fullZipCode,
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
