/**
 * Helpers to exclude dev/test cities and communities from user-facing queries.
 * Supabase tables expose `is_dev boolean not null default false`.
 */

export function applyProductionCityFilter(query) {
  return query.eq("is_dev", false);
}

export function applyProductionCommunityFilter(query) {
  return query.eq("is_dev", false);
}

export function isProductionCity(city) {
  return Boolean(city) && city.is_dev !== true;
}

export function isProductionCommunity(community) {
  return Boolean(community) && community.is_dev !== true;
}

export function filterProductionCities(cities) {
  return (cities || []).filter(isProductionCity);
}

export function filterProductionCommunities(communities) {
  return (communities || []).filter(isProductionCommunity);
}

/** PostgREST query string fragment for raw fetch() calls */
export const PRODUCTION_CITY_QUERY = "is_dev=eq.false";
export const PRODUCTION_COMMUNITY_QUERY = "is_dev=eq.false";
