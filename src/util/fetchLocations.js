import { supabaseServer } from "./supabaseServer";

/**
 * Fetches cities and communities from the database server-side
 * Returns empty arrays if there's an error to ensure the app doesn't break
 */
export async function fetchCitiesAndCommunities() {
  try {
    // Fetch cities and communities in parallel for better performance
    const [citiesResponse, communitiesResponse] = await Promise.all([
      supabaseServer
        .from("cities")
        .select("*")
        .order("state", { ascending: true })
        .order("name", { ascending: true }),
      supabaseServer
        .from("communities")
        .select("*")
        .order("state", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    if (citiesResponse.error) {
      console.error("Error fetching cities:", citiesResponse.error);
      return { cities: [], communities: [] };
    }

    if (communitiesResponse.error) {
      console.error("Error fetching communities:", communitiesResponse.error);
      return { cities: citiesResponse.data || [], communities: [] };
    }

    return {
      cities: citiesResponse.data || [],
      communities: communitiesResponse.data || [],
    };
  } catch (error) {
    console.error("Error in fetchCitiesAndCommunities:", error);
    return { cities: [], communities: [] };
  }
}
