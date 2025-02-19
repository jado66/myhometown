"use client";
import React, { useState, useEffect } from "react";
import { Breadcrumbs, Typography } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DosBreadcrumbs = ({
  dayOfService,
  communityData,
  date,
  projectName,
  sx,
}) => {
  const pathname = usePathname();
  const pathnames = pathname
    ? pathname
        .split("/")
        .filter(Boolean)
        .filter((path) => path !== "mht")
    : [];

  const isProjectView = pathnames[pathnames.length - 1]?.includes("-");
  const projectId = isProjectView ? pathnames[pathnames.length - 1] : null;

  const generateBreadcrumbsData = () => {
    // Base structure that's always present
    const base = ["Admin Dashboard", "Days of Service"];

    // If we have community data
    if (communityData) {
      base.push(`${communityData.city_name} - ${communityData.name}`);
    } else if (dayOfService) {
      // Fallback to dayOfService data if communityData isn't provided
      base.push(`${dayOfService.city_name} - ${dayOfService.community_name}`);
    }

    // If we have a day of service
    if (dayOfService && date) {
      base.push(`${dayOfService.name || ""} ${date}`);

      // Add "View Timeline" only if we're at that path specifically
      if (pathnames.includes("view-timeline") && !isProjectView) {
        base.push("View Timeline");
      }

      // Add project name or ID if we're at project level
      if (isProjectView) {
        base.push(projectName || `Project Form`);
      }
    }

    return base;
  };

  const [pathTitles, setPathTitles] = useState(generateBreadcrumbsData());

  useEffect(() => {
    setPathTitles(generateBreadcrumbsData());
  }, [dayOfService, communityData, date, pathname, projectName]);

  const generateHref = (index) => {
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "";
    const communityId =
      communityData?.community_id || dayOfService?.community_id;

    // Map the breadcrumb index to the corresponding URL path
    switch (index) {
      case 0: // Admin Dashboard
        return `${baseUrl}/admin-dashboard`;
      case 1: // Days of Service
        return `${baseUrl}/admin-dashboard/days-of-service`;
      case 2: // Community Level
        if (communityId) {
          return `${baseUrl}/admin-dashboard/days-of-service/${communityId}`;
        }
        return pathname;
      case 3: // Day of Service Level
        if (communityId && date) {
          return `${baseUrl}/admin-dashboard/days-of-service/${communityId}/${date}`;
        }
        return pathname;
      case 4: // View Timeline or Project
        if (communityId && date) {
          if (isProjectView) {
            return pathname; // Current project URL
          } else {
            return `${baseUrl}/admin-dashboard/days-of-service/${communityId}/${date}/view-timeline`;
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
