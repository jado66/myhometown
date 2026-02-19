import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/util/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST - Fetch MVMS hours report data.
 * Body: { communityIds: string[], startDate?: string, endDate?: string }
 *
 * Returns missionaries grouped by community (with city info),
 * along with their logged hours in the date range.
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

    // 1. Fetch communities with city info — by `id` for UUIDs, by `mongo_id` for Mongo IDs
    let communities: any[] = [];

    if (uuidIds.length > 0) {
      const { data, error } = await supabase
        .from("communities")
        .select(
          "id, name, city_id, mongo_id, cities:communities_city_id_fkey ( id, name, state )",
        )
        .in("id", uuidIds);
      if (error) {
        console.error(
          "[mvms-hours-report] Error fetching communities by id:",
          error,
        );
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
          "[mvms-hours-report] Error fetching communities by mongo_id:",
          error,
        );
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (data) communities = communities.concat(data);
    }

    // Use the resolved Supabase UUIDs for all subsequent queries
    const resolvedCommunityIds = communities.map((c: any) => c.id);

    if (resolvedCommunityIds.length === 0) {
      return NextResponse.json({
        communities: [],
        missionaries: [],
        hours: [],
      });
    }

    // 2. Fetch all missionaries (active) in selected communities using pagination
    const pageSize = 1000;
    let allMissionaries: any[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("missionaries")
        .select("id, first_name, last_name, community_id, person_type")
        .in("community_id", resolvedCommunityIds)
        .in("assignment_status", ["active"])
        .range(from, from + pageSize - 1);

      if (error) {
        console.error(
          "[mvms-hours-report] Error fetching missionaries:",
          error,
        );
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data && data.length > 0) {
        allMissionaries = allMissionaries.concat(data);
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    // 3. Fetch hours for those missionaries in the date range using pagination
    const missionaryIds = allMissionaries.map((m) => m.id);
    let allHours: any[] = [];

    if (missionaryIds.length > 0) {
      // Batch fetch in small chunks — Supabase .in() with UUIDs creates large URLs
      // that can exceed request size limits, so keep chunks small
      const idChunkSize = 50;
      for (let i = 0; i < missionaryIds.length; i += idChunkSize) {
        const idChunk = missionaryIds.slice(i, i + idChunkSize);
        let hoursFrom = 0;
        let hoursHasMore = true;

        while (hoursHasMore) {
          let query = supabase
            .from("missionary_hours")
            .select(
              "id, missionary_id, total_hours, period_start_date, entry_method",
            )
            .in("missionary_id", idChunk)
            .range(hoursFrom, hoursFrom + pageSize - 1);

          if (startDate) {
            query = query.gte("period_start_date", startDate);
          }
          if (endDate) {
            query = query.lte("period_start_date", endDate);
          }

          const { data, error } = await query;

          if (error) {
            console.error("[mvms-hours-report] Error fetching hours:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          if (data && data.length > 0) {
            allHours = allHours.concat(data);
            hoursFrom += pageSize;
            hoursHasMore = data.length === pageSize;
          } else {
            hoursHasMore = false;
          }
        }
      }
    }

    return NextResponse.json({
      communities: communities || [],
      missionaries: allMissionaries,
      hours: allHours,
    });
  } catch (err: any) {
    console.error("[mvms-hours-report] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
