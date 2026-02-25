"use client";
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Breadcrumbs,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import moment from "moment";
import JsonViewer from "../util/debug/DebugOutput";

export const newToOldCommunity: Record<string, string> = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd", // Orem - Geneva Heights
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "fb34e335-5cc6-4e6c-b5fc-2b64588fe921", // Orem - Sharon Park
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33", // Provo - Pioneer Park
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34", // Provo - Dixon
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35", // Provo - South Freedom
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37", // Ogden - North
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38", // Ogden - South
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39", // Ogden - West
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a", // Salt Lake City - Central
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b", // Salt Lake City - Northwest
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c", // Salt Lake City - Westside
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d", // West Valley City - Central Granger
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6838adb32243dc8160ce207d", // Layton - Layton
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e", // West Valley City - North East Granger
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f", // West Valley City - West Granger
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40", // West Valley City - Central Valley View
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed", // Santaquin - Santaquin
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": "6912655528c9b9c20ee4dede",
};

// Reverse map: old ID → new UUID (for resolving back to the new-style URL)
export const oldToNewCommunity: Record<string, string> = Object.fromEntries(
  Object.entries(newToOldCommunity).map(([newId, oldId]) => [oldId, newId]),
);

interface CommunityData {
  city_name?: string;
  city?: string;
  name: string;
  community_id: string;
}

interface DayOfService {
  city_name: string;
  community_name: string;
  community_id: string;
  name?: string;
  partner_stakes?: any[]; // Added to avoid type errors
}

interface DosBreadcrumbsProps {
  dayOfService?: DayOfService;
  communityData?: CommunityData;
  date?: string;
  projectName?: string;
  sx?: SxProps<Theme>;
  isProjectView?: boolean;
  stakeId?: string;
  projectId?: string; // Added projectId prop
  urlCommunityId?: string; // The original community ID from the URL (may be new UUID)
}

