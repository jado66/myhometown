"use client";

import { useClasses } from "@/hooks/use-classes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CardActions,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import ClassDetailTable from "./class-detail-table";
import ClassRollTable from "./class-roll-table";
import Close from "@mui/icons-material/Close";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";

export default function ClassList({ communityId }) {
  const { getClassesByCommunity, loading, error } = useClasses();
  const [classes, setClasses] = useState([]);

  const [showClassRoll, setShowClassRoll] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const data = await getClassesByCommunity(communityId);
      if (data) {
        setClasses(data);
      }
    };

    fetchClasses();
  }, [communityId]);

  if (loading) return <Typography>Loading classes...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!classes.length)
    return <Typography>No classes found for this community</Typography>;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const viewClass = (classObj) => {
    setSelectedClass(classObj);
    setShowClassDetails(true);
  };

  const takeAttendance = (classObj) => {
    setSelectedClass(classObj);
    setShowClassRoll(true);
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mx: 1, mb: 3 }}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} lg={3} key={classItem.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 6,
                  transition: "box-shadow 0.3s ease-in-out",
                },
              }}
            >
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{classItem.title}</Typography>
                    <Chip
                      size="small"
                      label={classItem.icon}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarTodayIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(classItem.createdAt)}
                    </Typography>
                  </Box>

                  {classItem.startDate && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Start: {formatDate(classItem.startDate)}
                      </Typography>
                    </Box>
                  )}
                  {classItem.endDate && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        End: {formatDate(classItem.endDate)}
                      </Typography>
                    </Box>
                  )}

                  {classItem.location && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOnIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {classItem.location}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" gap={1}>
                    <GroupIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Signups: {classItem.signups?.length || 0}
                      {classItem.showCapacity &&
                        classItem.capacity &&
                        ` / ${classItem.capacity}`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Stack direction="column" spacing={1} sx={{ flexGrow: 1 }}>
                  <Divider />
                  <Button
                    color="primary"
                    fullWidth
                    startIcon={<PersonIcon />}
                    variant="outlined"
                    onClick={() => takeAttendance(classItem)}
                  >
                    Take Attendance
                  </Button>
                  <Button
                    color="primary"
                    startIcon={<CategoryIcon />}
                    variant="outlined"
                    fullWidth
                    onClick={() => viewClass(classItem)}
                  >
                    Class Student Information
                  </Button>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={showClassRoll}
        onClose={() => setShowClassRoll(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          {selectedClass?.title} Class Roll
          <IconButton
            aria-label="close"
            onClick={() => setShowClassRoll(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Box p={2}>
          <ClassPreview classData={selectedClass} noBanner />
          <Divider sx={{ my: 2 }} />
          <ClassRollTable
            classData={selectedClass}
            onClose={() => setShowClassRoll(false)}
          />
        </Box>
      </Dialog>

      <Dialog
        open={showClassDetails}
        onClose={() => setShowClassDetails(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          {selectedClass?.title} Class Student Information
          <IconButton
            aria-label="close"
            onClick={() => setShowClassDetails(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <Box p={2}>
          <ClassPreview classData={selectedClass} noBanner />
          <Divider sx={{ my: 2 }} />

          <ClassDetailTable
            classData={selectedClass}
            onClose={() => setShowClassDetails(false)}
          />
        </Box>
      </Dialog>
    </>
  );
}
