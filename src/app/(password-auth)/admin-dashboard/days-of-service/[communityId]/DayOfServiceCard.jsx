"use client";

import {
  Typography,
  Box,
  Card,
  Button,
  IconButton,
  Tooltip,
  Chip,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  EditCalendar,
  LocationOn,
  Lock,
  LockOpen,
  Add,
  CalendarMonth,
  GroupWork,
  Print,
} from "@mui/icons-material";
import moment from "moment";

import { useState } from "react";
import { StakeCard } from "./StakeCard";
import PermissionGuard from "@/guards/permission-guard";
import { useUser } from "@/hooks/use-user";
import { PrintDayReportDialog } from "./components/PrintDayReportDialog";

export const DayOfServiceCard = ({
  day,
  community,
  isSmallScreen,
  handleEditDay,
  handleOpenAddStakeDialog,
  handlePartnerStakeClick,
  handleEditStake,
  handleGenerateReport,
  toggleLockDayOfService,
  showLockControls = true,
}) => {
  const { user } = useUser();
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const handlePrintClick = () => setPrintDialogOpen(true);

  const formattedDate = isSmallScreen
    ? moment(day.end_date).format("ddd, MM/DD/YY")
    : moment(day.end_date).format("ddd, MMMM Do, YYYY");

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2.5,
          overflow: "hidden",
          border: day.is_locked ? "1px solid" : "1px solid",
          borderColor: day.is_locked ? "warning.light" : "divider",
        }}
      >
        {/* Header band */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: (theme) =>
              day.is_locked
                ? alpha(theme.palette.warning.main, 0.06)
                : alpha(theme.palette.primary.main, 0.04),
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Title area */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant={isSmallScreen ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {formattedDate} -{" "}
                  {isSmallScreen
                    ? day.name || "Day of Service"
                    : `${community.name} ${day.name || "Day of Service"}`}
                </Typography>
                {day.is_locked && (
                  <Chip
                    icon={<Lock sx={{ fontSize: 14 }} />}
                    label="Locked"
                    size="small"
                    color="warning"
                    variant="filled"
                    sx={{ fontWeight: 600, height: 24, fontSize: "0.75rem" }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {day.check_in_location && !isSmallScreen && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOn
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Check-in: {day.check_in_location}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            {/* Actions */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<Print />}
              onClick={() => handlePrintClick()}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",

                px: 1,
              }}
            >
              Print Day Of Service Reports
            </Button>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <PermissionGuard requiredPermission="dos_admin" user={user}>
                {showLockControls && (
                  <Tooltip
                    title={
                      day.is_locked
                        ? "Unlock Day of Service"
                        : "Lock Day of Service"
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        toggleLockDayOfService(day.id, !day.is_locked)
                      }
                      sx={{
                        color: day.is_locked
                          ? "warning.main"
                          : "text.secondary",
                      }}
                    >
                      {day.is_locked ? (
                        <LockOpen fontSize="small" />
                      ) : (
                        <Lock fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </PermissionGuard>
              <Tooltip
                title={day.is_locked ? "Day is locked" : "Edit Day of Service"}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleEditDay(day)}
                    disabled={day.is_locked}
                    sx={{
                      color: "primary.main",
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.16),
                      },
                    }}
                  >
                    <EditCalendar fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          {/* Partner Organizations Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 1.2,
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              Partner Organizations
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => handleOpenAddStakeDialog(day.id)}
              disabled={day.is_locked}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderStyle: "dashed",

                borderColor: "divider",
                "&:hover": {
                  borderStyle: "dashed",
                  borderColor: "primary.main",
                },
              }}
            >
              Add Partner Organization
            </Button>
          </Box>

          {day.partner_stakes?.length === 0 ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <GroupWork sx={{ fontSize: 40, color: "text.disabled" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", maxWidth: 320 }}
              >
                No partner organizations yet. Add one to start planning projects
                for this day of service.
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => handleOpenAddStakeDialog(day.id)}
                disabled={day.is_locked}
                sx={{ mt: 0.5, textTransform: "none", borderRadius: 2 }}
              >
                Add Partner Organization
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {day.partner_stakes.map((stake) => (
                  <Grid item xs={12} lg={6} key={stake.id}>
                    <StakeCard
                      stake={stake}
                      day={day}
                      onClick={handlePartnerStakeClick}
                      onEdit={handleEditStake}
                      onGenerateReport={handleGenerateReport}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Card>

      <PrintDayReportDialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        day={day}
        onGenerate={(reportType, stakeIds) =>
          handleGenerateReport(reportType, stakeIds, day)
        }
      />
    </>
  );
};
