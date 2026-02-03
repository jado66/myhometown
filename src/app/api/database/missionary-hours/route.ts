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
      `,
      )
      .order("period_start_date", { ascending: false })
      .order("created_at", { ascending: false });

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

    // If no date filters provided, default to current year to avoid loading too much data
    if (!startDate && !endDate) {
      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      query = query.gte("period_start_date", yearStart);
      console.log(
        "[API missionary-hours GET] No date filter provided, defaulting to current year:",
        currentYear,
      );
    }

    console.log("[API missionary-hours GET] Executing query...");

    // Fetch all records using pagination to bypass 1000 row limit
    let allData: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      // Build query with filters for this page
      let pageQuery = supabaseServer
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
        `,
        )
        .order("period_start_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      // Apply filters
      if (missionaryId) {
        pageQuery = pageQuery.eq("missionary_id", missionaryId);
      }

      if (startDate) {
        pageQuery = pageQuery.gte("period_start_date", startDate);
      }

      if (endDate) {
        pageQuery = pageQuery.lte("period_start_date", endDate);
      }

      if (entryMethod) {
        pageQuery = pageQuery.eq("entry_method", entryMethod);
      }

      // If no date filters provided, default to current year
      if (!startDate && !endDate) {
        const currentYear = new Date().getFullYear();
        const yearStart = `${currentYear}-01-01`;
        pageQuery = pageQuery.gte("period_start_date", yearStart);
      }

      const { data: pageData, error: pageError } = await pageQuery;

      if (pageError) {
        console.error("[API missionary-hours GET] Page error:", pageError);
        return NextResponse.json(
          { error: "Failed to fetch missionary hours" },
          { status: 500 },
        );
      }

      if (!pageData || pageData.length === 0) {
        hasMore = false;
      } else {
        allData = allData.concat(pageData);
        from += pageSize;

        // If we got fewer records than pageSize, we've reached the end
        if (pageData.length < pageSize) {
          hasMore = false;
        }
      }
    }

    // TEMPORARY: Get count of all records for this missionary to debug
    if (missionaryId) {
      const { count: totalCount } = await supabaseServer
        .from("missionary_hours")
        .select("*", { count: "exact", head: true })
        .eq("missionary_id", missionaryId);

      console.log(
        "[API missionary-hours GET] Total records in DB for this missionary:",
        totalCount,
      );
    }

    if (allData.length === 0) {
      return NextResponse.json({
        hours: [],
        count: 0,
      });
    }

    // Log what we're returning

    return NextResponse.json({
      hours: allData,
      count: allData.length,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    // Validate entry_method
    if (!["weekly", "monthly"].includes(entry_method)) {
      return NextResponse.json(
        { error: "Invalid entry method. Must be weekly or monthly" },
        { status: 400 },
      );
    }

    // Validate total_hours
    const hours = parseFloat(total_hours);
    if (isNaN(hours) || hours < 0 || hours > 168) {
      // Max 168 hours per week
      return NextResponse.json(
        { error: "Invalid hours. Must be between 0 and 168" },
        { status: 400 },
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
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);

      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Hours already recorded for this missionary and period" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create hours entry" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Hours entry created successfully",
        hours: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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
        { status: 400 },
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
          { status: 400 },
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
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update hours entry" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Hours entry not found" },
        { status: 404 },
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
      { status: 500 },
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
        { status: 400 },
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
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Hours entry deleted successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
