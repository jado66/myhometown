import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabaseServer";

// Add these lines to disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper function to calculate duration in months between start_date and end_date
function calculateDuration(
  startDate: string | null,
  endDate: string | null
): number | null {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  // Calculate difference in months
  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const daysDiff = end.getDate() - start.getDate();

  let totalMonths = yearsDiff * 12 + monthsDiff;

  // Round to nearest month based on days
  if (daysDiff >= 15) {
    totalMonths += 1;
  } else if (daysDiff <= -15) {
    totalMonths -= 1;
  }

  return Math.max(0, totalMonths); // Ensure non-negative
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a fetch request (has user, communityId, or cityId property) or a create request
    if (
      body.user !== undefined ||
      body.communityId ||
      body.cityId !== undefined
    ) {
      // This is a fetch missionaries request
      const { user, communityId, cityId, excludeEmail } = body;

      // Fetch all records using pagination to bypass the 1000 row limit
      const pageSize = 1000;
      let allMissionaries: any[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        let query = supabaseServer
          .from("missionaries")
          .select(
            `
            *,
            cities:city_id (name, state, country),
            communities:community_id (name)
          `
          )
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);

        // Apply filters based on communityId (for email-logged-in users at community level)
        if (communityId) {
          query = query.eq("community_id", communityId);
        }
        // For city-level users, we'll fetch all and filter on the client side
        // since we need access to the community list to find child communities
        // Apply filters based on user's cities and communities (for authenticated users)
        else if (user) {
          const userCities = user.cities || [];
          const userCommunities = user.communities || [];

          // If user has specific cities or communities assigned, filter accordingly
          if (userCities.length > 0 || userCommunities.length > 0) {
            // Build OR conditions for filtering
            const orConditions: string[] = [];

            if (userCities.length > 0) {
              orConditions.push(`city_id.in.(${userCities.join(",")})`);
            }

            if (userCommunities.length > 0) {
              orConditions.push(
                `community_id.in.(${userCommunities.join(",")})`
              );
            }

            if (orConditions.length > 0) {
              query = query.or(orConditions.join(","));
            }
          }
          // If user has no cities or communities, they can see all (admin behavior)
        }

        const { data: missionaries, error } = await query;

        if (error) {
          console.error("Fetch missionaries error:", error);
          return NextResponse.json(
            { error: "Failed to fetch missionaries" },
            { status: 500 }
          );
        }

        if (missionaries && missionaries.length > 0) {
          allMissionaries = allMissionaries.concat(missionaries);
          from += pageSize;
          hasMore = missionaries.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      // Calculate duration for each missionary
      const missionariesWithDuration = allMissionaries.map((missionary) => {
        const result: any = {
          ...missionary,
          // Provide unified `type` field (new column) while remaining backward compatible.
          type:
            (missionary as any).type || (missionary as any).person_type || null,
          calculated_duration: calculateDuration(
            missionary.start_date,
            missionary.end_date
          ),
        };

        // Remove email if excludeEmail flag is set
        if (excludeEmail) {
          delete result.email;
        }

        return result;
      });

      return NextResponse.json({ missionaries: missionariesWithDuration });
    }

    // Otherwise, this is a create missionary request
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
      title, // NOTE: changed from 'position' to 'title' to align with client form field
      group,
      start_date,
      end_date,
      duration,
      stake_name,
      gender,
      profile_picture_url,
      preferred_entry_method,
      last_login,
      street_address,
      address_city,
      person_type,
      address_state,
      zip_code,
      position_detail,
      type, // NEW: optional new column replacing/aliasing person_type
    } = body;

    console.log(JSON.stringify(body, null, 2));

    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Email, first name, and last name are required" },
        { status: 400 }
      );
    }

    // Validate assignment constraints if assignment_level is provided
    if (assignment_level) {
      // Normalize empty strings to null for validation
      const normalizedCityId =
        city_id && city_id.trim() !== "" ? city_id : null;
      const normalizedCommunityId =
        community_id && community_id.trim() !== "" ? community_id : null;

      if (
        assignment_level === "state" &&
        (normalizedCityId || normalizedCommunityId)
      ) {
        return NextResponse.json(
          { error: "State level assignments cannot have city or community" },
          { status: 400 }
        );
      }

      if (
        assignment_level === "city" &&
        (!normalizedCityId || normalizedCommunityId)
      ) {
        return NextResponse.json(
          { error: "City level assignments must have city but not community" },
          { status: 400 }
        );
      }

      if (assignment_level === "community" && !normalizedCommunityId) {
        return NextResponse.json(
          {
            error: "Community level assignments must have a community",
          },
          { status: 400 }
        );
      }
    }

    // Check for existing missionary with the same email
    const { data: existing, error: existingError } = await supabaseServer
      .from("missionaries")
      .select(
        `
        id,
        first_name,
        last_name,
        assignment_level,
        cities:city_id (name, state),
        communities:community_id (
          name,
          cities:city_id (name, state)
        )
      `
      )
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
      let locationMessage = "";
      if (existing.assignment_level === "state") {
        locationMessage = "at the Utah state level";
      } else if (existing.assignment_level === "city" && existing.cities) {
        locationMessage = `in ${existing.cities.name}, ${existing.cities.state}`;
      } else if (
        existing.assignment_level === "community" &&
        existing.communities
      ) {
        const communityCity = existing.communities.cities;
        locationMessage = `in ${existing.communities.name}${
          communityCity
            ? ` (${communityCity.name}, ${communityCity.state})`
            : ""
        }`;
      }

      return NextResponse.json(
        {
          error: `A missionary or volunteer with this email already exists ${locationMessage}.`,
          id: existing.id,
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseServer
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
        title: title || null, // now correctly persisting the provided title
        group: group || null,
        start_date: start_date || null,
        end_date: end_date || null,
        duration: duration || null,
        stake_name: stake_name || null,
        gender: gender || null,
        profile_picture_url: profile_picture_url || "",
        preferred_entry_method: preferred_entry_method || null,
        last_login: last_login || null,
        street_address: street_address || null,
        address_city: address_city || null,
        // Use person_type (the actual DB column name)
        person_type: person_type || type || null,
        address_state: address_state || null,
        zip_code: zip_code || null,
        position_detail: position_detail || null,
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
      end_date,
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
      person_type,
      position_detail,
      type, // NEW: optional new column replacing/aliasing person_type
    } = body;

    // Validate assignment constraints if assignment_level is provided
    if (assignment_level) {
      // Normalize empty strings to null for validation
      const normalizedCityId =
        city_id && city_id.trim() !== "" ? city_id : null;
      const normalizedCommunityId =
        community_id && community_id.trim() !== "" ? community_id : null;

      if (
        assignment_level === "state" &&
        (normalizedCityId || normalizedCommunityId)
      ) {
        return NextResponse.json(
          { error: "State level assignments cannot have city or community" },
          { status: 400 }
        );
      }

      if (
        assignment_level === "city" &&
        (!normalizedCityId || normalizedCommunityId)
      ) {
        return NextResponse.json(
          { error: "City level assignments must have city but not community" },
          { status: 400 }
        );
      }

      if (assignment_level === "community" && !normalizedCommunityId) {
        return NextResponse.json(
          {
            error: "Community level assignments must have a community",
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email if email is being updated
    if (email !== undefined) {
      const { data: existing, error: existingError } = await supabaseServer
        .from("missionaries")
        .select(
          `
          id,
          first_name,
          last_name,
          assignment_level,
          cities:city_id (name, state),
          communities:community_id (
            name,
            cities:city_id (name, state)
          )
        `
        )
        .eq("email", email)
        .neq("id", id)
        .maybeSingle();

      if (existingError) {
        console.error("Error checking for existing missionary:", existingError);
        return NextResponse.json(
          { error: "Error checking for existing missionary" },
          { status: 500 }
        );
      }

      if (existing) {
        let locationMessage = "";
        if (existing.assignment_level === "state") {
          locationMessage = "at the Utah state level";
        } else if (existing.assignment_level === "city" && existing.cities) {
          locationMessage = `in ${existing.cities.name}, ${existing.cities.state}`;
        } else if (
          existing.assignment_level === "community" &&
          existing.communities
        ) {
          const communityCity = existing.communities.cities;
          locationMessage = `in ${existing.communities.name}${
            communityCity
              ? ` (${communityCity.name}, ${communityCity.state})`
              : ""
          }`;
        }

        return NextResponse.json(
          {
            error: `A missionary or volunteer with this email already exists ${locationMessage}.`,
            id: existing.id,
          },
          { status: 409 }
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
    if (end_date !== undefined) updateData.end_date = end_date || null;
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
    // Use person_type (the actual DB column name)
    if (person_type !== undefined || type !== undefined)
      updateData.person_type = person_type || type || null;
    if (position_detail !== undefined)
      updateData.position_detail = position_detail || null;

    const { data, error } = await supabaseServer
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

    const { error } = await supabaseServer
      .from("missionaries")
      .delete()
      .eq("id", id);

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
