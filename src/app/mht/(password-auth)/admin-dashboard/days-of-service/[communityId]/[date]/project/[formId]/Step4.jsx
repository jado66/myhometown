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
} from "@mui/material";
import CreatableSelect from "react-select/creatable";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import { components } from "react-select";
import { Email, Phone, WarningAmber } from "@mui/icons-material";
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Partner Stake and Ward Information
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Box>
            <Typography>
              <strong>Partner Stake/Organization:</strong> {partner_stake.name}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>
              <strong>Stake/Organization Liaison:</strong>{" "}
              {partner_stake.liaison_name_1
                ? partner_stake.liaison_name_1
                : "No assigned liaison. This can be added on the Days of Service page."}
            </Typography>
            <Stack direction="row" spacing={2}>
              {partner_stake.liaison_phone_1 && (
                <Tooltip title={partner_stake.liaison_phone_1} arrow>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        partner_stake.liaison_phone_1
                      );
                      toast.success(
                        `Phone number copied to clipboard: ${partner_stake.liaison_phone_1}`
                      );
                    }}
                  >
                    <Phone />
                  </IconButton>
                </Tooltip>
              )}
              {partner_stake.liaison_email_1 && (
                <Tooltip title={partner_stake.liaison_email_1} arrow>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        partner_stake.liaison_email_1
                      );
                      toast.success(
                        `Email copied to clipboard: ${partner_stake.liaison_email_1}`
                      );
                    }}
                  >
                    <Email />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
          {partner_stake.liaison_name_2 && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>
                <strong>Stake/Organization Liaison 2:</strong>{" "}
                {partner_stake.liaison_name_2}
              </Typography>
              <Stack direction="row" spacing={2}>
                {partner_stake.liaison_phone_2 && (
                  <Tooltip title={partner_stake.liaison_phone_2} arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          partner_stake.liaison_phone_1
                        );
                        toast.success(
                          `Phone number copied to clipboard: ${partner_stake.liaison_phone_2}`
                        );
                      }}
                    >
                      <Phone />
                    </IconButton>
                  </Tooltip>
                )}
                {partner_stake.liaison_email_2 && (
                  <Tooltip title={partner_stake.liaison_email_2} arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          partner_stake.liaison_email_1
                        );
                        toast.success(
                          `Email copied to clipboard: ${partner_stake.liaison_email_2}`
                        );
                      }}
                    >
                      <Email />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography>
              <strong>Partner Ward/Group:</strong>{" "}
              {formData.partner_ward
                ? formData.partner_ward
                : "No assigned partner ward. This can be added on the projects page"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>
              <strong>Partner Ward/Group Liaison:</strong>{" "}
              {formData.partner_ward_liaison
                ? formData.partner_ward_liaison
                : "No assigned liaison. This can be added on the projects page"}
            </Typography>
            {formData.partner_ward_liaison_phone1 && (
              <Stack direction="row" spacing={2}>
                <Tooltip title={formData.partner_ward_liaison_phone1} arrow>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        formData.partner_ward_liaison_phone1
                      );
                      toast.success(
                        `Phone number copied to clipboard: ${formData.partner_ward_liaison_phone1}`
                      );
                    }}
                  >
                    <Phone />
                  </IconButton>
                </Tooltip>
                {formData.partner_ward_liaison_email1 && (
                  <Tooltip title={formData.partner_ward_liaison_email1} arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          formData.partner_ward_liaison_email1
                        );
                        toast.success(
                          `Email copied to clipboard: ${formData.partner_ward_liaison_email1}`
                        );
                      }}
                    >
                      <Email />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            )}
          </Box>
          {formData.partner_ward_liaison2 && (
            <Box display="flex" alignItems="center" gap={1}>
              <Stack direction="row" spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>
                    <strong>Partner Ward/Group Liaison 2:</strong>{" "}
                    {formData.partner_ward_liaison2}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Tooltip title={formData.partner_ward_liaison_phone2} arrow>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            formData.partner_ward_liaison_phone2
                          );
                          toast.success(
                            `Phone number copied to clipboard: ${formData.partner_ward_liaison_phone2}`
                          );
                        }}
                      >
                        <Phone />
                      </IconButton>
                    </Tooltip>
                    {formData.partner_ward_liaison_email2 && (
                      <Tooltip
                        title={formData.partner_ward_liaison_email2}
                        arrow
                      >
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              formData.partner_ward_liaison_email2
                            );
                            toast.success(
                              `Email copied to clipboard: ${formData.partner_ward_liaison_email2}`
                            );
                          }}
                        >
                          <Email />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
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
            label="Has the Partner Stake/Organization been contacted?"
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
            label="Has the Partner Ward/Group been contacted?"
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
            label="Was the site visit done with the Partner Ward/Group Leader?"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Step4;
