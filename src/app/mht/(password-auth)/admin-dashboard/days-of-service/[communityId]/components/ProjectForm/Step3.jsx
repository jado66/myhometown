import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  Tooltip,
  IconButton,
  FormHelperText,
  Button,
} from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { toast } from "react-toastify";
import JsonViewer from "@/components/util/debug/DebugOutput";

const Step3 = () => {
  const {
    formData,
    handleInputChange,
    handleSelectChange,
    isLocked,
    dayOfService,
  } = useProjectForm();

  const partner_stake = dayOfService?.partner_stakes?.find(
    (stake) => stake.id === formData.partner_stake_id,
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* <JsonViewer data={formData} /> */}

      <Box>
        <Typography variant="subtitle1" color="primary">
          Basic Information
        </Typography>
        <Box sx={{ pl: 2 }}>
          {/* Project Developer */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Typography sx={{ mr: 1 }}>
              <strong>Project Developer:</strong> {formData.project_developer}
            </Typography>
            <Stack direction="row" spacing={1}>
              {formData.project_developer_phone1 && (
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formData.project_developer_phone1,
                    );
                    toast.success(
                      `Phone number copied to clipboard: ${formData.project_developer_phone1}`,
                    );
                  }}
                >
                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                  {formData.project_developer_phone1}
                </Button>
              )}

              {formData.project_developer_email1 && (
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formData.project_developer_email1,
                    );
                    toast.success(
                      `Email copied to clipboard: ${formData.project_developer_email1}`,
                    );
                  }}
                >
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  {formData.project_developer_email1}
                </Button>
              )}
            </Stack>
          </Box>

          {/* Resource Couple */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Typography sx={{ mr: 1, mb: { xs: 0.5, sm: 0 } }}>
              <strong>Resource Couple:</strong>{" "}
              {formData.project_development_couple}
            </Typography>
            <Stack direction="row" spacing={1}>
              {formData.project_development_couple_phone1 && (
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formData.project_development_couple_phone1,
                    );
                    toast.success(
                      `Phone number copied to clipboard: ${formData.project_development_couple_phone1}`,
                    );
                  }}
                >
                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                  {formData.project_development_couple_phone1}
                </Button>
              )}

              {formData.project_development_couple_email1 && (
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      formData.project_development_couple_email1,
                    );
                    toast.success(
                      `Email copied to clipboard: ${formData.project_development_couple_email1}`,
                    );
                  }}
                >
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  {formData.project_development_couple_email1}
                </Button>
              )}
            </Stack>
          </Box>

          {/* Property Owner */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Typography sx={{ mr: 1, mb: { xs: 0.5, sm: 0 } }}>
              <strong>Property Owner:</strong> {formData.property_owner}
            </Typography>
            <Stack direction="row" spacing={1}>
              {/* <Tooltip title={formData.phone_number} arrow>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(formData.phone_number);
                    toast.success("Phone number copied to clipboard");
                  }}
                >
                  <PhoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={formData.email} arrow>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(formData.email);
                    toast.success("Email copied to clipboard");
                  }}
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip> */}

              {formData.phone_number && (
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(formData.phone_number);
                    toast.success(
                      `Phone number copied to clipboard: ${formData.phone_number}`,
                    );
                  }}
                >
                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                  {formData.phone_number}
                </Button>
              )}

              {formData.email && (
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(formData.email);
                    toast.success(
                      `Email copied to clipboard: ${formData.email}`,
                    );
                  }}
                >
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  {formData.email}
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle1" color="primary">
          Project Location
        </Typography>
        <Box sx={{ pl: 2 }}>
          {formData.address_street1 &&
          formData.address_city &&
          formData.address_state &&
          formData.address_zip_code ? (
            <>
              <Typography>
                {formData.address_street1}
                {formData.address_street2 && `, ${formData.address_street2}`}
              </Typography>
              <Typography>
                {formData.address_city}, {formData.address_state}{" "}
                {formData.address_zip_code}
              </Typography>
            </>
          ) : (
            <Typography>Not Provided</Typography>
          )}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" color="primary">
          Work Summary
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography
            sx={{
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {formData.work_summary || "Not Provided"}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" color="primary">
          Preferred Remedies
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography
            sx={{
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {formData.preferred_remedies || "Not Provided"}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" color="primary">
          Planned Tasks
        </Typography>
        <Box sx={{ pl: 2 }}>
          {formData.tasks &&
            formData.tasks.tasks &&
            Array.isArray(formData.tasks.tasks) &&
            formData.tasks.tasks.map((task, index) => (
              <Box key={index}>
                <Typography
                  sx={{
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                >
                  <strong>Task {index + 1}:</strong> {task.description}
                </Typography>
                {task.todos &&
                  task.todos.map((todo, i) => (
                    <Box key={i} sx={{ pl: 2 }}>
                      <Typography
                        sx={{
                          wordBreak: "break-word",
                          hyphens: "auto",
                        }}
                      >
                        <strong>- </strong> {todo}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            ))}
        </Box>
      </Box>

      <Divider />

      {/* Partner Organization and Group Information (merged from Step 4) */}
      <Typography variant="h6">
        Partner Organization and Group Information
      </Typography>

      {/* Partner Organization */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Typography sx={{ mr: 1 }}>
          <strong>Partner Organization:</strong> {partner_stake?.name}
        </Typography>
      </Box>

      {/* Organization Contact */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Typography sx={{ mr: 1 }}>
          <strong>Organization Contact:</strong>{" "}
          {partner_stake?.liaison_name_1
            ? partner_stake?.liaison_name_1
            : "No assigned liaison. This can be added on the Days of Service page."}
        </Typography>
        <Stack direction="row" spacing={1}>
          {partner_stake?.liaison_phone_1 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(partner_stake?.liaison_phone_1);
                toast.success(
                  `Phone number copied to clipboard: ${partner_stake?.liaison_phone_1}`,
                );
              }}
            >
              <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
              {partner_stake?.liaison_phone_1}
            </Button>
          )}

          {partner_stake?.liaison_email_1 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(partner_stake?.liaison_email_1);
                toast.success(
                  `Email copied to clipboard: ${partner_stake?.liaison_email_1}`,
                );
              }}
            >
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              {partner_stake?.liaison_email_1}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Organization Contact 2 (if exists) */}
      {partner_stake?.liaison_name_2 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Typography sx={{ mr: 1 }}>
            <strong>Organization Contact 2:</strong>{" "}
            {partner_stake?.liaison_name_2}
          </Typography>
          <Stack direction="row" spacing={1}>
            {partner_stake?.liaison_phone_2 && (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(partner_stake?.liaison_phone_2);
                  toast.success(
                    `Phone number copied to clipboard: ${partner_stake?.liaison_phone_2}`,
                  );
                }}
              >
                <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                {partner_stake?.liaison_phone_2}
              </Button>
            )}

            {partner_stake?.liaison_email_2 && (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(partner_stake?.liaison_email_2);
                  toast.success(
                    `Email copied to clipboard: ${partner_stake?.liaison_email_2}`,
                  );
                }}
              >
                <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                {partner_stake?.liaison_email_2}
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

      <Divider />

      {/* Partner Group Contact */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 1,
        }}
      >
        <Typography sx={{ mr: 1 }}>
          <strong>Partner Group Contact:</strong>{" "}
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
                  formData.partner_ward_liaison_phone1,
                );
                toast.success(
                  `Phone number copied to clipboard: ${formData.partner_ward_liaison_phone1}`,
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
                  formData.partner_ward_liaison_email1,
                );
                toast.success(
                  `Email copied to clipboard: ${formData.partner_ward_liaison_email1}`,
                );
              }}
            >
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              {formData.partner_ward_liaison_email1}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Partner Group Contact 2 (if exists) */}
      {formData.partner_ward_liaison2 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Typography sx={{ mr: 1 }}>
            <strong>Partner Group Contact 2:</strong>{" "}
            {formData.partner_ward_liaison2}
          </Typography>
          <Stack direction="row" spacing={1}>
            {formData.partner_ward_liaison_phone2 && (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(
                    formData.partner_ward_liaison_phone2,
                  );
                  toast.success(
                    `Phone number copied to clipboard: ${formData.partner_ward_liaison_phone2}`,
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
                    formData.partner_ward_liaison_email2,
                  );
                  toast.success(
                    `Email copied to clipboard: ${formData.partner_ward_liaison_email2}`,
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
              disabled={isLocked}
            />
          }
          label="The Partner Organization has been contacted"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.partner_ward_contacted}
              onChange={(e) =>
                handleInputChange("partner_ward_contacted", e.target.checked)
              }
              disabled={isLocked}
            />
          }
          label="The Partner Group has been contacted"
        />
        <Divider />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.site_visit_done_with_host}
              onChange={(e) =>
                handleInputChange("site_visit_done_with_host", e.target.checked)
              }
              disabled={isLocked}
            />
          }
          label="The Host has done a site visit"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.site_visit_done_with_partner}
              onChange={(e) =>
                handleInputChange(
                  "site_visit_done_with_partner",
                  e.target.checked,
                )
              }
              disabled={isLocked}
            />
          }
          label="The Group Contact has done a site visit"
        />
      </Box>
      <Divider />

      {/*  Host */}

      <FormControl component="fieldset">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.review_completed_with_couple}
              onChange={(e) =>
                handleInputChange(
                  "review_completed_with_couple",
                  e.target.checked,
                )
              }
              disabled={isLocked}
            />
          }
          label="The Resource Couple has reviewed the project information"
        />
      </FormControl>
      <Divider />
      <FormControl component="fieldset">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.review_completed_with_homeowner}
              onChange={(e) =>
                handleInputChange(
                  "review_completed_with_homeowner",
                  e.target.checked,
                )
              }
              disabled={isLocked}
            />
          }
          label="The Property Owner has reviewed the project information"
        />
      </FormControl>
      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.site_visit_done_with_resource_couple}
            onChange={(e) =>
              handleInputChange(
                "site_visit_done_with_resource_couple",
                e.target.checked,
              )
            }
            disabled={isLocked}
          />
        }
        label="The Resource Couple has done a site visit with Property Owner"
      />
      <Divider />
      <ProjectTextField
        label="Issues or Concerns (Optional)"
        multiline
        rows={4}
        value={formData.review_notes || ""}
        onChange={(e) => handleInputChange("review_notes", e.target.value)}
        placeholder="Note any issues or concerns that need to be addressed"
        isLocked={isLocked}
      />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Host Information</Typography>
      <Typography variant="subtitle1" color="primary">
        The Host is the person or couple who supports the property owner. This
        could be a neighbor, a block captain, a ministering person, or other.
      </Typography>
      <ProjectTextField
        label="Host Name"
        value={formData.host_name}
        key="host_name"
        onChange={(e) => handleInputChange("host_name", e.target.value)}
        isLocked={isLocked}
      />
      <ProjectTextField
        label="Host Phone Number"
        value={formData.host_phone}
        key="host_phone"
        onChange={(e) => handleInputChange("host_phone", e.target.value)}
        isLocked={isLocked}
      />
      <ProjectTextField
        label="Host Email"
        value={formData.host_email}
        key="host_email"
        onChange={(e) => handleInputChange("host_email", e.target.value)}
        isLocked={isLocked}
      />
    </Box>
  );
};

export default Step3;
