import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import ImageCropperDialog from "./ImageCropperDialog";
import { useImageUpload } from "@/hooks/use-upload-webp";
import MissionaryAssignmentSection from "./MissionaryAssignmentSection";
import MissionaryPersonalInfoSection from "./MissionaryPersonalInfoSection";
import MissionaryNotesSection from "./MissionaryNotesSection";

// Title positions organized by level and group
const POSITIONS_BY_LEVEL = {
  state: {
    "Executive Board": [
      "Utah Director",
      "Associate Director",
      "Special Projects",
      "Executive Secretary",
    ],
  },
  city: {
    "Executive Board": [
      "City Chair",
      "Associate City Chair",
      "Executive Secretary",
      "Technology Specialist",
      "Event Coordinator",
    ],
  },
  community: {
    "Executive Board": [
      "Community Executive Director",
      "Technology Specialist",
    ],
    "Community Resource Center": [
      "Director",
      "Associate Director",
      "Teacher",
      "Supervisor",
      "Administrator",
    ],
    "Neighborhood Services": [
      "Neighborhood Services Director",
      "Project Developer",
      "Resource Couple",
      "Support Staff",
    ],
  },
};

interface MissionaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  missionary?: any;
  cities: any[];
  communities: any[];
  user?: {
    permissions?: {
      administrator?: boolean;
    };
    cities?: string[];
    communities?: string[];
  };
}