const DosBreadcrumbs: React.FC<DosBreadcrumbsProps> = ({
  dayOfService,
  communityData,
  date,
  projectName,
  isProjectView,
  stakeId,
  projectId, // Include projectId in props
  urlCommunityId,
  sx,
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  const pathname = usePathname();
  const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev";
  const basePrefix = isDev ? "/mht" : "";
  const pathnames = pathname
    ? pathname
        .split("/")
        .filter(Boolean)
        .filter((path) => path !== "mht") // Remove 'mht' from path segments
    : [];

  const generateBreadcrumbsData = useCallback((): string[] => {
    const stake = dayOfService?.partner_stakes?.find(
      (stake) => stake.id === stakeId,
    );

    const isSmallScreen = windowWidth < 600;
    const base = [];

    // Handle community level breadcrumb
    if (communityData) {
      const cityName = communityData.city_name || communityData.city;
      const communityLabel = cityName
        ? `${cityName} - ${communityData.name}`
        : communityData.name;
      if (isProjectView && !dayOfService) {
        base.push(`${communityLabel} Unassigned Projects`);
      } else {
        base.push(communityLabel);
      }
    } else if (dayOfService) {
      const cityName = dayOfService.city_name;
      const communityName = dayOfService.community_name || "Community";

      if (cityName) {
        base.push(
          isSmallScreen ? communityName : `${cityName} - ${communityName}`,
        );
      } else {
        base.push(communityName);
      }
    } else if (isProjectView) {
      // Orphaned projects with no community data
      base.push("Unassigned Projects");
    }

    // Handle standard day of service path
    if (dayOfService && date) {
      // Safely parse the date for all browsers, especially Safari
      const formatSafeDate = (dateString) => {
        if (!dateString) return "";

        // Try standard parsing first
        let parsedDate = moment(dateString);

        // If invalid, try manual parsing for MM-DD-YYYY format
        if (!parsedDate.isValid() && dateString.includes("-")) {
          const parts = dateString.split("-");
          if (parts.length === 3) {
            // If first part is 4 digits, assume YYYY-MM-DD
            if (parts[0].length === 4) {
              parsedDate = moment(dateString);
            } else {
              // Otherwise assume MM-DD-YYYY and convert to YYYY-MM-DD
              parsedDate = moment(
                `${parts[2]}-${parts[0]}-${parts[1]}`,
                "YYYY-MM-DD",
              );
            }
          }
        }

        return parsedDate;
      };

      const parsedDate = formatSafeDate(date);
      const formattedDate = parsedDate.isValid()
        ? isSmallScreen
          ? parsedDate.format("MMM-D-YY")
          : parsedDate.format("dddd, MMMM Do, YYYY")
        : date; // Fallback to original string if parsing fails

      // Build the date breadcrumb with optional stake name
      const dateBreadcrumb = stake?.name
        ? `${dayOfService.name || formattedDate} - ${stake.name}`
        : dayOfService.name || formattedDate;

      base.push(dateBreadcrumb);

      if (pathnames.includes("view-timeline") && !isProjectView) {
        base.push("View Timeline");
      }

      if (isProjectView) {
        base.push(projectName || "Project Form");
      }
    }
    // Handle direct project view without day of service
    else if (isProjectView) {
      base.push(projectName || "Project Details");
    }

    return base;
  }, [
    communityData,
    dayOfService,
    date,
    isProjectView,
    projectName,
    stakeId,
    windowWidth,
  ]);

  const [pathTitles, setPathTitles] = useState<string[]>(
    generateBreadcrumbsData(),
  );

  useEffect(() => {
    setPathTitles(generateBreadcrumbsData());
  }, [generateBreadcrumbsData]);

  const generateHref = (index: number): string => {
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "";
    const communityId =
      communityData?.community_id ||
      (communityData as any)?._id ||
      dayOfService?.community_id;

    // Construct the URL with optional dev prefix
    const getUrl = (segments: string[]): string => {
      return `${baseUrl}/${segments.join("/")}`;
    };

    // If no community ID, return current pathname (non-clickable)
    if (!communityId) {
      return pathname;
    }

    // If the community ID is a new one, use the old one for breadcrumb links
    const resolvedCommunityId = newToOldCommunity[communityId] ?? communityId;

    switch (index) {
      case 0: // Community Level - always resolve to the new UUID
        if (urlCommunityId || communityId) {
          const idToUse = urlCommunityId ?? communityId;
          // If it's an old-style ID, map it to the new UUID
          const newStyleId = oldToNewCommunity[idToUse] ?? idToUse;
          const base = getUrl(["admin-dashboard", "days-of-service", newStyleId]);
          return isProjectView && !dayOfService ? `${base}?tab=unassigned` : base;
        }
        return pathname;
      case 1: // Day of Service Level or Project Level
        if (resolvedCommunityId && date) {
          // Modified to include /stake/{stakeId} if stakeId exists
          const segments = [
            "admin-dashboard",
            "days-of-service",
            resolvedCommunityId,
            date,
          ];
          if (stakeId) {
            segments.push("organization", stakeId);
          }
          return getUrl(segments);
        } else if (isProjectView && resolvedCommunityId) {
          // For direct project view without day of service
          return getUrl([
            "admin-dashboard",
            "days-of-service",
            resolvedCommunityId,
          ]);
        }
        return pathname;
      case 2: // View Timeline or Project
        if (resolvedCommunityId && date) {
          if (isProjectView) {
            return pathname; // Current project URL
          } else {
            return getUrl([
              "admin-dashboard",
              "days-of-service",
              resolvedCommunityId,
              date,
              "view-timeline",
            ]);
          }
        } else if (isProjectView && resolvedCommunityId && projectId) {
          // For direct project view without day of service
        }
        return pathname;
      default:
        return pathname;
    }
  };

  const truncateTitle = (title: string, maxLength: number): string => {
    if (title.length <= maxLength) return title;

    // For community names with city format "City - Community"
    if (title.includes(" - ")) {
      const [city, community] = title.split(" - ");
      if (community.length > maxLength / 2) {
        return `${city.substring(0, 3)} - ${community.substring(
          0,
          maxLength / 2,
        )}...`;
      }
    }

    return title.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNext fontSize="small" />}
        sx={{
          mb: 5,
          border: "1px solid",
          borderColor: "grey.300",
          px: 2,
          py: 1,
          borderRadius: 2,
          "& .MuiBreadcrumbs-separator": {
            mx: { xs: 0.5, sm: 1 },
            color: "grey.600",
          },
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "wrap",
          },
          ...sx,
        }}
      >
        {pathTitles.map((title, index) => {
          const last = index === pathTitles.length - 1;
          const href = generateHref(index);
          const isClickable = href !== pathname;

          return last || !isClickable ? (
            <Typography
              color="textPrimary"
              key={`breadcrumb-${index}`}
              sx={{
                fontWeight: last ? "bold" : "normal",
                textTransform: "capitalize",
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {title}
            </Typography>
          ) : (
            <Link
              href={href}
              key={`breadcrumb-${index}`}
              style={{ textDecoration: "none" }}
            >
              <Typography
                color="textPrimary"
                sx={{
                  textTransform: "capitalize",
                  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {title}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </>
  );
};

export default DosBreadcrumbs;
