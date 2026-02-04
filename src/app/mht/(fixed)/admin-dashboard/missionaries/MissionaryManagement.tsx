"use client";
import React, { useState, useEffect, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Loading from "@/components/util/Loading";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  TablePagination,
  Badge,
} from "@mui/material";
import {
  Add,
  Schedule,
  Person,
  Download,
  Upload,
  ViewModule,
  CheckCircle,
  Business,
  LocationCity,
  ViewList,
  BarChart,
  Group,
} from "@mui/icons-material";
import ImportMissionaryCsvHelpDialog from "@/components/missionaries/ImportMissionaryCsvHelpDialog";
import { SearchAndFilter } from "./SearchAndFilter";
import { MissionaryCard } from "./MissionaryCard";
import { MissionaryListView } from "./MissionaryListView";
import { HoursOverview } from "./HoursOverview";
import { useMissionaryHours } from "@/hooks/use-missionary-hours";
import { AggregateStats } from "./AggregateStats";
import { useUser } from "@/contexts/UserProvider";
import useManageCities from "@/hooks/use-manage-cities";
import { MissionaryDialog } from "./MissionaryDialog";
import { UpcomingReleases } from "./UpcomingReleases";
import { useLocalStorage } from "@/hooks/use-local-storage";
import ProfilePictureDialog from "./ProfilePictureDialog";
import { toast } from "react-toastify";
import PermissionGuard from "@/guards/permission-guard";
import VolunteerSignupsTable from "@/components/volunteers/VolunteerSignupsTable";
import { useVolunteerSignups } from "@/hooks/use-volunteer-signups";
import { useCommunitiesSupabase } from "@/hooks/use-communities-supabase";
import { useCitiesSupabase } from "@/hooks/use-cities-supabase";

// NOTE: Using loosely typed missionary records to avoid conflicts with existing global Missionary type.

interface City {
  _id: string;
  id: string;
  name: string;
  state: string;
}

interface Community {
  _id: string;
  id: string;
  name: string;
  city: string;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  assignmentLevels: string[];
  assignmentStatus: string[];
  selectedCityId: string | null;
  selectedCommunityId: string | null;
  personType: "all" | "missionary" | "volunteer";
  upcomingReleaseDays?: 30 | 60 | 90;
}

