import React, { useState, useEffect } from "react";
import * as yup from "yup";
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
import JsonViewer from "@/components/util/debug/DebugOutput";

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
    "City Board": [
      "City Chair",
      "Associate City Chair",
      "Executive Secretary",
      "Technology Specialist",
      "Event Coordinator",
    ],
  },
  community: {
    "Community Board": [
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

const missionarySchema = yup.object().shape({
  person_type: yup.string().required("Person type is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  profile_picture_url: yup.string().notRequired(),
  city_id: yup.string().when("assignment_level", {
    is: (val: string) => val === "city",
    then: yup.string().required("City is required for city assignment"),
    otherwise: yup.string(),
  }),
  community_id: yup.string().when("assignment_level", {
    is: (val: string) => val === "community",
    then: yup
      .string()
      .required("Community is required for community assignment"),
    otherwise: yup.string(),
  }),
  assignment_status: yup.string().required("Assignment status is required"),
  assignment_level: yup.string().required("Assignment level is required"),
  contact_number: yup.string().required("Contact number is required"),
  group: yup.string().notRequired(),
  start_date: yup.string().required("Start date is required"),
  duration: yup.string().required("Duration is required"),
  stake_name: yup.string().when("person_type", {
    is: (val: string) => val === "missionary",
    then: yup.string().required("Stake name is required"),
    otherwise: yup.string().notRequired(),
  }),
  gender: yup.string().required("Gender is required"),
  street_address: yup.string().required("Street address is required"),
  address_city: yup.string().required("Address city is required"),
  address_state: yup.string().required("Address state is required"),
  zip_code: yup.string().required("Zip code is required"),
  // Optional fields
  position_detail: yup.string().notRequired(),
  title: yup.string().notRequired(),
  notes: yup.string().notRequired(),
});

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        position_detail: missionary.position_detail || "",
      });
    } else {
      // Reset errors when creating a new missionary
      setErrors({});
    }
  }, [missionary]);

  // Run validation when dialog opens if editing
  useEffect(() => {
    if (open && missionary) {
      const validateOnOpen = async () => {
        let submitData = { ...formData };
        if (submitData.assignment_level === "state") {
          submitData.city_id = "";
          submitData.community_id = "";
        } else if (submitData.assignment_level === "city") {
          submitData.community_id = "";
        }
        if (submitData.person_type === "volunteer") {
          submitData.stake_name = "";
        }

        let newErrors: { [key: string]: string } = {};
        try {
          await missionarySchema.validate(submitData, { abortEarly: false });
        } catch (validationError: any) {
          if (validationError.inner) {
            validationError.inner.forEach((err: any) => {
              if (err.path) newErrors[err.path] = err.message;
            });
          }
        }
        // Always check these custom validations
        if (!formData.group) newErrors.group = "Group is required";
        if (!formData.profile_picture_url)
          newErrors.profile_picture_url = "Profile Picture is required";
        setErrors(newErrors);
      };
      validateOnOpen();
    }
  }, [open, missionary, formData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    let submitData = { ...formData };
    if (submitData.assignment_level === "state") {
      submitData.city_id = "";
      submitData.community_id = "";
    } else if (submitData.assignment_level === "city") {
      submitData.community_id = "";
    }
    if (submitData.person_type === "volunteer") {
      submitData.stake_name = "";
    }
    let missingFields: string[] = [];
    // Check for missing required fields
    try {
      await missionarySchema.validate(submitData, { abortEarly: false });
    } catch (validationError: any) {
      if (validationError.inner) {
        validationError.inner.forEach((err: any) => {
          if (err.path) missingFields.push(err.path);
        });
      }
    }
    // Custom required fields
    if (!submitData.profile_picture_url)
      missingFields.push("profile_picture_url");
    if (!submitData.group) missingFields.push("group");
    // If any missing, show help alert
    if (missingFields.length > 0) {
      const fieldNames: { [key: string]: string } = {
        person_type: "Person Type",
        email: "Email",
        first_name: "First Name",
        last_name: "Last Name",
        profile_picture_url: "Profile Picture",
        city_id: "City",
        community_id: "Community",
        assignment_status: "Assignment Status",
        assignment_level: "Assignment Level",
        contact_number: "Contact Number",
        group: "Group",
        title: "Title",
        start_date: "Start Date",
        duration: "Duration",
        stake_name: "Stake Name",
        gender: "Gender",
        street_address: "Street Address",
        address_city: "Address City",
        address_state: "Address State",
        zip_code: "Zip Code",
        position_detail: "Position Detail",
        notes: "Notes",
      };
      const missingLabels = missingFields.map((f) => fieldNames[f] || f);
      alert(
        "Please complete all required fields before saving:\n\n" +
          missingLabels.join("\n")
      );
      // Set errors for UI
      const newErrors: { [key: string]: string } = {};
      missingFields.forEach((f) => {
        newErrors[f] = `${fieldNames[f] || f} is required`;
      });
      setErrors(newErrors);
      return;
    }
    // If all required fields are present, proceed
    setErrors({});
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
          <JsonViewer data={formData} />
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
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
                  errors={errors}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <MissionaryPersonalInfoSection
                  formData={formData}
                  setFormData={setFormData}
                  uploadLoading={uploadLoading}
                  handleFileSelectForCrop={handleFileSelectForCrop}
                  errors={errors}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <MissionaryNotesSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
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
