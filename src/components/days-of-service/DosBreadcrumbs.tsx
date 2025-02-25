"use client";
import React, { useState, useEffect } from "react";
import { Breadcrumbs, Typography, SxProps, Theme } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import moment from "moment";

interface CommunityData {
  city_name: string;
  name: string;
  community_id: string;
}

interface DayOfService {
  city_name: string;
  community_name: string;
  community_id: string;
  name?: string;
}

interface DosBreadcrumbsProps {
  dayOfService?: DayOfService;
  communityData?: CommunityData;
  date?: string;
  projectName?: string;
  sx?: SxProps<Theme>;
  isProjectView?: boolean;
  stakeId?: string;
}

const DosBreadcrumbs: React.FC<DosBreadcrumbsProps> = ({
  dayOfService,
  communityData,
  date,
  projectName,
  isProjectView,
  stakeId,
  sx,
}) => {
  const pathname = usePathname();
  const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev";
  const basePrefix = isDev ? "/mht" : "";
  const pathnames = pathname
    ? pathname
        .split("/")
        .filter(Boolean)
        .filter((path) => path !== "mht") // Remove 'mht' from path segments
    : [];

  const generateBreadcrumbsData = (): string[] => {
    // alert("dayOfService: " + JSON.stringify(dayOfService?.partner_stakes));

    const stake = dayOfService?.partner_stakes?.find(
      (stake) => stake.id === stakeId
    );

    const base = [];

    if (communityData) {
      base.push(`${communityData.city_name} - ${communityData.name}`);
    } else if (dayOfService) {
      base.push(
        `${dayOfService.city_name} - ${dayOfService.community_name} Community`
      );
    }

    if (dayOfService && date) {
      base.push(
        `${dayOfService.name || moment(date).format("dddd, MMMM Do, YYYY")} - ${
          stake?.name
        } `
      );

      if (pathnames.includes("view-timeline") && !isProjectView) {
        base.push("View Timeline");
      }

      if (isProjectView) {
        base.push(projectName || "Project Form");
      }
    }

    return base;
  };

  const [pathTitles, setPathTitles] = useState<string[]>(
    generateBreadcrumbsData()
  );

  useEffect(() => {
    setPathTitles(generateBreadcrumbsData());
  }, [dayOfService, communityData, date, pathname, projectName, stakeId]);

  const generateHref = (index: number): string => {
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "";
    const communityId =
      communityData?.community_id || dayOfService?.community_id;

    // Construct the URL with optional dev prefix
    const getUrl = (segments: string[]): string => {
      return `${baseUrl}/${segments.join("/")}`;
    };

    switch (index) {
      // case 0: // Admin Dashboard
      //   return getUrl(["admin-dashboard"]);
      // case 1: // Days of Service
      //   return getUrl(["admin-dashboard", "days-of-service"]);
      case 0: // Community Level
        if (communityId) {
          return getUrl(["admin-dashboard", "days-of-service", communityId]);
        }
        return pathname;
      case 1: // Day of Service Level
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
        }
        return pathname;
      default:
        return pathname;
    }
  };

  return (
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
          mx: 1,
          color: "grey.600",
        },
        ...sx,
      }}
    >
      {pathTitles.map((title, index) => {
        const last = index === pathTitles.length - 1;
        const href = generateHref(index);

        return last ? (
          <Typography
            color="textPrimary"
            key={`breadcrumb-${index}`}
            sx={{ fontWeight: "bold", textTransform: "capitalize" }}
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
  );
};

export default DosBreadcrumbs;
