import { supabaseServer } from "@/util/supabaseServer";

export const newToOldCommunity = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd", // Orem - Geneva Heights
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "fb34e335-5cc6-4e6c-b5fc-2b64588fe921", // Orem - Sharon Park
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33", // Provo - Pioneer Park
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34", // Provo - Dixon
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35", // Provo - South Freedom
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37", // Ogden - North
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38", // Ogden - South
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39", // Ogden - West
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a", // Salt Lake City - Central
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b", // Salt Lake City - Northwest
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c", // Salt Lake City - Westside
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d", // West Valley City - Central Granger
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6838adb32243dc8160ce207d", // Layton - Layton
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e", // West Valley City - North East Granger
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f", // West Valley City - West Granger
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40", // West Valley City - Central Valley View
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed", // Santaquin - Santaquin
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": "6912655528c9b9c20ee4dede",
};

export const oldToNewCommunity = Object.fromEntries(
  Object.entries(newToOldCommunity).map(([newId, oldId]) => [oldId, newId])
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const communityId = searchParams.get("communityId");
    const search = searchParams.get("search");

    let query = supabaseServer
      .from("volunteer_signups")
      .select(
        `
        *,
        communities:volunteering_community_id (
          id,
          name,
          cities:city_id (
            id,
            name,
            state
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filter by community if specified
    if (communityId) {
      query = query.eq("volunteering_community_id", communityId);
    }

    // Search filter
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: signups, error, count } = await query;

    if (error) {
      console.error("Error fetching volunteer signups:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to fetch volunteer signups",
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: signups || [],
        pagination: {
          page,
          limit,
          total: count,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Volunteer signups API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.json();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "contactNumber",
      "streetAddress",
      "addressCity",
      "addressState",
      "zipCode",
      "volunteeringCityId",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        return new Response(
          JSON.stringify({
            success: false,
            message: `${field} is required`,
          }),
          { status: 400 }
        );
      }
    }

    // Normalize the volunteering community ID if it's an old one
    const incomingCommunityId = formData.volunteeringCityId;
    const normalizedCommunityId =
      oldToNewCommunity[incomingCommunityId] || incomingCommunityId;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email format",
        }),
        { status: 400 }
      );
    }

    // Validate zip code format (5 digits)
    if (!/^\d{5}$/.test(formData.zipCode)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Zip code must be 5 digits",
        }),
        { status: 400 }
      );
    }

    // Check if volunteering community exists
    const { data: communityExists, error: communityError } =
      await supabaseServer
        .from("communities")
        .select("id")
        .eq("id", normalizedCommunityId)
        .single();

    if (communityError || !communityExists) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid volunteering community selected",
        }),
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const volunteerData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      contact_number: formData.contactNumber.trim(),
      street_address: formData.streetAddress.trim(),
      address_city: formData.addressCity.trim(),
      address_state: formData.addressState,
      zip_code: formData.zipCode.trim(),
      volunteering_community_id: normalizedCommunityId,
      profile_picture_url: "", // Default empty string as per schema
    };

    // Insert the volunteer signup
    const { data, error } = await supabaseServer
      .from("volunteer_signups")
      .insert([volunteerData])
      .select()
      .single();

    if (error) {
      console.error("Volunteer signup insertion error:", error);

      // Handle unique constraint violation (duplicate email)
      if (
        error.code === "23505" &&
        (error.constraint === "volunteer_signups_email_key" ||
          error.message?.includes("volunteer_signups_email_key") ||
          error.details?.includes("email") ||
          error.message?.includes(
            "duplicate key value violates unique constraint"
          ))
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            message:
              "This email address has already been used for volunteer registration. If you need to update your information, please contact us.",
            errorType: "DUPLICATE_EMAIL",
          }),
          { status: 409 }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to submit volunteer application. Please try again.",
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Volunteer application submitted successfully!",
        data: data,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Volunteer signup API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error. Please try again later.",
      }),
      { status: 500 }
    );
  }
}
