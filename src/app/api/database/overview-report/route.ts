import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/util/supabaseServer";
import { connectToMongoDatabase } from "@/util/db/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Mapping from new community IDs to old ones (same as in AdminReportsPage / ClassPage)
const newToOldCommunity: Record<string, string> = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd",
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "fb34e335-5cc6-4e6c-b5fc-2b64588fe921",
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33",
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34",
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35",
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37",
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38",
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39",
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a",
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b",
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c",
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d",
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6838adb32243dc8160ce207d",
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e",
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f",
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40",
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed",
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": "6912655528c9b9c20ee4dede",
};

/**
 * POST - Fetch MyHometown Overview Report data.
 * Body: { communityIds: string[], startDate?: string, endDate?: string }
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
        console.error("[overview-report] Error fetching communities by id:", error);
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
        console.error("[overview-report] Error fetching communities by mongo_id:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (data) communities = communities.concat(data);
    }

    const resolvedCommunityIds = communities.map((c: any) => c.id);

    if (resolvedCommunityIds.length === 0) {
      return NextResponse.json({
        communities: [],
        missionaries: [],
        hours: [],
        dosProjects: [],
        classCounts: {},
      });
    }

    // 2. Fetch all active missionaries in selected communities
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
        console.error("[overview-report] Error fetching missionaries:", error);
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

    // 3. Fetch hours WITH activities JSONB
    const missionaryIds = allMissionaries.map((m) => m.id);
    let allHours: any[] = [];

    if (missionaryIds.length > 0) {
      const idChunkSize = 50;
      for (let i = 0; i < missionaryIds.length; i += idChunkSize) {
        const idChunk = missionaryIds.slice(i, i + idChunkSize);
        let hoursFrom = 0;
        let hoursHasMore = true;

        while (hoursHasMore) {
          let query = supabase
            .from("missionary_hours")
            .select(
              "id, missionary_id, total_hours, period_start_date, entry_method, activities",
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
            console.error("[overview-report] Error fetching hours:", error);
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

    // 4. Fetch DOS project forms for selected communities
    let allDosProjects: any[] = [];
    {
      const idChunkSize = 50;
      for (let i = 0; i < resolvedCommunityIds.length; i += idChunkSize) {
        const idChunk = resolvedCommunityIds.slice(i, i + idChunkSize);
        let dosFrom = 0;
        let dosHasMore = true;

        while (dosHasMore) {
          let query = supabase
            .from("days_of_service_project_forms")
            .select(
              "id, community_id, actual_volunteers, actual_project_duration, date_of_service",
            )
            .in("community_id", idChunk)
            .range(dosFrom, dosFrom + pageSize - 1);

          if (startDate) {
            query = query.gte("date_of_service", startDate);
          }
          if (endDate) {
            query = query.lte("date_of_service", endDate);
          }

          const { data, error } = await query;

          if (error) {
            console.error("[overview-report] Error fetching DOS projects:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          if (data && data.length > 0) {
            allDosProjects = allDosProjects.concat(data);
            dosFrom += pageSize;
            dosHasMore = data.length === pageSize;
          } else {
            dosHasMore = false;
          }
        }
      }
    }

    // 5. Fetch CRC class counts from MongoDB per community
    const classCounts: Record<string, number> = {};
    try {
      const { db } = await connectToMongoDatabase();
      const classesCollection = db.collection("Classes");

      for (const community of communities) {
        // Try the old mongo community ID first, then the supabase UUID
        const oldId =
          newToOldCommunity[community.id] || community.mongo_id || community.id;

        const count = await classesCollection.countDocuments({
          communityId: oldId,
        });
        classCounts[community.id] = count;
      }
    } catch (mongoErr: any) {
      console.error(
        "[overview-report] Error fetching class counts from MongoDB:",
        mongoErr,
      );
      // Non-fatal — class counts will just be 0
    }

    return NextResponse.json({
      communities: communities || [],
      missionaries: allMissionaries,
      hours: allHours,
      dosProjects: allDosProjects,
      classCounts,
    });
  } catch (err: any) {
    console.error("[overview-report] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
