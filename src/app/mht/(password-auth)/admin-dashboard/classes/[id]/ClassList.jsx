"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  IconButton,
  Tooltip,
  CardActions,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  SpeedDial,
  SpeedDialIcon,
  List,
  Fab,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import Close from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Assignment, Phone, School, Visibility } from "@mui/icons-material";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";
import ResponsiveRollTable from "./ResponsiveRollTable";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { useClasses } from "@/hooks/use-classes";
import { ViewList } from "@mui/icons-material";
import { ViewModule } from "@mui/icons-material";
import { VisibilityOff } from "@mui/icons-material";

import { ReportsDialog } from "./ReportsDialog";
import PermissionGuard from "@/guards/permission-guard";
import { useUser } from "@/hooks/use-user";
import JsonViewer from "@/components/util/debug/DebugOutput";
import ClassDetailTable from "@/components/classes/class-details/ClassDetailTable";

const ClassListView = ({ classItem, onTakeAttendance, onViewClass }) => {
  const { user } = useUser();

  return (
    <Card
      sx={{
        mb: 0.5,
        "&:hover": {
          boxShadow: 6,
          transition: "box-shadow 0.3s ease-in-out",
        },
      }}
      variant="outlined"
    >
      <CardContent sx={{ py: "8px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h6"
              sx={{
                minWidth: 200,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {ExampleIcons[classItem.icon] || null} {classItem.title}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              {classItem.startDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(classItem.startDate)} -{" "}
                    {formatDate(classItem.endDate)}
                  </Typography>
                </Box>
              )}

              {classItem.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOnIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {classItem.location}
                  </Typography>
                </Box>
              )}

              <Chip
                icon={<GroupIcon fontSize="small" />}
                label={`${classItem.signups?.length || 0}${
                  classItem.showCapacity && classItem.capacity
                    ? ` / ${classItem.capacity}`
                    : ""
                }`}
                size="small"
                variant="outlined"
                sx={{ px: 1 }}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            {!classItem.visibility && (
              <Chip
                icon={<VisibilityOff />}
                label="Not Visible"
                size="large"
                variant="outlined"
              />
            )}

            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonIcon />}
              onClick={() => onTakeAttendance(classItem)}
            >
              Attendance
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<CategoryIcon />}
              onClick={() => onViewClass(classItem)}
            >
              Info
            </Button>

            <Tooltip title="Text Students">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Phone />}
                href={
                  process.env.NEXT_PUBLIC_DOMAIN +
                  `/admin-dashboard/texting/send?classId=${
                    classItem.id
                  }&classTitle=${encodeURIComponent(classItem.title)}`
                }
              >
                Text
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

