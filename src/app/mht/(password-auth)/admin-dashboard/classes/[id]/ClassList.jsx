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
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import Close from "@mui/icons-material/Close";
import { Phone, School } from "@mui/icons-material";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";
import ClassDetailTable from "./ClassDetailTable";
import ClassRollTable from "./ClassRollTable";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { useClasses } from "@/hooks/use-classes";
import { Grid3x3 } from "@mui/icons-material";
import { ViewList } from "@mui/icons-material";
import { ViewModule } from "@mui/icons-material";
import { VisibilityOff } from "@mui/icons-material";

const ClassListView = ({ classItem, onTakeAttendance, onViewClass }) => {
  return (
    <Card
      sx={{
        mb: 1,
        "&:hover": {
          boxShadow: 6,
          transition: "box-shadow 0.3s ease-in-out",
        },
      }}
    >
      <CardContent sx={{ py: "8px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h6"
              sx={{ minWidth: 200, whiteSpace: "nowrap" }}
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

            <Button
              variant="outlined"
              size="small"
              startIcon={<Phone />}
              disabled
            >
              Text
            </Button>
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
        "&:hover": {
          boxShadow: 6,
          transition: "box-shadow 0.3s ease-in-out",
        },
      }}
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

          <Button variant="outlined" startIcon={<Phone />} disabled fullWidth>
            Text Students
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Section Component that handles both views
const ClassSection = ({
  title,
  classes,
  searchTerm,
  onTakeAttendance,
  onViewClass,
  viewType,
}) => {
  if (!classes || !classes.length) return null;

  const filteredClasses = classes.filter((classItem) =>
    classItem.title?.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  if (filteredClasses.length === 0) return null;

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" sx={{ mb: 3, mt: 4 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />

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

export default function ClassList({ community, searchTerm, viewType }) {
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

  if (!community.classes.length)
    return <Typography>No classes found for this community</Typography>;

  return (
    <>
      {community.classes.map((category, index) =>
        category.type === "header" ? (
          <>
            {index !== 0 && <Divider sx={{ my: 4 }} />}
            <Typography key={category.id} variant="h3" sx={{ mt: 2, mb: 1 }}>
              {category.title}
            </Typography>
          </>
        ) : (
          <ClassSection
            key={category.id}
            title={category.title}
            classes={category.classes}
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
        )
      )}

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
