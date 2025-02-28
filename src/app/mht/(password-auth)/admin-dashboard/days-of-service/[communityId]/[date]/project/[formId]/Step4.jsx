import React from "react";
import {
  Box,
  Paper,
  Divider,
  FormControl,
  FormControlLabel,
  Checkbox,
  useTheme,
  FormHelperText,
  Typography,
  Tooltip,
  IconButton,
  Stack,
  Button,
} from "@mui/material";
import CreatableSelect from "react-select/creatable";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import { components } from "react-select";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { toast } from "react-toastify";

const Step4 = () => {
  const theme = useTheme();
  const {
    formData,
    handleInputChange,
    handleSelectChange,

    dayOfService,
  } = useProjectForm();

  const partner_stake = dayOfService.partner_stakes.find(
    (stake) => stake.id === formData.partner_stake_id
  );

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "56px",
      borderRadius: 4,
      color: "red",
      "&:hover": { borderColor: "#999" },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 1000,
      backgroundColor: "white",
      borderRadius: 4,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }),
    menuList: (base) => ({ ...base }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f0f0f0" : "white",
      color: "#333",
      "&:hover": { backgroundColor: "#e0e0e0" },
    }),
    singleValue: (base) => ({
      ...base,
      color: theme.palette.primary.main,
    }),
  };

  const CustomMenuList = (props) => {
    const hasOptions =
      props.children && React.Children.count(props.children) > 1;

    return (
      <components.MenuList {...props}>
        {props.children}
        {hasOptions && (
          <div
            style={{
              padding: "8px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            * If you need to delete a {props.menuType} you can do it from the
            Edit Days of Service dialog.
          </div>
        )}
      </components.MenuList>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="h6">
        Partner Organization and Group Information
      </Typography>

      {/* Partner Organization*/}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 1,
        }}
      >
        <Typography sx={{ mr: 1, mb: { xs: 0.5, sm: 0 } }}>
          <strong>Partner Organization:</strong> {partner_stake.name}
        </Typography>
      </Box>

      {/* Organization Liaison */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 1,
        }}
      >
        <Typography sx={{ mr: 1, mb: { xs: 0.5, sm: 0 } }}>
          <strong>Organization Liaison:</strong>{" "}
          {partner_stake.liaison_name_1
            ? partner_stake.liaison_name_1
            : "No assigned liaison. This can be added on the Days of Service page."}
        </Typography>
        <Stack direction="row" spacing={1}>
          {partner_stake.liaison_phone_1 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(partner_stake.liaison_phone_1);
                toast.success(
                  `Phone number copied to clipboard: ${partner_stake.liaison_phone_1}`
                );
              }}
            >
              <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
              {partner_stake.liaison_phone_1}
            </Button>
          )}

          {partner_stake.liaison_email_1 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(partner_stake.liaison_email_1);
                toast.success(
                  `Email copied to clipboard: ${partner_stake.liaison_email_1}`
                );
              }}
            >
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              {partner_stake.liaison_email_1}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Organization Liaison 2 (if exists) */}
      {partner_stake.liaison_name_2 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 1,
          }}
        >
          <Typography sx={{ mr: 1, mb: { xs: 0.5, sm: 0 } }}>
            <strong>Organization Liaison 2:</strong>{" "}
            {partner_stake.liaison_name_2}
          </Typography>
          <Stack direction="row" spacing={1}>
            {partner_stake.liaison_phone_2 && (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(partner_stake.liaison_phone_2);
                  toast.success(
                    `Phone number copied to clipboard: ${partner_stake.liaison_phone_2}`
                  );
                }}
              >
                <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                {partner_stake.liaison_phone_2}
              </Button>
            )}

            {partner_stake.liaison_email_2 && (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(partner_stake.liaison_email_2);
                  toast.success(
                    `Email copied to clipboard: ${partner_stake.liaison_email_2}`
                  );
                }}
              >
                <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                {partner_stake.liaison_email_2}
              </Button>
            )}
          </Stack>
        </Box>
      )}

      <Divider />

      {/* Partner Group */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 1,
        }}
      >
        <Typography sx={{ mr: 1 }}>
          <strong>Partner Group:</strong>{" "}
          {formData.partner_ward
            ? formData.partner_ward
            : "No assigned Partner Group. This can be added on the projects page"}
        </Typography>
      </Box>

      {/* Partner Group Liaison */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 1,
        }}
      >
        <Typography sx={{ mr: 1 }}>
          <strong>Partner Group Liaison:</strong>{" "}
          {formData.partner_ward_liaison
            ? formData.partner_ward_liaison
            : "No assigned liaison. This can be added on the projects page"}
        </Typography>
        <Stack direction="row" spacing={1}>
          {formData.partner_ward_liaison_phone1 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(
                  formData.partner_ward_liaison_phone1
                );
                toast.success(
                  `Phone number copied to clipboard: ${formData.partner_ward_liaison_phone1}`
                );
              }}
            >
              <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
              {formData.partner_ward_liaison_phone1}
            </Button>
          )}

          {formData.partner_ward_liaison_email1 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(
                  formData.partner_ward_liaison_email1
                );
                toast.success(
                  `Email copied to clipboard: ${formData.partner_ward_liaison_email1}`
                );
              }}
            >
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              {formData.partner_ward_liaison_email1}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Partner Group Liaison 2 (if exists) */}
      {formData.partner_ward_liaison2 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Typography sx={{ mr: 1 }}>
            <strong>Partner Group Liaison 2:</strong>{" "}
            {formData.partner_ward_liaison2}
          </Typography>
          <Stack direction="row" spacing={1}>
            {formData.partner_ward_liaison_phone2 && (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(
                    formData.partner_ward_liaison_phone2
                  );
                  toast.success(
                    `Phone number copied to clipboard: ${formData.partner_ward_liaison_phone2}`
                  );
                }}
              >
                <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                {formData.partner_ward_liaison_phone2}
              </Button>
            )}

            {formData.partner_ward_liaison_email2 && (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(
                    formData.partner_ward_liaison_email2
                  );
                  toast.success(
                    `Email copied to clipboard: ${formData.partner_ward_liaison_email2}`
                  );
                }}
              >
                <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                {formData.partner_ward_liaison_email2}
              </Button>
            )}
          </Stack>
        </Box>
      )}

      <Divider />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.partner_stake_contacted}
              onChange={(e) =>
                handleInputChange("partner_stake_contacted", e.target.checked)
              }
            />
          }
          label="Has the Partner Organization been contacted?"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.partner_ward_contacted}
              onChange={(e) =>
                handleInputChange("partner_ward_contacted", e.target.checked)
              }
            />
          }
          label="Has the Partner Group been contacted?"
        />
        <Divider />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.site_visit_done_with_resource_couple}
              onChange={(e) =>
                handleInputChange(
                  "site_visit_done_with_resource_couple",
                  e.target.checked
                )
              }
            />
          }
          label="Was the site visit done with the Resource Couple?"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.site_visit_done_with_host}
              onChange={(e) =>
                handleInputChange("site_visit_done_with_host", e.target.checked)
              }
            />
          }
          label="Was the site visit done with the Host?"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.site_visit_done_with_partner}
              onChange={(e) =>
                handleInputChange(
                  "site_visit_done_with_partner",
                  e.target.checked
                )
              }
            />
          }
          label="Was the site visit done with the Partner Group Leader?"
        />
      </Box>
    </Box>
  );
};

export default Step4;
