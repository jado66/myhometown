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
} from "@mui/material";
import CreatableSelect from "react-select/creatable";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import { components } from "react-select";
import { InfoSharp } from "@mui/icons-material";
import { PriorityHigh } from "@mui/icons-material";
import { WarningAmber } from "@mui/icons-material";

const Step4 = () => {
  const theme = useTheme();
  const {
    formData,
    handleInputChange,
    handleSelectChange,
    stakeOptions,
    wardOptions,
  } = useProjectForm();

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <label>Partner Stake</label>
          <FormControl fullWidth>
            <CreatableSelect
              options={stakeOptions}
              value={
                formData.partner_stake
                  ? {
                      value: formData.partner_stake,
                      label: formData.partner_stake,
                    }
                  : null
              }
              onChange={(newValue) =>
                handleSelectChange("partner_stake", newValue)
              }
              placeholder="Select or type a new stake..."
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              styles={customStyles}
              components={{
                MenuList: (props) => (
                  <CustomMenuList {...props} menuType="stake" />
                ),
              }}
              noOptionsMessage="Type to create a new option"
            />
            <FormHelperText
              sx={{
                display: "flex",
                alignItems: "center",
                py: 1,
                fontSize: "16px",
                color: "red",
              }}
            >
              <WarningAmber sx={{ mr: 1 }} />
              Please ensure that the name of the Stake is accurate as these
              options are shared across all projects associated with this Day Of
              Service.
            </FormHelperText>
          </FormControl>
          <ProjectTextField
            label="Partner Stake Liaison"
            value={formData.partner_stake_liaison}
            onChange={(e) =>
              handleInputChange("partner_stake_liaison", e.target.value)
            }
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <ProjectTextField
              label="Partner Stake Liaison Phone"
              value={formData.partner_stake_liaison_phone}
              onChange={(e) =>
                handleInputChange("partner_stake_liaison_phone", e.target.value)
              }
            />
            <ProjectTextField
              label="Partner Stake Liaison Email"
              value={formData.partner_stake_liaison_email}
              onChange={(e) =>
                handleInputChange("partner_stake_liaison_email", e.target.value)
              }
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <label>Partner Ward</label>
          <FormControl fullWidth>
            <CreatableSelect
              options={wardOptions}
              value={
                formData.partner_ward
                  ? {
                      value: formData.partner_ward,
                      label: formData.partner_ward,
                    }
                  : null
              }
              onChange={(newValue) =>
                handleSelectChange("partner_ward", newValue)
              }
              placeholder="Select or type a new ward..."
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              styles={customStyles}
              components={{
                MenuList: (props) => (
                  <CustomMenuList {...props} menuType="ward" />
                ),
              }}
              noOptionsMessage="Type to create a new option"
            />
            <FormHelperText
              sx={{
                display: "flex",
                alignItems: "center",
                py: 1,
                fontSize: "16px",
                color: "red",
              }}
            >
              <WarningAmber sx={{ mr: 1 }} />
              Please ensure that the name of the Ward is accurate as these
              options are shared across all projects associated with this Day Of
              Service.
            </FormHelperText>
          </FormControl>
          <ProjectTextField
            label="Partner Ward Liaison(s)"
            value={formData.partner_ward_liaison}
            onChange={(e) =>
              handleInputChange("partner_ward_liaison", e.target.value)
            }
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <ProjectTextField
              label="Partner Ward Liaison Phone"
              value={formData.partner_ward_liaison_phone1}
              onChange={(e) =>
                handleInputChange("partner_ward_liaison_phone1", e.target.value)
              }
            />
            <ProjectTextField
              label="Partner Ward Liaison Email"
              value={formData.partner_ward_liaison_email1}
              onChange={(e) =>
                handleInputChange("partner_ward_liaison_email1", e.target.value)
              }
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <ProjectTextField
              label="Partner Ward Liaison Phone 2 (Optional)"
              value={formData.partner_ward_liaison_phone2}
              onChange={(e) =>
                handleInputChange("partner_ward_liaison_phone2", e.target.value)
              }
            />
            <ProjectTextField
              label="Partner Ward Liaison Email 2 (Optional)"
              value={formData.partner_ward_liaison_email2}
              onChange={(e) =>
                handleInputChange("partner_ward_liaison_email2", e.target.value)
              }
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

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
            label="Has the Partner Stake been contacted?"
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
            label="Has the Partner Ward been contacted?"
          />
          <Divider sx={{ my: 2 }} />
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
                  handleInputChange(
                    "site_visit_done_with_host",
                    e.target.checked
                  )
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
            label="Was the site visit done with the Partner Ward Leader?"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Step4;
