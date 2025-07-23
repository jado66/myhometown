"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
} from "@mui/material";
import { DaysOfServiceCalendar } from "@/components/admin/DaysOfServiceCalendar";
import { supabase } from "@/util/supabase";

const DaysOfServicePage: React.FC = () => {
  const [daysOfService, setDaysOfService] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState(null);

  // Simulate data fetching
  useEffect(() => {
    const fetchDaysOfService = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("days_of_service")
          .select("*")
          .order("start_date", { ascending: true });
        if (error) {
          throw error;
        }

        setDaysOfService(data);
      } catch (err) {
        setError("Failed to load days of service");
        console.error("Error fetching days of service:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDaysOfService();
  }, []);

  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  const handleCloseDialog = () => {
    setSelectedDay(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DaysOfServiceCalendar
          daysOfService={daysOfService}
          onSelectDay={handleSelectDay}
          isLoading={isLoading}
        />

        {/* Day Details Dialog */}
        <Dialog
          open={!!selectedDay}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          {selectedDay && (
            <>
              <DialogTitle>
                {selectedDay.name || `Day of Service - ${selectedDay.short_id}`}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="body1">
                    <strong>Short ID:</strong> {selectedDay.short_id}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Prepping Begins:</strong>{" "}
                    {selectedDay.start_date
                      ? new Date(selectedDay.start_date).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : ""}
                  </Typography>

                  <Typography variant="body1">
                    <strong>Day of Service:</strong>{" "}
                    {selectedDay.end_date
                      ? new Date(selectedDay.end_date).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : ""}
                  </Typography>

                  {selectedDay.check_in_location && (
                    <Typography variant="body1">
                      <strong>Check-in Location:</strong>{" "}
                      {selectedDay.check_in_location}
                    </Typography>
                  )}

                  <Typography variant="body1">
                    <strong>Status:</strong>{" "}
                    {selectedDay.is_locked ? "Locked" : "Open"}
                  </Typography>

                  {selectedDay.partner_stakes &&
                    selectedDay.partner_stakes.length > 0 && (
                      <Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Partner Stakes:</strong>
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedDay.partner_stakes.map((stake, index) => {
                            let name = "";
                            try {
                              if (typeof stake === "string") {
                                name = JSON.parse(stake).name || stake;
                              } else if (
                                stake &&
                                typeof stake === "object" &&
                                stake.name
                              ) {
                                name = stake.name;
                              } else {
                                name = String(stake);
                              }
                            } catch (e) {
                              name = String(stake);
                            }
                            return (
                              <Chip
                                key={index}
                                label={name}
                                size="small"
                                color="primary"
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    )}

                  {selectedDay.partner_wards &&
                    selectedDay.partner_wards.length > 0 && (
                      <Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Partner Wards:</strong>
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedDay.partner_wards.map((ward, index) => (
                            <Chip
                              key={index}
                              label={ward}
                              size="small"
                              color="secondary"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default DaysOfServicePage;

const parsePartnerStakes = (partnerStakes: string[]) => {
  if (!partnerStakes || partnerStakes.length === 0) return [];

  return partnerStakes.map((stakeString) => {
    try {
      const parsed = JSON.parse(stakeString);
      return {
        id: parsed.id,
        name: parsed.name,
        liaison_name_1: parsed.liaison_name_1,
        liaison_email_1: parsed.liaison_email_1,
        liaison_phone_1: parsed.liaison_phone_1,
        liaison_name_2: parsed.liaison_name_2,
        liaison_email_2: parsed.liaison_email_2,
        liaison_phone_2: parsed.liaison_phone_2,
        number_of_projects: parsed.number_of_projects,
        partner_stake_liaison_title_1: parsed.partner_stake_liaison_title_1,
        partner_stake_liaison_title_2: parsed.partner_stake_liaison_title_2,
      };
    } catch (error) {
      console.error("Error parsing partner stake:", error);
      return { name: stakeString }; // Fallback to original string
    }
  });
};