const MissionaryDialog: React.FC<MissionaryDialogProps> = ({
  open,
  onClose,
  onSave,
  missionary,
  cities,
  communities,
  user = {},
}) => {
  const [formData, setFormData] = useState({
    person_type: "missionary",
    email: "",
    first_name: "",
    last_name: "",
    profile_picture_url: "",
    city_id: "",
    community_id: "",
    assignment_status: "active",
    assignment_level: "state",
    contact_number: "",
    notes: "",
    group: "",
    title: "",
    start_date: "",
    start_date: "",
    duration: "",
    stake_name: "",
    gender: "female",
    // Address fields
    street_address: "",
    address_city: "",
    address_state: "",
    zip_code: "",
  });

  const isAdmin = user?.permissions?.administrator || false;

  // State for the image cropper dialog
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Initialize image upload hook
  const { uploadProcessedImage, loading: uploadLoading } = useImageUpload(
    (url: string) =>
      setFormData((prev) => ({ ...prev, profile_picture_url: url }))
  );

  useEffect(() => {
    if (missionary) {
      setFormData({
        person_type: missionary.person_type || "missionary",
        email: missionary.email || "",
        first_name: missionary.first_name || "",
        last_name: missionary.last_name || "",
        profile_picture_url: missionary.profile_picture_url || "",
        city_id: missionary.city_id || "",
        community_id: missionary.community_id || "",
        assignment_status: missionary.assignment_status || "active",
        assignment_level: missionary.assignment_level || "state",
        contact_number: missionary.contact_number || "",
        notes: missionary.notes || "",
        group: missionary.group || "",
        title: missionary.title || "",
        start_date: missionary.start_date || "",
        duration: missionary.duration || "",
        stake_name: missionary.stake_name || "",
        gender: missionary.gender || "female",
        street_address: missionary.street_address || "",
        address_city: missionary.address_city || "",
        address_state: missionary.address_state || "",
        zip_code: missionary.zip_code || "",
      });
    }
  }, [missionary]);

  // Get available cities based on permissions
  const getAvailableCities = () => {
    if (isAdmin) return cities;
    if (!user?.cities || user.cities.length === 0) return [];
    return cities.filter((city) => user.cities!.includes(city._id || city.id));
  };

  // Get available communities based on permissions and selected city
  const getAvailableCommunities = () => {
    let availableCommunities = communities;

    if (formData.city_id) {
      const selectedCity = cities.find(
        (city) => (city._id || city.id) === formData.city_id
      );
      if (selectedCity) {
        availableCommunities = availableCommunities.filter(
          (comm) => comm.city === selectedCity.name
        );
      }
    }

    if (!isAdmin && user?.communities && user.communities.length > 0) {
      availableCommunities = availableCommunities.filter((comm) =>
        user.communities!.includes(comm._id || comm.id)
      );
    }

    return availableCommunities;
  };

  // Get title options for react-select
  const getTitleOptions = () => {
    const positions = POSITIONS_BY_LEVEL[formData.assignment_level] || {};
    const options: {
      label: string;
      options: { value: string; label: string; group: string }[];
    }[] = [];
    Object.entries(positions).forEach(([group, titles]) => {
      options.push({
        label: group,
        options: titles.map((title) => ({
          value: title,
          label: title,
          group: group,
        })),
      });
    });
    return options;
  };

  // Get grouped city options for react-select
  const getCityOptions = () => {
    const availableCities = getAvailableCities();
    const grouped: { [key: string]: any[] } = {};
    availableCities.forEach((city) => {
      const state = city.state || "Unknown";
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push({
        value: city._id || city.id,
        label: `${city.name}`,
        city: city.name,
        state: city.state,
      });
    });

    return Object.entries(grouped).map(([state, cities]) => ({
      label: state,
      options: cities,
    }));
  };

  // Get grouped community options for react-select
  const getCommunityOptions = () => {
    const availableCommunities = getAvailableCommunities();
    const grouped: { [key: string]: any[] } = {};
    availableCommunities.forEach((comm) => {
      const city = `${comm.city}, ${comm.state} ` || "Unknown";
      if (!grouped[city]) grouped[city] = [];
      grouped[city].push({
        value: comm._id || comm.id,
        label: `${comm.name}`,
        city: comm.city,
        state: comm.state,
      });
    });

    return Object.entries(grouped).map(([city, communities]) => ({
      label: city,
      options: communities,
    }));
  };

  const handlePersonTypeChange = (type: string) => {
    setFormData({
      ...formData,
      person_type: type,
      stake_name: type === "volunteer" ? "" : formData.stake_name,
    });
  };

  const handleAssignmentLevelChange = (level: string) => {
    setFormData({
      ...formData,
      assignment_level: level,
      city_id: "",
      community_id: "",
      group: "",
      title: "",
    });
  };

  const handleTitleChange = (selectedOption: any) => {
    if (selectedOption) {
      setFormData({
        ...formData,
        title: selectedOption.value,
        group: selectedOption.group,
      });
    } else {
      setFormData({
        ...formData,
        title: "",
        group: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = { ...formData };
    if (submitData.assignment_level === "state") {
      submitData.city_id = "";
      submitData.community_id = "";
    } else if (submitData.assignment_level === "city") {
      submitData.community_id = "";
    }

    // For volunteers, clear stake_name
    if (submitData.person_type === "volunteer") {
      submitData.stake_name = "";
    }

    onSave(submitData);
  };

  const calculateEndDate = (startDate: string, duration: string) => {
    if (!startDate || !duration) return "";
    const start = new Date(startDate);
    const monthsToAddMatch = duration.match(/\d+/);
    if (monthsToAddMatch) {
      const monthsToAdd = parseInt(monthsToAddMatch[0], 10);
      start.setMonth(start.getMonth() + monthsToAdd);
      return start.toISOString().split("T")[0];
    }
    return "";
  };

  // Handle file selection for cropping
  const handleFileSelectForCrop = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle the cropped image from the cropper dialog
  const handleCroppedImageSave = (croppedFile: File) => {
    uploadProcessedImage(croppedFile);
    setCropperOpen(false);
    setImageToCrop(null);
  };

  // Handle file selection for cropping
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6">
            {missionary
              ? "Edit Volunteer or Missionary"
              : "Add New Volunteer or Missionary"}
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <MissionaryAssignmentSection
                  formData={formData}
                  setFormData={setFormData}
                  getCityOptions={getCityOptions}
                  getAvailableCities={getAvailableCities}
                  getCommunityOptions={getCommunityOptions}
                  getAvailableCommunities={getAvailableCommunities}
                  getTitleOptions={getTitleOptions}
                  handlePersonTypeChange={handlePersonTypeChange}
                  handleAssignmentLevelChange={handleAssignmentLevelChange}
                  handleTitleChange={handleTitleChange}
                  calculateEndDate={calculateEndDate}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MissionaryPersonalInfoSection
                  formData={formData}
                  setFormData={setFormData}
                  uploadLoading={uploadLoading}
                  handleFileSelectForCrop={handleFileSelectForCrop}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <MissionaryNotesSection
                formData={formData}
                setFormData={setFormData}
              />
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ ml: 1 }}
            disabled={uploadLoading}
          >
            {missionary ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      <ImageCropperDialog
        open={cropperOpen}
        imageSrc={imageToCrop}
        onClose={() => {
          setCropperOpen(false);
          setImageToCrop(null);
        }}
        onSave={handleCroppedImageSave}
        loading={uploadLoading}
      />
    </>
  );
};

export { MissionaryDialog };
