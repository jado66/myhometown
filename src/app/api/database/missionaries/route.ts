import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: missionaries, error } = await supabase
      .from("missionaries")
      .select(
        `
        *,
        cities (name, state, country),
        communities (name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch missionaries error:", error);
      return NextResponse.json(
        { error: "Failed to fetch missionaries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ missionaries });
  } catch (error) {
    console.error("Missionaries API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      first_name,
      last_name,
      city_id,
      community_id,
      assignment_status,
      assignment_level,
      contact_number,
      notes,
      title,
      group,
      start_date,
      duration,
      stake_name,
      gender,
      profile_picture_url,
      preferred_entry_method,
      last_login,
      street_address,
      address_city,
      address_state,
      zip_code,
    } = body;

    console.log(JSON.stringify(body, null, 2));

    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Email, first name, and last name are required" },
        { status: 400 }
      );
    }

    if (!assignment_level) {
      return NextResponse.json(
        { error: "Assignment level is required" },
        { status: 400 }
      );
    }

    // Validate assignment constraints
    if (assignment_level === "state" && (city_id || community_id)) {
      return NextResponse.json(
        { error: "State level assignments cannot have city or community" },
        { status: 400 }
      );
    }

    if (assignment_level === "city" && (!city_id || community_id)) {
      return NextResponse.json(
        { error: "City level assignments must have city but not community" },
        { status: 400 }
      );
    }

    if (assignment_level === "community" && !community_id) {
      return NextResponse.json(
        {
          error: "Community level assignments must have a community",
        },
        { status: 400 }
      );
    }

    // Check for existing missionary with the same email
    const { data: existing, error: existingError } = await supabase
      .from("missionaries")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking for existing missionary:", existingError);
      return NextResponse.json(
        { error: "Error checking for existing missionary" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          error: "A missionary with this email already exists.",
          id: existing.id,
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("missionaries")
      .insert({
        email,
        first_name,
        last_name,
        city_id: city_id || null,
        community_id: community_id || null,
        assignment_status: assignment_status || "active",
        assignment_level,
        contact_number: contact_number || null,
        notes: notes || "",
        title: title || null,
        group: group || null,
        start_date: start_date || null,
        duration: duration || null,
        stake_name: stake_name || null,
        gender: gender || null,
        profile_picture_url: profile_picture_url || "",
        preferred_entry_method: preferred_entry_method || null,
        last_login: last_login || null,
        street_address: street_address || null,
        address_city: address_city || null,
        address_state: address_state || null,
        zip_code: zip_code || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create missionary error:", error);
      return NextResponse.json(
        { error: "Failed to create missionary" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Create missionary API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missionary ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      email,
      first_name,
      last_name,
      city_id,
      community_id,
      assignment_status,
      assignment_level,
      contact_number,
      notes,
      title,
      group,
      start_date,
      duration,
      stake_name,
      gender,
      profile_picture_url,
      preferred_entry_method,
      last_login,
      street_address,
      address_city,
      address_state,
      zip_code,
    } = body;

    // Validate assignment constraints if assignment_level is provided
    if (assignment_level) {
      if (assignment_level === "state" && (city_id || community_id)) {
        return NextResponse.json(
          { error: "State level assignments cannot have city or community" },
          { status: 400 }
        );
      }

      if (assignment_level === "city" && (!city_id || community_id)) {
        return NextResponse.json(
          { error: "City level assignments must have city but not community" },
          { status: 400 }
        );
      }

      if (assignment_level === "community" && !community_id) {
        return NextResponse.json(
          {
            error: "Community level assignments must have a community",
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    // Only include fields that are explicitly provided
    if (email !== undefined) updateData.email = email;
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (city_id !== undefined) updateData.city_id = city_id || null;
    if (community_id !== undefined)
      updateData.community_id = community_id || null;
    if (assignment_status !== undefined)
      updateData.assignment_status = assignment_status;
    if (assignment_level !== undefined)
      updateData.assignment_level = assignment_level;
    if (contact_number !== undefined)
      updateData.contact_number = contact_number || null;
    if (notes !== undefined) updateData.notes = notes || "";
    if (title !== undefined) updateData.title = title || null;
    if (group !== undefined) updateData.group = group || null;
    if (start_date !== undefined) updateData.start_date = start_date || null;
    if (duration !== undefined) updateData.duration = duration || null;
    if (stake_name !== undefined) updateData.stake_name = stake_name || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (profile_picture_url !== undefined)
      updateData.profile_picture_url = profile_picture_url || "";
    if (preferred_entry_method !== undefined)
      updateData.preferred_entry_method = preferred_entry_method || null;
    if (last_login !== undefined) updateData.last_login = last_login || null;
    if (street_address !== undefined)
      updateData.street_address = street_address || null;
    if (address_city !== undefined)
      updateData.address_city = address_city || null;
    if (address_state !== undefined)
      updateData.address_state = address_state || null;
    if (zip_code !== undefined) updateData.zip_code = zip_code || null;

    const { data, error } = await supabase
      .from("missionaries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update missionary error:", error);
      return NextResponse.json(
        { error: "Failed to update missionary" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Update missionary API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missionary ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("missionaries").delete().eq("id", id);

    if (error) {
      console.error("Delete missionary error:", error);
      return NextResponse.json(
        { error: "Failed to delete missionary" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete missionary API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