// Grid View Component
const ClassGridView = ({ classItem, onTakeAttendance, onViewClass }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",

        bgcolor: "primary",
        "&:hover": {
          boxShadow: 6,
          transition: "box-shadow 0.3s ease-in-out",
        },
      }}
      variant="outlined"
    >
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {!classItem.visibility && (
          <VisibilityOff
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
            }}
          />
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6" display="flex">
            {ExampleIcons[classItem.icon] || null} {classItem.title}
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          {classItem.startDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Start: {formatDate(classItem.startDate)}
              </Typography>
            </Box>
          )}

          {classItem.endDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                End: {formatDate(classItem.endDate)}
              </Typography>
            </Box>
          )}

          {classItem.location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOnIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {classItem.location}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GroupIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Signups: {classItem.signups?.length || 0}
              {classItem.showCapacity &&
                classItem.capacity &&
                ` / ${classItem.capacity}`}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => onTakeAttendance(classItem)}
            fullWidth
          >
            Take Attendance
          </Button>

          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => onViewClass(classItem)}
            fullWidth
          >
            Class Information
          </Button>

          <Button
            variant="outlined"
            startIcon={<Phone />}
            fullWidth
            href={
              process.env.NEXT_PUBLIC_DOMAIN +
              `/admin-dashboard/texting/send?classId=${
                classItem.id
              }&classTitle=${encodeURIComponent(classItem.title)}`
            }
          >
            Text Students
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Section Component that handles both views, with hidden toggle and icon
const ClassSection = ({
  title,
  classes,
  searchTerm,
  onTakeAttendance,
  onViewClass,
  viewType,
  showHidden,
}) => {
  if (!classes || !classes.length) return null;

  // Filter by search term only, not by visibility
  const filteredClasses = classes.filter((classItem) =>
    classItem.title?.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  if (filteredClasses.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {ExampleIcons[classes[0]?.icon] || null} {title}
      </Typography>

      {viewType === "grid" ? (
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => (
            <Grid item xs={12} md={6} lg={3} key={classItem.id}>
              <ClassGridView
                classItem={classItem}
                onTakeAttendance={onTakeAttendance}
                onViewClass={onViewClass}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack spacing={2}>
          {filteredClasses.map((classItem) => (
            <ClassListView
              key={classItem.id}
              classItem={classItem}
              onTakeAttendance={onTakeAttendance}
              onViewClass={onViewClass}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

// Semester Accordion Component with visibility toggle
const SemesterAccordion = ({
  semester,
  searchTerm,
  onTakeAttendance,
  onViewClass,
  viewType,
  expanded,
  onChange,
  index,
  setSemester,
  showHidden,
}) => {
  // Show all sections if showHidden is true, otherwise filter by visibility
  const filteredSections = semester.sections.filter(
    (section) => showHidden || section.visibility !== false
  );
  // If no sections after filtering, don't render
  if (filteredSections.length === 0) return null;

  return (
    <Accordion
      expanded={expanded === `semester-${semester.id}`}
      onChange={onChange(`semester-${semester.id}`)}
      sx={{
        mb: 2,
        "&.Mui-expanded": {
          mb: 3,
        },
        opacity: semester.visibility === false ? 0.75 : 1,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: (theme) => theme.palette.action.hover,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            width: "100%",
          }}
        >
          {semester.visibility ? <School /> : <VisibilityOff color="action" />}

          <Typography
            variant="h5"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {semester.title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            size="small"
            startIcon={<Assignment />}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSemester(semester);
            }}
          >
            Generate Reports
          </Button>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {filteredSections.map((section, index) => {
          // Show all classes if showHidden is true, otherwise filter by visibility
          const filteredClasses = showHidden
            ? section.classes
            : section.classes.filter((c) => c.visibility !== false);
          if (filteredClasses.length === 0) return null;
          return (
            <>
              <ClassSection
                key={section.id}
                title={section.title}
                classes={filteredClasses}
                searchTerm={searchTerm}
                onTakeAttendance={onTakeAttendance}
                onViewClass={onViewClass}
                viewType={viewType}
                showHidden={showHidden}
              />
              {index < filteredSections.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

export default function ClassList({
  community,
  searchTerm,
  viewType,
  refetchCommunityData,
}) {
  // Hidden toggle state
  const [showHidden, setShowHidden] = useState(false);
  const {
    updateClass,
    signupLoading,
    removeSignup,
    removeSignupLoading,
    signupForClass,
  } = useClasses();

  const [showClassRoll, setShowClassRoll] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(null); // Initialize as null

  const handleCloseReportsDialog = () => {
    setSemester(null);
  };

  const [semester, setSemester] = useState(null);

  // Organize classes into semesters
  const semesters = useMemo(() => {
    const semestersMap = {};
    let currentSemesterId = null;
    let hasFoundAnyHeaders = false;

    if (community?.classes && community.classes.length > 0) {
      community.classes.forEach((category) => {
        if (category.type === "header") {
          // Headers are our semester markers
          hasFoundAnyHeaders = true;
          currentSemesterId = category.id;
          semestersMap[currentSemesterId] = {
            id: currentSemesterId,
            title: category.title,
            sections: [],
            visibility: category.visibility !== false,
          };
        } else if (category.classes && category.classes.length > 0) {
          // If we have a current semester ID, add this category to it
          if (currentSemesterId && semestersMap[currentSemesterId]) {
            semestersMap[currentSemesterId].sections.push({
              id: category.id,
              title: category.title,
              classes: category.classes || [],
              icon: category.icon,
              visibility: category.visibility !== false,
            });
          } else {
            // If no current semester, create a default one
            const defaultId = "default-semester";
            if (!semestersMap[defaultId]) {
              semestersMap[defaultId] = {
                id: defaultId,
                title: hasFoundAnyHeaders ? "Other Classes" : "All Classes",
                sections: [],
                visibility: true,
              };
            }

            semestersMap[defaultId].sections.push({
              id: category.id,
              title: category.title,
              classes: category.classes || [],
              icon: category.icon,
              visibility: category.visibility !== false,
            });
          }
        }
      });
    }

    // Filter out empty semesters
    const filteredSemesters = Object.values(semestersMap).filter(
      (semester) => semester.sections.length > 0
    );

    return filteredSemesters.length > 0 ? filteredSemesters : [];
  }, [community?.classes]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  const handleStudentAdd = async (classId, newStudent) => {
    const result = await signupForClass(classId, newStudent);
    if (result?.success && result?.signup) {
      const signupData = result.signup;

      // Update the community.classes state
      const updatedClasses = community.classes.map((cls) => {
        if (cls.id === classId) {
          return {
            ...cls,
            signups: [...(cls.signups || []), signupData],
          };
        }
        return cls;
      });

      // Update the community state
      community.classes = updatedClasses;

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
      // Update the community.classes state
      const updatedClasses = community.classes.map((cls) => {
        if (cls.id === selectedClass.id) {
          return {
            ...cls,
            signups: cls.signups.filter((signup) => signup.id !== signupId),
          };
        }
        return cls;
      });

      // Update the community state
      community.classes = updatedClasses;

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
    // Update the community.classes state
    const updatedClasses = community.classes.map((cls) => {
      if (cls.id === classId) {
        return {
          ...cls,
          signups: updatedStudents,
        };
      }
      return cls;
    });

    // Update the community state
    community.classes = updatedClasses;

    // Update the selected class if it's currently selected
    if (selectedClass?.id === classId) {
      setSelectedClass((prev) => ({
        ...prev,
        signups: updatedStudents,
      }));
    }
  };

  if (!community?.classes || community.classes.length === 0) {
    return (
      <Typography sx={{ mb: 4 }}>
        No classes found for this community
      </Typography>
    );
  }

  // Special case: If there are no headers (semesters) and only one category, show flat list without accordions
  const hasSingleCategory =
    community?.classes?.length > 0 &&
    !community.classes.some((c) => c.type === "header") &&
    community.classes.length === 1;

  if (
    hasSingleCategory &&
    community.classes[0].classes &&
    community.classes[0].classes.length > 0
  ) {
    const category = community.classes[0];
    return (
      <>
        <ClassSection
          title={category.title}
          classes={category.classes.filter((c) => c.visibility !== false)}
          searchTerm={searchTerm}
          onTakeAttendance={(classObj) => {
            setSelectedClass(classObj);
            setShowClassRoll(true);
          }}
          onViewClass={(classObj) => {
            setSelectedClass(classObj);
            setShowClassDetails(true);
          }}
          viewType={viewType}
        />

        <ResponsiveRollTable
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
              refetchCommunityData={refetchCommunityData}
            />
          </Box>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          width: "100%",
          gap: 2,
          mb: 2,
        }}
      >
        <Button
          variant={showHidden ? "contained" : "outlined"}
          color={showHidden ? "primary" : "inherit"}
          startIcon={showHidden ? <VisibilityOff /> : <Visibility />}
          onClick={() => setShowHidden((v) => !v)}
        >
          Toggle Hidden Classes
        </Button>
      </Box>
      {/* Semesters organized in accordions */}
      {semesters && semesters.length > 0 ? (
        semesters.map((semester, index) => (
          <SemesterAccordion
            key={semester.id || `semester-${index}`}
            semester={semester}
            searchTerm={searchTerm}
            onTakeAttendance={(classObj) => {
              setSelectedClass(classObj);
              setShowClassRoll(true);
            }}
            onViewClass={(classObj) => {
              setSelectedClass(classObj);
              setShowClassDetails(true);
            }}
            viewType={viewType}
            expanded={expandedAccordion}
            onChange={handleAccordionChange}
            setSemester={setSemester}
            index={index}
            showHidden={showHidden}
          />
        ))
      ) : (
        <Typography sx={{ mb: 4 }}>
          No classes found for this community
        </Typography>
      )}

      <ResponsiveRollTable
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

      <ReportsDialog
        open={semester !== null}
        onClose={handleCloseReportsDialog}
        semester={semester}
      />
    </>
  );
}

export const ViewToggle = ({ viewType, onToggle }) => {
  return (
    <Tooltip
      title={
        viewType === "grid" ? "Switch to List View" : "Switch to Grid View"
      }
    >
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          right: 32,
          top: 96,
        }}
        onClick={onToggle}
      >
        {viewType === "grid" ? <ViewList /> : <ViewModule />}
      </Fab>
    </Tooltip>
  );
};

const formatDate = (dateString) => {
  // Create date by parsing the components to ensure consistent timezone handling
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-based in JS Date

  return date.toLocaleDateString("en-US", {
    year: "2-digit", // Use "2-digit" for a two-digit year
    month: "numeric", // Use "numeric" for numeric month (e.g., 2 for February)
    day: "numeric", // Use "numeric" for numeric day
  });
};

// Add this hook to organize the data
const useMemo = (callback, dependencies) => {
  // This is a simple implementation of React's useMemo
  // In a real application, you would use React's useMemo hook
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(callback());
  }, dependencies);

  return value;
};
