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
import HomeOwnerEmailSection from "./HomeOwnerEmailSection";
import JsonViewer from "@/components/util/debug/DebugOutput";

const Step3 = () => {
  const { formData, handleInputChange, isLocked } = useProjectForm();

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
                      formData.project_developer_phone1
                    );
                    toast.success(
                      `Phone number copied to clipboard: ${formData.project_developer_phone1}`
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
                      formData.project_developer_email1
                    );
                    toast.success(
                      `Email copied to clipboard: ${formData.project_developer_email1}`
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
                      formData.project_development_couple_phone1
                    );
                    toast.success(
                      `Phone number copied to clipboard: ${formData.project_development_couple_phone1}`
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
                      formData.project_development_couple_email1
                    );
                    toast.success(
                      `Email copied to clipboard: ${formData.project_development_couple_email1}`
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
                      `Phone number copied to clipboard: ${formData.phone_number}`
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
                      `Email copied to clipboard: ${formData.email}`
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

      {/*  Host */}
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

      <Divider />
      <FormControl component="fieldset">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.review_completed_with_couple}
              onChange={(e) =>
                handleInputChange(
                  "review_completed_with_couple",
                  e.target.checked
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
                  e.target.checked
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
                e.target.checked
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

      <Divider />

      <Typography variant="h6">Property Owner Release Information</Typography>

      {!formData.signature_text && !isLocked && (
        <Typography variant="subtitle1" color="primary">
          The property owner has not yet signed the liability release form.
          Click on &quot;Send Email&quot; to send the release form to the
          property owner for signature.
        </Typography>
      )}

      {!formData.signature_text && !isLocked && <HomeOwnerEmailSection />}

      <Divider />
      <FormControl component="fieldset">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.signature_text}
              // readonly
              disabled
            />
          }
          // readonly
          sx={{
            "& .MuiFormControlLabel-label.Mui-disabled": {
              color: "text.primary", // Keeps the label text in the normal color
            },
          }}
          label="The home owner has reviewed and signed the liability release form"
        />

        {!formData.signature_text && !isLocked && (
          <FormHelperText
            sx={{
              fontSize: "1rem",
              mt: {
                md: 0,
                xs: 2,
              },
            }}
          >
            Once the property owner has signed the liability release form this
            box will be checked
          </FormHelperText>
        )}
      </FormControl>

      {formData && formData.signature_image && (
        <Box sx={{ mt: 2, display: "flex" }}>
          <img
            src={formData.signature_image || "/placeholder.svg"}
            alt="Homeowner Signature"
            style={{
              maxWidth: "200px",
              maxHeight: "60px",
              padding: "4px",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Step3;
