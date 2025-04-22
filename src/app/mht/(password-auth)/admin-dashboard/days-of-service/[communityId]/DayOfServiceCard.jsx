"use client";

import {
  Typography,
  Box,
  Card,
  Grid,
  Button,
  Divider,
  ButtonGroup,
} from "@mui/material";
import {
  EditCalendar,
  LocationOn,
  Lock,
  LockOpen,
  x,
} from "@mui/icons-material";
import moment from "moment";

import { StakeCard } from "./StakeCard";
import PermissionGuard from "@/guards/permission-guard";
import { useUser } from "@/hooks/use-user";

export const DayOfServiceCard = ({
  day,
  community,
  isSmallScreen,
  handleEditDay,
  handleOpenAddStakeDialog,
  handlePartnerStakeClick,
  handleEditStake,
  handleGenerateDayOfServiceReport,
  toggleLockDayOfService,
}) => {
  const { user } = useUser();

  return (
    <Card
      sx={{ backgroundColor: "grey.50", mb: 4, p: { xs: 2, sm: 4 } }}
      variant="outlined"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {isSmallScreen ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <Typography variant="h5" color="primary">
              {day.name || "Day of Service"}
            </Typography>
            <Typography variant="subtitle" color="primary">
              {moment(day.end_date).format("ddd, MM/DD/yy")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" color="primary">
              {community.name} {day.name || "Day of Service"} -{" "}
              {moment(day.end_date).format("dddd, MMMM Do, YYYY")}
            </Typography>
            {day.check_in_location && (
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 4 }}
              >
                <LocationOn sx={{ mr: 1 }} /> Check-in Location:{" "}
                {day.check_in_location}
              </Typography>
            )}
          </Box>
        )}
        <Button
          onClick={() => handleEditDay(day)}
          color="primary"
          variant="contained"
          disabled={day.is_locked}
        >
          <EditCalendar sx={{ mr: 1 }} />{" "}
          {isSmallScreen ? "Edit" : "Edit Day of Service"}
        </Button>
      </Box>

      <Divider sx={{ mb: 2, mx: 1 }} />
      <Typography variant="h6" sx={{ my: 2, ml: 2 }}>
        {day.partner_stakes.length === 0
          ? "Please add a Partner Organization to this day of service"
          : "Manage the projects for your Partner Organizations"}
      </Typography>

      <Grid
        container
        columnSpacing={{ xs: 1, md: 3 }}
        rowSpacing={2}
        sx={{ ml: 0 }}
      >
        {day.partner_stakes.map((stake) => (
          <Grid item xs={12} sm={6} key={stake.id}>
            <StakeCard
              stake={stake}
              day={day}
              onClick={handlePartnerStakeClick}
              onEdit={handleEditStake}
              onGenerateReport={handleGenerateDayOfServiceReport}
            />
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 4, ml: 2 }}
        onClick={() => handleOpenAddStakeDialog(day.id)}
        disabled={day.is_locked}
      >
        Add Partner Organization
      </Button>

      <PermissionGuard requiredPermission="dos_admin" user={user}>
        {day.is_locked ? (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LockOpen />}
            sx={{ mt: 4, ml: 2 }}
            onClick={() => {
              toggleLockDayOfService(day.id, false);
            }}
          >
            Unlock Day Of Service
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Lock />}
            sx={{ mt: 4, ml: 2 }}
            onClick={() => {
              toggleLockDayOfService(day.id, true);
            }}
          >
            Lock Day Of Service
          </Button>
        )}
      </PermissionGuard>
    </Card>
  );
};
