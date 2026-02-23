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
}

const DosBreadcrumbs: React.FC<DosBreadcrumbsProps> = ({
  dayOfService,
  communityData,
  date,
  projectName,
  isProjectView,
  stakeId,
  projectId, // Include projectId in props
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
      if (cityName) {
        base.push(`${cityName} - ${communityData.name}`);
      } else {
        base.push(communityData.name);
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
      // In dev or orphaned projects, just show "Projects"
      base.push("Projects");
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
      // Only add project name if we have community data
      if (communityData) {
        base.push(projectName || "Project Details");
      } else {
        // If we don't have community data, add a placeholder
        base.push("Project");
        base.push(projectName || "Project Details");
      }
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
      communityData?.community_id || dayOfService?.community_id;

    // Construct the URL with optional dev prefix
    const getUrl = (segments: string[]): string => {
      return `${baseUrl}/${segments.join("/")}`;
    };

    // If no community ID, return current pathname (non-clickable)
    if (!communityId) {
      return pathname;
    }

    switch (index) {
      case 0: // Community Level
        if (communityId) {
          return getUrl(["admin-dashboard", "days-of-service", communityId]);
        } else if (isProjectView) {
          return getUrl([
            "admin-dashboard",
            "days-of-service",
            communityData?._id,
          ]);
        }
        return pathname;
      case 1: // Day of Service Level or Project Level
        if (communityId && date) {
          // Modified to include /stake/{stakeId} if stakeId exists
          const segments = [
            "admin-dashboard",
            "days-of-service",
            communityId,
            date,
          ];
          if (stakeId) {
            segments.push("stake", stakeId);
          }
          return getUrl(segments);
        } else if (isProjectView && communityId) {
          // For direct project view without day of service
          return getUrl(["admin-dashboard", "days-of-service", communityId]);
        }
        return pathname;
      case 2: // View Timeline or Project
        if (communityId && date) {
          if (isProjectView) {
            return pathname; // Current project URL
          } else {
            return getUrl([
              "admin-dashboard",
              "days-of-service",
              communityId,
              date,
              "view-timeline",
            ]);
          }
        } else if (isProjectView && communityId && projectId) {
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