interface ImportSummary {
  success: number;
  duplicates: { email: string; name: string }[];
  failed: { email: string; reason: string }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

type ViewMode = "card" | "list";

// Back to:
export default function MissionaryManagement() {
  const [missionaries, setMissionaries] = useState<any[] | null>(null);
  const { user } = useUser();
  const { cities } = useCitiesSupabase(user);
  const { communities } = useCommunitiesSupabase(user);
  const [tabValue, setTabValue] = useLocalStorage("missionary-tab-value", 0);

  // Debug logging
  useEffect(() => {
    console.log(
      "MissionaryManagement - communities:",
      communities,
      "length:",
      communities?.length,
    );
  }, [communities]);

  // Profile picture dialog state
  const [profilePicDialogOpen, setProfilePicDialogOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [profilePicName, setProfilePicName] = useState<string | null>(null);

  const handleProfilePictureClick = (
    url: string | null,
    profilePic: string | null,
  ) => {
    if (url) {
      setProfilePicUrl(url);
      setProfilePicName(profilePic);
      setProfilePicDialogOpen(true);
    }
  };

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("missionary-view-mode");
      return (saved as ViewMode) || "card";
    }
    return "card";
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("missionary-view-mode", viewMode);
    }
  }, [viewMode]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMissionary, setSelectedMissionary] = useState<any | undefined>(
    undefined,
  );

  // Bulk import dialog state
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{
    valid: any[];
    errors: string[];
  }>({ valid: [], errors: [] });
  const [importSummary, setImportSummary] = useState<ImportSummary>({
    success: 0,
    duplicates: [],
    failed: [],
  });

  // CSV parsing and validation logic
  function parseCsv(text: string) {
    // Simple CSV parser (no quoted fields)
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return { header: [], rows: [] };
    const header = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj: any = {};
      header.forEach((h, i) => {
        obj[h] = values[i] ? values[i].trim() : "";
      });
      return obj;
    });
    return { header, rows };
  }

  function validateAndMapRows(
    rows: any[],
    cities: City[],
    communities: Community[],
  ) {
    const errors: string[] = [];
    const valid: any[] = [];
    const emailSet = new Set<string>();

    // Helper: case-insensitive trim compare
    const ciEquals = (a: string, b: string) =>
      a.trim().toLowerCase() === b.trim().toLowerCase();

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // 1-based, +1 for header
      // Determine if this is the new format (has Level column)
      const isNewFormat = Object.prototype.hasOwnProperty.call(row, "Level");

      // Required fields (support both old & new headers)
      const first_name = row["First Name"] || "";
      const last_name = row["Last Name"] || "";
      const email = row["Email"] || "";
      const assignment_status_raw = (row["Status"] || "").toLowerCase();
      const assignment_status = assignment_status_raw
        ? assignment_status_raw // keep raw lowercase internally; UI can format later
        : "";
      const assignment_level_raw = (
        row["Level"] ||
        row["Assignment Level"] ||
        ""
      ).toLowerCase();
      const assignment_level = assignment_level_raw
        ? assignment_level_raw // keep raw lowercase internally
        : "";

      // Person type mapping (new column). Accept "missionary" or "volunteer" only.
      const person_type_raw = (
        row["Type"] || // preferred header
        row["Person Type"] || // fallback header name
        ""
      ) // no default - now required
        .toLowerCase()
        .trim();
      // Type is now required
      if (!person_type_raw) {
        errors.push(`Row ${rowNum}: Type is required.`);
      } else if (!["missionary", "volunteer"].includes(person_type_raw)) {
        errors.push(
          `Row ${rowNum}: Type must be one of missionary, volunteer.`,
        );
      }

      // Assignment name (new format) or legacy City/Community columns
      let assignmentName = row["Assignment"] || "";
      const legacyCityName = row["City"] || "";
      const legacyCommunityName = row["Community"] || "";

      // For legacy format, infer assignmentName from City/Community columns
      if (!assignmentName) {
        if (assignment_level === "city" && legacyCityName)
          assignmentName = legacyCityName;
        else if (assignment_level === "community" && legacyCommunityName)
          assignmentName = legacyCommunityName;
      }

      // Skip completely empty rows
      const isEmptyRow =
        !first_name && !last_name && !email && !assignment_status;
      if (isEmptyRow) return;

      // Validate required fields
      if (!first_name) errors.push(`Row ${rowNum}: First Name is required.`);
      if (!last_name) errors.push(`Row ${rowNum}: Last Name is required.`);
      if (!email) errors.push(`Row ${rowNum}: Email is required.`);
      if (email && emailSet.has(email))
        errors.push(`Row ${rowNum}: Duplicate email '${email}'.`);
      if (email) emailSet.add(email);

      // Phone is now required
      const phone = row["Phone"] || "";
      if (!phone) errors.push(`Row ${rowNum}: Phone is required.`);

      if (
        !assignment_status_raw ||
        !["active", "inactive", "pending"].includes(assignment_status_raw)
      ) {
        errors.push(
          `Row ${rowNum}: Status must be one of active, inactive, pending.`,
        );
      }

      // Level is now required
      if (
        !assignment_level_raw ||
        !["state", "city", "community"].includes(assignment_level_raw)
      ) {
        errors.push(
          `Row ${rowNum}: Level is required and must be one of state, city, community.`,
        );
      }

      // Assignment is now always required (regardless of level)
      if (!assignmentName) {
        errors.push(`Row ${rowNum}: Assignment is required.`);
      }

      // Assignment resolution (populate IDs based on provided names)
      let city_id: string | null = null;
      let community_id: string | null = null;
      if (assignment_level_raw === "city") {
        if (assignmentName) {
          const city = cities.find((c) => ciEquals(c.name, assignmentName));
          if (!city) {
            errors.push(`Row ${rowNum}: City '${assignmentName}' not found.`);
          } else {
            city_id = city.id;
          }
        }
      } else if (assignment_level_raw === "community") {
        if (assignmentName) {
          // Find all communities matching the given name (case-insensitive)
          const matchingCommunities = communities.filter((c) =>
            ciEquals(c.name, assignmentName),
          );
          if (matchingCommunities.length === 0) {
            // Fallback: attempt fuzzy (includes) match if no exact match
            const fuzzy = communities.filter((c) =>
              c.name.toLowerCase().includes(assignmentName.toLowerCase()),
            );
            if (fuzzy.length === 1) {
              community_id = fuzzy[0].id;
              city_id = fuzzy[0].city;
              console.debug(
                `CSV import row ${rowNum}: Resolved community '${assignmentName}' via fuzzy match to '${fuzzy[0].name}'.`,
              );
            } else if (fuzzy.length > 1) {
              errors.push(
                `Row ${rowNum}: Community '${assignmentName}' has multiple fuzzy matches (${fuzzy
                  .map((c) => c.name)
                  .join(
                    ", ",
                  )}). Provide an Assignment City column to disambiguate.`,
              );
            } else {
              errors.push(
                `Row ${rowNum}: Community '${assignmentName}' not found.`,
              );
            }
          } else if (matchingCommunities.length === 1) {
            community_id = matchingCommunities[0].id;
            // Also derive city_id automatically from community
            city_id = matchingCommunities[0].city;
          } else {
            // Attempt disambiguation using a City column (if present) or Address City
            const possibleCityName = (
              row["Assignment City"] ||
              row["City"] ||
              ""
            ).trim();
            if (possibleCityName) {
              // c.city holds a city ID; we must map ID -> city object -> name for comparison.
              const narrowed = matchingCommunities.filter((c) => {
                const cityObj = cities.find((city) => city.id === c.city);
                return cityObj
                  ? ciEquals(cityObj.name, possibleCityName)
                  : false;
              });
              if (narrowed.length === 1) {
                community_id = narrowed[0].id;
                city_id = narrowed[0].city;
              } else if (narrowed.length === 0) {
                errors.push(
                  `Row ${rowNum}: Community '${assignmentName}' found in other cities but not in '${possibleCityName}'.`,
                );
              } else {
                errors.push(
                  `Row ${rowNum}: Ambiguous community '${assignmentName}' in multiple cities. Provide an Assignment City column to disambiguate.`,
                );
              }
            } else {
              errors.push(
                `Row ${rowNum}: Community '${assignmentName}' exists in multiple cities. Add an 'Assignment City' column with the city name to disambiguate.`,
              );
            }
          }
        }
      } else if (assignment_level_raw === "state") {
        // For state level, Assignment must be 'Utah' (case-insensitive)
        if (assignmentName && assignmentName.toLowerCase() !== "utah") {
          errors.push(
            `Row ${rowNum}: Assignment must be 'Utah' for Level 'state'.`,
          );
        }
      }

      // If no row-specific errors, map to DB fields
      const rowErrors = errors.filter((e) => e.startsWith(`Row ${rowNum}:`));
      // Additional safeguard: if community level but we failed to resolve community_id, flag an error
      if (
        rowErrors.length === 0 &&
        assignment_level_raw === "community" &&
        !community_id
      ) {
        errors.push(
          `Row ${rowNum}: Could not resolve community '${assignmentName}'.`,
        );
      }
      const finalRowErrors = errors.filter((e) =>
        e.startsWith(`Row ${rowNum}:`),
      );
      if (finalRowErrors.length === 0) {
        const start_date = row["Start Date"] || "";
        const end_date = row["End Date"] || "";
        let duration = row["Duration"] || ""; // legacy support
        if (!duration && start_date && end_date) {
          try {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              const diffTime = Math.abs(
                endDate.getTime() - startDate.getTime(),
              );
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const months = Math.round(diffDays / 30.44);
              duration = `${months} months`;
            }
          } catch {}
        }

        // Address fields: new format uses City/State for address; legacy uses Address City/Address State
        const street_address = row["Street Address"] || "";
        const address_city = isNewFormat
          ? row["City"] || ""
          : row["Address City"] || "";
        const address_state = isNewFormat
          ? row["State"] || ""
          : row["Address State"] || "";
        const zip_code = row["Zip Code"] || "";
        const stake_name = row["Home Stake"] || row["Stake Name"] || "";
        const gender = (row["Gender"] || "").toLowerCase().trim();
        const position = row["Position"] || row["Title"] || "";

        // Position is now required
        if (!position) {
          errors.push(`Row ${rowNum}: Position is required.`);
        }

        // Address fields are now required
        if (!street_address) {
          errors.push(`Row ${rowNum}: Street Address is required.`);
        }
        if (!address_city) {
          errors.push(`Row ${rowNum}: City is required.`);
        }
        if (!address_state) {
          errors.push(`Row ${rowNum}: State is required.`);
        }
        if (!zip_code) {
          errors.push(`Row ${rowNum}: Zip Code is required.`);
        }

        valid.push({
          first_name,
          last_name,
          email,
          contact_number: phone,
          assignment_status,
          assignment_level,
          city_id,
          community_id,
          // Position column should map to the database 'title' field; keep group strictly from 'Group'
          group: row["Group"] || "",
          title: position,
          position_detail: row["Position Detail"] || "",
          start_date,
          end_date,
          duration,
          street_address,
          address_city,
          address_state,
          zip_code,
          stake_name,
          notes: row["Notes"] || "",
          person_type: person_type_raw || "missionary",
          gender: gender || null,
        });
      }
    });

    return { valid, errors };
  }

  // Handler for missionary CSV import
  const handleImportMissionaryCsv = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setImportError(null);
    setImportResults({ valid: [], errors: [] });
    setImportSummary({ success: 0, duplicates: [], failed: [] });
    setImporting(false);

    if (!file) return;

    // Read CSV text
    const text = await file.text();
    const { header, rows } = parseCsv(text);

    if (!header.length || !rows.length) {
      setImportError("CSV file is empty or invalid.");
      return;
    }

    // Fetch ALL cities & communities directly from Supabase (not limited by current hooks)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        setImportError("Missing Supabase environment variables.");
        return;
      }

      const headers = {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      } as Record<string, string>;

      const [citiesResp, communitiesResp] = await Promise.all([
        fetch(
          `${supabaseUrl}/rest/v1/cities?select=id,name,state,country&order=name`,
          { headers },
        ),
        fetch(
          `${supabaseUrl}/rest/v1/communities?select=id,name,city_id,state,country&order=name`,
          { headers },
        ),
      ]);

      if (!citiesResp.ok || !communitiesResp.ok) {
        setImportError("Failed to fetch locations from database.");
        return;
      }

      const rawCities = await citiesResp.json();
      const rawCommunities = await communitiesResp.json();

      // Normalize to existing shapes expected by validateAndMapRows
      const allCities: City[] = (rawCities || []).map((c: any) => ({
        _id: c.id,
        id: c.id,
        name: c.name,
        state: c.state,
      }));

      const allCommunities: Community[] = (rawCommunities || []).map(
        (c: any) => ({
          _id: c.id,
          id: c.id,
          name: c.name,
          city: c.city_id, // match existing interface (city holds city id)
        }),
      );

      const results = validateAndMapRows(rows, allCities, allCommunities);
      setImportResults(results);

      if (results.errors.length > 0) {
        setImportError("Some rows have errors. Please fix them and re-upload.");
      } else {
        setImportError(null);
      }
    } catch (err: any) {
      console.error("Bulk import: location fetch/validation error", err);
      setImportError(
        err?.message || "Unexpected error fetching locations for validation.",
      );
    }
  };

  // Handler to actually submit valid missionaries to the API
  const handleBulkImportSubmit = async () => {
    if (!importResults.valid.length) return;

    setImporting(true);
    setImportSummary({ success: 0, duplicates: [], failed: [] });

    const summary: ImportSummary = { success: 0, duplicates: [], failed: [] };

    try {
      // New bulk API endpoint usage
      const res = await fetch("/api/database/missionaries/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionaries: importResults.valid }),
      });

      if (!res.ok) {
        let reason = res.statusText;
        try {
          reason = await res.text();
        } catch {}
        toast.error(`Bulk import failed: ${reason}`);
        setImportError(`Bulk import failed: ${reason}`);
        return;
      }

      const result = await res.json();
      summary.success = result?.summary?.inserted || 0;
      summary.duplicates = result?.duplicates || [];
      if (Array.isArray(result?.invalid)) {
        result.invalid.forEach((inv: any) => {
          summary.failed.push({
            email: inv.email || `index-${inv.index}`,
            reason: (inv.errors || []).join("; "),
          });
        });
      }

      setImportSummary(summary);
      await fetchMissionaries();

      const parts: string[] = [];
      if (summary.success) parts.push(`${summary.success} imported`);
      if (summary.duplicates.length)
        parts.push(`${summary.duplicates.length} duplicate skipped`);
      if (summary.failed.length) parts.push(`${summary.failed.length} failed`);
      const message = parts.join(", ");
      if (summary.failed.length === 0) {
        toast.success(`Import complete: ${message}`);
      } else if (summary.success) {
        toast.warn(`Import partial: ${message}`);
      } else {
        toast.error(`Import failed: ${message || "No rows imported"}`);
      }
    } catch (err) {
      console.error("Bulk import unexpected error", err);
      toast.error("Unexpected error importing missionaries");
      setImportError(
        (err as any)?.message || "Unexpected error importing missionaries",
      );
    } finally {
      setImporting(false);
    }
  };

  // Single source of truth for filters
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    statusFilter: "all",
    assignmentLevels: [],
    assignmentStatus: ["pending", "active"],
    selectedCityId: null,
    selectedCommunityId: null,
    personType: "all",
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
  };

  // Helpful typed lists
  const cityList = (cities || []) as City[];
  const communityList = (communities || []) as Community[];

  // Sync individual filter states for filtering logic
  const searchTerm = filters.searchTerm;
  const statusFilter = filters.statusFilter;
  const assignmentLevels = filters.assignmentLevels;
  const assignmentStatus = filters.assignmentStatus;
  const selectedCityId = filters.selectedCityId;
  const selectedCommunityId = filters.selectedCommunityId;
  const personType = filters.personType;

  // Fetch missionaries when user is loaded
  useEffect(() => {
    if (user) {
      fetchMissionaries();
    }
  }, [user]);

  const fetchMissionaries = async () => {
    if (!user) {
      // Prevent fetching if user is not loaded
      return;
    }
    try {
      const response = await fetch("/api/database/missionaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch missionaries");
      }
      const data = await response.json();
      setMissionaries(data.missionaries || []);
    } catch (error) {
      setMissionaries([]); // fallback to empty array on error
      console.error("Error fetching missionaries:", error);
    }
  };

  const filteredMissionaries = (missionaries || [])
    .filter((missionary) => {
      const fullName =
        `${missionary.first_name} ${missionary.last_name}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        fullName.includes(searchLower) ||
        missionary.first_name.toLowerCase().includes(searchLower) ||
        missionary.last_name.toLowerCase().includes(searchLower) ||
        missionary.email.toLowerCase().includes(searchLower) ||
        (missionary.title || "").toLowerCase().includes(searchLower) ||
        (missionary.position_detail || "")
          .toLowerCase()
          .includes(searchLower) ||
        (missionary.group || "").toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "all" ||
        missionary.assignment_status.toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesLevel =
        assignmentLevels.length === 0 ||
        assignmentLevels.includes(missionary.assignment_level?.toLowerCase());

      const matchesAssignmentStatus =
        assignmentStatus.length === 0 ||
        assignmentStatus.includes(missionary.assignment_status?.toLowerCase());

      const matchesCity =
        !selectedCityId || missionary.city_id === selectedCityId;

      const matchesCommunity =
        !selectedCommunityId || missionary.community_id === selectedCommunityId;

      const matchesPersonType =
        personType === "all" || missionary.person_type === personType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLevel &&
        matchesAssignmentStatus &&
        matchesCity &&
        matchesCommunity &&
        matchesPersonType
      );
    })
    .sort((a, b) => {
      const lastNameA = (a.last_name || "").toLowerCase();
      const lastNameB = (b.last_name || "").toLowerCase();
      return lastNameA.localeCompare(lastNameB);
    });

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [
    searchTerm,
    statusFilter,
    assignmentLevels,
    assignmentStatus,
    selectedCityId,
    selectedCommunityId,
    personType,
  ]);

  // Ensure page is not out of bounds after filtering
  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(filteredMissionaries.length / rowsPerPage) - 1,
    );
    if (page > maxPage) setPage(maxPage);
  }, [filteredMissionaries.length, rowsPerPage, page]);

  const paginatedMissionaries = filteredMissionaries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // Fetch missionary hours
  const {
    hours,
    loading: hoursLoading,
    error: hoursError,
  } = useMissionaryHours();

  // Fetch volunteer signups for badge count
  const { signups: volunteerSignups } = useVolunteerSignups(null, "", user);
  const uncontactedVolunteersCount = useMemo(() => {
    return (volunteerSignups || []).filter((s: any) => !s.is_contacted).length;
  }, [volunteerSignups]);

  // Calculate critical releases count (within 30 days) based on filtered missionaries
  const criticalReleasesCount = useMemo(() => {
    const now = new Date();
    return (filteredMissionaries || []).filter((m: any) => {
      if (!m.start_date || !m.duration) return false;
      const monthsMatch = m.duration.match(/(\d+)/);
      if (!monthsMatch) return false;
      const months = parseInt(monthsMatch[1], 10);
      if (isNaN(months)) return false;
      const releaseDate = new Date(m.start_date);
      releaseDate.setMonth(releaseDate.getMonth() + months);
      const diffTime = releaseDate.getTime() - now.getTime();
      const daysUntilRelease = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return daysUntilRelease > 0 && daysUntilRelease <= 30;
    }).length;
  }, [filteredMissionaries]);

  const handleExportCSV = () => {
    // Helper function to calculate hours for a missionary
    const getHoursData = (missionaryId: string) => {
      const missionaryHours = (hours || []).filter(
        (h) => h.missionary_id === missionaryId,
      );

      // Calculate total hours
      const totalHours = missionaryHours.reduce((sum, h) => {
        const hoursValue = h.total_hours || 0;
        return sum + hoursValue;
      }, 0);

      // Calculate current month hours
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const currentMonthHours = missionaryHours
        .filter((h) => {
          if (!h.period_start_date) return false;
          const periodStart = new Date(h.period_start_date + "T00:00:00.000Z");
          const periodYear = periodStart.getUTCFullYear();
          const periodMonth = periodStart.getUTCMonth();
          return periodYear === currentYear && periodMonth === currentMonth;
        })
        .reduce((sum, h) => sum + (h.total_hours || 0), 0);

      return { totalHours, currentMonthHours };
    };

    // New unified export format matching updated import template
    const header = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Status",
      "Level",
      "Assignment",
      "Type", // include for round-trip consistency
      "Gender",
      "Position",
      "Position Detail",
      "Hours This Month",
      "Total Hours",
      "Start Date",
      "End Date",
      "Street Address",
      "City",
      "State",
      "Zip Code",
      "Home Stake",
      "Notes",
    ];
    const rows = filteredMissionaries.map((m) => {
      let assignment = "";
      if (m.assignment_level?.toLowerCase() === "city") {
        assignment = cityList.find((c) => c.id === m.city_id)?.name || "";
      } else if (m.assignment_level?.toLowerCase() === "community") {
        assignment =
          communityList.find((c) => c.id === m.community_id)?.name || "";
      } else if (m.assignment_level?.toLowerCase() === "state") {
        // Export rule: state-level missionaries must have 'Utah' in Assignment per new business rule
        assignment = "Utah";
      }
      const hoursData = getHoursData(m.id);
      return {
        "First Name": m.first_name,
        "Last Name": m.last_name,
        Email: m.email,
        Phone: m.contact_number || "",
        Status: m.assignment_status,
        Level: m.assignment_level || "",
        Assignment: assignment,
        Type: m.person_type || "missionary",
        Gender: m.gender || "",
        // Updated mapping: Position now reflects missionary.title; Position Detail reflects position_detail
        Position: m.title || "",
        "Position Detail": m.position_detail || "",
        "Hours This Month": hoursData.currentMonthHours,
        "Total Hours": hoursData.totalHours,
        "Start Date": m.start_date
          ? new Date(m.start_date).toLocaleDateString("en-US")
          : "",
        "End Date": m.end_date
          ? new Date(m.end_date).toLocaleDateString("en-US")
          : "",
        "Street Address": m.street_address || "",
        City: m.address_city || "",
        State: m.address_state || "",
        "Zip Code": m.zip_code || "",
        "Home Stake": m.stake_name || "",
        Notes: m.notes || "",
      };
    });

    // CSV escaping
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [
      header.join(","),
      ...rows.map((row) =>
        header.map((h) => escapeCsv((row as any)[h])).join(","),
      ),
    ].join("\r\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `missionaries_export_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch (err) {
      console.error("Error exporting CSV", err);
      toast.error("Failed to export CSV");
    }
  };

  // Open dialog for add or edit

  const handleCreateNewMissionary = () => {
    setSelectedMissionary(undefined);

    setDialogOpen(true);
  };

  const handleOpenDialog = (missionary?: any) => {
    console.log(JSON.stringify(missionary, null, 2));
    setSelectedMissionary(missionary);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMissionary(undefined);
  };

  // Save handler for dialog
  const handleSaveMissionary = async (formData: any) => {
    // If editing, update; if adding, create
    try {
      // Normalize status & level to lowercase to satisfy DB CHECK constraints
      if (formData.assignment_status) {
        formData.assignment_status = String(
          formData.assignment_status,
        ).toLowerCase();
      }
      if (formData.assignment_level) {
        formData.assignment_level = String(
          formData.assignment_level,
        ).toLowerCase();
      }
      // Enforce Utah for state assignment automatically if user selected state level
      if (formData.assignment_level === "state") {
        formData.assignment = "Utah"; // for potential future API use if server expects it
      }
      let method = "POST";
      let url = "/api/database/missionaries";
      if (selectedMissionary && selectedMissionary.id) {
        method = "PATCH";
        url = `/api/database/missionaries?id=${selectedMissionary.id}`;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to save missionary" }));

        if (response.status === 409) {
          toast.error(
            errorData.error ||
              "A missionary or volunteer with this email already exists.",
          );
        } else {
          toast.error(errorData.error || "Failed to save missionary");
        }
        return;
      }

      await fetchMissionaries();
      toast.success(
        `Missionary ${selectedMissionary ? "updated" : "created"} successfully`,
      );
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving missionary:", err);
      toast.error("Error saving missionary");
    }
  };

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [missionaryToDelete, setMissionaryToDelete] = useState<any | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const handleDeleteMissionary = (missionary: any) => {
    setMissionaryToDelete(missionary);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!missionaryToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/database/missionaries?id=${missionaryToDelete.id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete missionary");
      toast.success("Missionary deleted successfully");
      await fetchMissionaries();
    } catch (err) {
      toast.error("Error deleting missionary");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setMissionaryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setMissionaryToDelete(null);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Show loading until all data is loaded
  const isLoading = missionaries === null || !cities || !communities;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Loading />
      </Box>
    );
  }

  return (
    <Grid container item sm={12} display="flex" maxWidth="xl">
      <AskYesNoDialog
        open={deleteDialogOpen}
        title={`Delete ${missionaryToDelete?.type} ${missionaryToDelete?.first_name} ${missionaryToDelete?.last_name}?`}
        description={`This action cannot be undone. If this ${missionaryToDelete?.type} is released, and you want to retain their data, consider editing their status instead.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
        confirmColor="error"
        cancelText="Cancel"
        confirmText="Yes, Delete"
        loading={deleting}
      />

      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          flexGrow: 1,
          minHeight: "100vh",
          py: 5,
        }}
      >
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Person sx={{ mr: 2, color: "primary.main" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h1" fontWeight="bold">
                MHT Missionary &amp; Volunteer Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage contacts, assignments, and service records
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setBulkImportOpen(true)}
              >
                Bulk Import
              </Button>

              {/* Bulk Import Dialog */}
              <ImportMissionaryCsvHelpDialog
                open={bulkImportOpen}
                onClose={() => {
                  setBulkImportOpen(false);
                  setImportFile(null);
                  setImportError(null);
                  setImportResults({ valid: [], errors: [] });
                  setImportSummary({ success: 0, duplicates: [], failed: [] });
                }}
                handleImport={handleImportMissionaryCsv}
                importResults={importResults}
                importError={importError}
                onSubmit={handleBulkImportSubmit}
                importing={importing}
                importSummary={importSummary}
              />

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateNewMissionary}
              >
                Add Missionary or Volunteer
              </Button>

              {/* Missionary Dialog */}
              <MissionaryDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveMissionary}
                missionary={selectedMissionary}
                cities={cities}
                communities={communities}
                user={user}
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Main Content Tabs */}

          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #e0e0e0",
                overflow: "visible",
                "& .MuiTabs-scroller": {
                  overflow: "visible !important",
                },
                "& .MuiTabs-flexContainer": {
                  overflow: "visible",
                },
                "& .MuiTab-root": {
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  minHeight: "64px",
                  py: 2,
                  overflow: "visible",
                  textTransform: "none",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  marginRight: "4px",
                  backgroundColor: "#e8e8e8",
                  color: "#666",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#d8d8d8",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#fff",
                    color: "primary.main",
                    fontWeight: 700,
                    borderTop: "3px solid",
                    borderTopColor: "primary.main",
                    borderLeft: "1px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                  },
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab label="Missionaries & Volunteers Roster" />
              <Tab label="Hours Overview" />
              <Tab
                label={
                  <Badge
                    badgeContent={criticalReleasesCount}
                    color="error"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        right: -16,
                        top: -8,
                        fontSize: "0.75rem",
                        minWidth: "20px",
                        height: "20px",
                      },
                    }}
                  >
                    Upcoming Releases
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={uncontactedVolunteersCount}
                    color="primary"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        right: -16,
                        top: -8,
                        fontSize: "0.75rem",
                        minWidth: "20px",
                        height: "20px",
                      },
                    }}
                  >
                    Volunteer Applications
                  </Badge>
                }
              />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Aggregate Stats - Only shown on management tab */}
              <AggregateStats
                cards={[
                  {
                    label: "Missionaries & Volunteers ",
                    value: filteredMissionaries.length,
                    color: "primary.main",
                    icon: <Group sx={{ color: "#fff" }} />,
                  },
                  {
                    label: "State Level",
                    value: filteredMissionaries.filter(
                      (m) => m.assignment_level?.toLowerCase() === "state",
                    ).length,
                    color: "secondary.main",
                    icon: <Business sx={{ color: "#fff" }} />,
                  },
                  {
                    label: "City Level",
                    value: filteredMissionaries.filter(
                      (m) => m.assignment_level?.toLowerCase() === "city",
                    ).length,
                    color: "secondary.main",
                    icon: <Business sx={{ color: "#fff" }} />,
                  },
                  {
                    label: "Community Level",
                    value: filteredMissionaries.filter(
                      (m) => m.assignment_level?.toLowerCase() === "community",
                    ).length,
                    color: "secondary.main",
                    icon: <LocationCity sx={{ color: "#fff" }} />,
                  },
                ]}
              />

              {/* Unified Search and Filter */}
              <SearchAndFilter
                filters={filters}
                onFiltersChange={setFilters}
                cities={cities || []}
                communities={communities || []}
                resultCount={filteredMissionaries.length}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Missionaries &amp; Volunteers Roster
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                  >
                    <ToggleButton value="card" aria-label="card view">
                      <ViewModule sx={{ mr: 1 }} />
                      Cards
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ViewList sx={{ mr: 1 }} />
                      List
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExportCSV}
                  >
                    Export CSV
                  </Button>
                </Box>
              </Box>

              {/* Missionary Cards or List */}
              {viewMode === "card" ? (
                <Grid container spacing={3}>
                  {paginatedMissionaries.map((missionary) => (
                    <Grid item xs={12} lg={6} key={missionary.id}>
                      <MissionaryCard
                        missionary={missionary}
                        cities={cities}
                        communities={communities}
                        hours={hours}
                        onEdit={handleOpenDialog}
                        onDelete={handleDeleteMissionary}
                        onProfilePictureClick={handleProfilePictureClick}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <MissionaryListView
                  missionaries={paginatedMissionaries}
                  cities={cities}
                  communities={communities}
                  hours={hours}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteMissionary}
                  onProfilePictureClick={handleProfilePictureClick}
                />
              )}

              {/* Pagination Controls */}
              {filteredMissionaries.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <TablePagination
                    component="div"
                    count={filteredMissionaries.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100, 250]}
                    labelRowsPerPage="Rows per page"
                  />
                </Box>
              )}

              {filteredMissionaries.length === 0 && (
                <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}>
                  <Person
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    No missionaries found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria or add a new missionary.
                  </Typography>
                </Paper>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <HoursOverview
                missionaries={filteredMissionaries}
                filters={filters}
                hours={hours}
                cities={cities}
                communities={communities}
                onFiltersChange={setFilters}
                onEdit={handleOpenDialog}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <UpcomingReleases
                missionaries={filteredMissionaries}
                cities={cities}
                communities={communities}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteMissionary}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <VolunteerSignupsTable />
            </TabPanel>

            <ProfilePictureDialog
              open={profilePicDialogOpen}
              onClose={() => setProfilePicDialogOpen(false)}
              profilePicUrl={profilePicUrl}
              profilePicName={profilePicName}
            />
          </Paper>
        </Container>
      </Box>
    </Grid>
  );
}
