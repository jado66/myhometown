"use client";

import { useClasses } from "@/hooks/use-classes";
import { useCallback, useEffect, useState } from "react";
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
import ClassDetailTable from "./ClassDetailTable";
import ClassRollTable from "./ClassRollTable";
import Close from "@mui/icons-material/Close";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";
import { Phone, School } from "@mui/icons-material";

export default function ClassList({ communityId }) {
  const {
    getClassesByCommunity,
    updateClass,
    loading,
    signupLoading,
    error,
    signupForClass,
    removeSignup,
    removeSignupLoading,
  } = useClasses();
  const [classes, setClasses] = useState([]);

  const [showClassRoll, setShowClassRoll] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);

  const fetchClasses = useCallback(async () => {
    const data = await getClassesByCommunity(communityId);
    if (data) {
      setClasses(data);
    }
  }, [communityId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleStudentAdd = async (classId, newStudent) => {
    const result = await signupForClass(classId, newStudent);
    if (result?.success && result?.signup) {
      // Extract the signup data from the response
      const signupData = result.signup;

      setClasses((prevClasses) =>
        prevClasses.map((cls) => {
          if (cls.id === classId) {
            return {
              ...cls,
              signups: [...(cls.signups || []), signupData],
            };
          }
          return cls;
        })
      );

      if (selectedClass?.id === classId) {
        setSelectedClass((prev) => ({
          ...prev,
          signups: [...(prev.signups || []), signupData],
        }));
      }
    }
  };

  const handleRemoveSignup = async (signupId) => {
    if (!selectedClass) return false;

    const result = await removeSignup(selectedClass.id, signupId);
    if (result?.success) {
      // Update local state to remove the signup
      setClasses((prevClasses) =>
        prevClasses.map((cls) => {
          if (cls.id === selectedClass.id) {
            return {
              ...cls,
              signups: cls.signups.filter((signup) => signup.id !== signupId),
            };
          }
          return cls;
        })
      );

      // Update selected class state
      setSelectedClass((prev) => ({
        ...prev,
        signups: prev.signups.filter((signup) => signup.id !== signupId),
      }));

      return true;
    }
    return false;
  };

  const handleStudentUpdate = (classId, updatedStudents) => {
    // Update the classes state with the updated students
    setClasses((prevClasses) =>
      prevClasses.map((cls) => {
        if (cls.id === classId) {
          return {
            ...cls,
            signups: updatedStudents,
          };
        }
        return cls;
      })
    );

    // Update the selected class if it's currently selected
    if (selectedClass?.id === classId) {
      setSelectedClass((prev) => ({
        ...prev,
        signups: updatedStudents,
      }));
    }
  };

  if (loading) return <Typography>Loading classes...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!classes.length)
    return <Typography>No classes found for this community</Typography>;

  const formatDate = (dateString) => {
    // Create date by parsing the components to ensure consistent timezone handling
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based in JS Date

    return date.toLocaleDateString("en-US", {
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

                    {ExampleIcons[classItem.icon]}
                  </Box>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  {/* <Box display="flex" alignItems="center" gap={1}>
                    <CalendarTodayIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(classItem.createdAt)}
                    </Typography>
                  </Box> */}

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

                  {classItem.teachers && classItem.teachers.length > 0 && (
                    <Box display="flex" alignItems="center" gap={1}>
                      {/* <LocationOnIcon color="action" fontSize="small" /> */}
                      <School color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Teachers:
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
                  <Tooltip title="Coming Soon" arrow>
                    <Button
                      color="primary"
                      startIcon={<Phone />}
                      variant="outlined"
                      fullWidth
                      disabled
                      onClick={() => viewClass(classItem)}
                    >
                      Text Your Students
                    </Button>
                  </Tooltip>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ClassRollTable
        classData={selectedClass}
        show={showClassRoll}
        onClose={() => setShowClassRoll(false)}
      />

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
            key={`${selectedClass?.id}-${selectedClass?.signups?.length}`}
            classData={selectedClass}
            onClose={() => setShowClassDetails(false)}
            onUpdate={(updatedStudents) => {
              handleStudentUpdate(selectedClass.id, updatedStudents);
              updateClass(selectedClass.id, { signups: updatedStudents });
            }}
            onAddStudent={(newStudent) => {
              handleStudentAdd(selectedClass.id, newStudent);
            }}
            onRemoveSignup={handleRemoveSignup}
            removeSignupLoading={removeSignupLoading}
            signupLoading={signupLoading}
          />
        </Box>
      </Dialog>
    </>
  );
}
