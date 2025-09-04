// app/api/database/missionary-hours/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabaseServer";

// GET - Fetch missionary hours
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionaryId = searchParams.get("missionary_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const entryMethod = searchParams.get("entry_method");

    let query = supabaseServer
      .from("missionary_hours")
      .select(
        `
        *,
        missionaries (
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .order("period_start_date", { ascending: false });

    // Apply filters
    if (missionaryId) {
      query = query.eq("missionary_id", missionaryId);
    }

    if (startDate) {
      query = query.gte("period_start_date", startDate);
    }

    if (endDate) {
      query = query.lte("period_start_date", endDate);
    }

    if (entryMethod) {
      query = query.eq("entry_method", entryMethod);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch missionary hours" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hours: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new hours entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      missionary_id,
      period_start_date,
      entry_method,
      total_hours,
      location,
      activities,
    } = body;

    // Validate required fields
    if (!missionary_id || !period_start_date || !entry_method || !total_hours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate entry_method
    if (!["weekly", "monthly"].includes(entry_method)) {
      return NextResponse.json(
        { error: "Invalid entry method. Must be weekly or monthly" },
        { status: 400 }
      );
    }

    // Validate total_hours
    const hours = parseFloat(total_hours);
    if (isNaN(hours) || hours < 0 || hours > 168) {
      // Max 168 hours per week
      return NextResponse.json(
        { error: "Invalid hours. Must be between 0 and 168" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("missionary_hours")
      .insert([
        {
          missionary_id,
          period_start_date,
          entry_method,
          total_hours: hours,
          location: location || null,
          activities: activities || null,
        },
      ])
      .select(
        `
        *,
        missionaries (
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);

      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Hours already recorded for this missionary and period" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create hours entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Hours entry created successfully",
        hours: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update hours entry
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Hours ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { total_hours, location, activities } = body;

    const updateData: any = {};

    if (total_hours !== undefined) {
      const hours = parseFloat(total_hours);
      if (isNaN(hours) || hours < 0 || hours > 168) {
        return NextResponse.json(
          { error: "Invalid hours. Must be between 0 and 168" },
          { status: 400 }
        );
      }
      updateData.total_hours = hours;
    }

    if (location !== undefined) {
      updateData.location = location;
    }

    if (activities !== undefined) {
      updateData.activities = activities;
    }

    const { data, error } = await supabaseServer
      .from("missionary_hours")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        missionaries (
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update hours entry" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Hours entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Hours entry updated successfully",
      hours: data,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete hours entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Hours ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("missionary_hours")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete hours entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Hours entry deleted successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
