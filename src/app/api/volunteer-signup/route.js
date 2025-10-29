import { supabaseServer } from "@/util/supabaseServer";

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
        .eq("id", formData.volunteeringCityId)
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
      volunteering_community_id: formData.volunteeringCityId,
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
