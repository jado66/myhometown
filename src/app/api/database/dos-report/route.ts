import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/util/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST - Fetch Days of Service report data.
 * Body: { communityIds: string[], startDate?: string, endDate?: string }
 *
 * Returns days_of_service events and their associated project forms
 * for the selected communities and date range.
 */
export async function POST(request: NextRequest) {
  try {
    const { communityIds, startDate, endDate } = await request.json();

    if (!communityIds || communityIds.length === 0) {
      return NextResponse.json(
        { error: "communityIds is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer();

    // Separate incoming IDs into UUIDs and MongoDB ObjectIds
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidIds = communityIds.filter((id: string) => uuidRegex.test(id));
    const mongoIds = communityIds.filter((id: string) => !uuidRegex.test(id));

    // 1. Fetch communities with city info
    let communities: any[] = [];

    if (uuidIds.length > 0) {
      const { data, error } = await supabase
        .from("communities")
        .select(
          "id, name, city_id, mongo_id, cities:communities_city_id_fkey ( id, name, state )",
        )
        .in("id", uuidIds);
      if (error) {
        console.error("[dos-report] Error fetching communities by id:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (data) communities = communities.concat(data);
    }

    if (mongoIds.length > 0) {
      const { data, error } = await supabase
        .from("communities")
        .select(
          "id, name, city_id, mongo_id, cities:communities_city_id_fkey ( id, name, state )",
        )
        .in("mongo_id", mongoIds);
      if (error) {
        console.error(
          "[dos-report] Error fetching communities by mongo_id:",
          error,
        );
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (data) communities = communities.concat(data);
    }

    const resolvedCommunityIds = communities.map((c: any) => c.id);

    if (resolvedCommunityIds.length === 0) {
      return NextResponse.json({
        communities: [],
        daysOfService: [],
        projects: [],
      });
    }

    // 2. Fetch all days_of_service events for selected communities
    const pageSize = 1000;
    let allDaysOfService: any[] = [];

    {
      const idChunkSize = 50;
      for (let i = 0; i < resolvedCommunityIds.length; i += idChunkSize) {
        const idChunk = resolvedCommunityIds.slice(i, i + idChunkSize);
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          let query = supabase
            .from("days_of_service")
            .select("*")
            .in("community_id", idChunk)
            .range(from, from + pageSize - 1);

          // Filter by date range using end_date (the actual service date)
          if (startDate) {
            query = query.gte("end_date", startDate);
          }
          if (endDate) {
            query = query.lte("end_date", endDate);
          }

          const { data, error } = await query;

          if (error) {
            console.error(
              "[dos-report] Error fetching days of service:",
              error,
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          if (data && data.length > 0) {
            allDaysOfService = allDaysOfService.concat(data);
            from += pageSize;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }
      }
    }

    // 3. Fetch all project forms for selected communities
    let allProjects: any[] = [];

    {
      const idChunkSize = 50;
      for (let i = 0; i < resolvedCommunityIds.length; i += idChunkSize) {
        const idChunk = resolvedCommunityIds.slice(i, i + idChunkSize);
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          let query = supabase
            .from("days_of_service_project_forms")
            .select("*")
            .in("community_id", idChunk)
            .range(from, from + pageSize - 1);

          // Filter by date_of_service if the column exists and dates are provided
          if (startDate) {
            query = query.gte("date_of_service", startDate);
          }
          if (endDate) {
            query = query.lte("date_of_service", endDate);
          }

          const { data, error } = await query;

          if (error) {
            console.error("[dos-report] Error fetching DOS projects:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          if (data && data.length > 0) {
            allProjects = allProjects.concat(data);
            from += pageSize;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }
      }
    }

    return NextResponse.json({
      communities: communities || [],
      daysOfService: allDaysOfService,
      projects: allProjects,
    });
  } catch (err: any) {
    console.error("[dos-report] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
