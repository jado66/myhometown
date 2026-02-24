"use client";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Checkbox,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  SvgIcon,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Construction,
  Delete as DeleteIcon,
  Group,
  LocationOn,
  CheckCircle,
  Flag,
  MoreVert as MoreVertIcon,
  ExpandMore,
  Phone,
  CalendarToday,
  Edit,
} from "@mui/icons-material";
import moment from "moment";

export const ProjectCard = ({
  project,
  onProjectClick,
  onGenerateReport,
  onDelete,
  isSelected = false,
  onCheckboxChange,
  showCheckbox = false,
  showAccordion = false,
  onEditPartnerWard,
  menuAnchorEl,
  onMenuOpen,
  onMenuClose,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const getProjectTitle = (project) => {
    let projectTitle = "";
    if (project.project_name) projectTitle += project.project_name;
    if (!projectTitle) {
      return `Project ${project.id.slice(0, 8)}...`;
    }
    return projectTitle.length > 25
      ? `${projectTitle.substring(0, 25)}...`
      : projectTitle;
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("MM/DD/YYYY");
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        "&:hover": { boxShadow: 6 },
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.grey[50],
        border: project.status === "completed" ? "2px solid #318D43" : "",
      }}
      variant="outlined"
      onClick={() => onProjectClick(project.id)}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: { xs: "flex-start", lg: "center" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flex: 1,
            width: { xs: "100%", lg: "auto" },
          }}
        >
          <CardHeader
            title={getProjectTitle(project)}
            subheader={
              project.address_street1 &&
              project.address_city && (
                <Box>
                  <Typography
                    variant="subtitle"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: -0.5,
                    }}
                  >
                    <LocationOn color="primary" size="small" sx={{ mr: 1 }} />
                    {`${project.address_street1}${
                      project.address_street2
                        ? `, ${project.address_street2}`
                        : ""
                    }, ${project.address_city}`}
                  </Typography>
                </Box>
              )
            }
            sx={{
              pb: 0,
              flex: 1,
              pl: {
                xs: showCheckbox ? 6 : 2,
                sm: showCheckbox ? 6 : 2,
                md: showCheckbox ? 6 : 2,
              },
              pt: { xs: 2.5, sm: 3, md: 2 },
              "& .MuiCardHeader-title": {
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.5rem" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
              "& .MuiCardHeader-subheader": {
                fontSize: { xs: "0.5rem", sm: "0.875rem" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            pb: { xs: 1, lg: 0 },
            pt: { xs: 0, lg: 1 },
            width: { xs: "100%", lg: "auto" },
            flexWrap: "wrap",
            zIndex: 1,
          }}
        >
          {!isSmallScreen && (
            <>
              {project.volunteers_needed && (
                <Tooltip title="Volunteers Needed">
                  <Button
                    edge="end"
                    aria-label="volunteers-needed"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ mr: 1, color: "#686868" }}
                  >
                    <Group sx={{ mr: 1 }} />
                    {project.volunteers_needed || "N/A"}
                  </Button>
                </Tooltip>
              )}
              <Tooltip title="Generate Report">
                <Button
                  edge="end"
                  variant="outlined"
                  aria-label="generate-report"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateReport(project);
                  }}
                  sx={{ mr: 1 }}
                >
                  <Construction sx={{ mr: 1 }} />
                  Print
                </Button>
              </Tooltip>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                sx={{ mr: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}

          {isSmallScreen && (
            <>
              {project.volunteers_needed && project.volunteers_needed > 0 && (
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Group sx={{ mr: 1 }} size="small" />
                  {project.volunteers_needed}
                </Typography>
              )}
              <IconButton
                aria-label="more-actions"
                aria-controls={`action-menu-${project.id}`}
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuOpen(e, project.id);
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id={`action-menu-${project.id}`}
                anchorEl={menuAnchorEl?.[project.id]}
                open={Boolean(menuAnchorEl?.[project.id])}
                onClose={() => onMenuClose(project.id)}
                MenuListProps={{
                  "aria-labelledby": `action-button-${project.id}`,
                }}
              >
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateReport(project);
                    onMenuClose(project.id);
                  }}
                >
                  <Construction sx={{ mr: 1 }} />
                  Print Report
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project);
                    onMenuClose(project.id);
                  }}
                >
                  <DeleteIcon sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>{" "}
      {/* end header + actions wrapper */}
      <CardContent sx={{ pt: 2, flex: 1 }}>
        {project.project_developer && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {"Resource Couple: " + project.project_development_couple}
          </Typography>
        )}

        {project.project_id && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {project.project_id}
          </Typography>
        )}

        {project.status === "completed" && (
          <Chip
            label="Ready for Day of Service"
            color="success"
            size="small"
            sx={{
              textTransform: "capitalize",
              mb: 2,
            }}
          />
        )}

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} md={6}>
            {project.is_dumpster_needed && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <DumpsterIcon color="primary" size="small" sx={{ mr: 1 }} />
                  Dumpsters
                  {project.is_second_dumpster_needed && (
                    <Chip
                      label={"x 2"}
                      color="primary"
                      size="small"
                      sx={{
                        ml: 1,
                        backgroundColor: theme.palette.primary.light,
                      }}
                    />
                  )}
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            {project.are_blue_stakes_needed && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "right",
                  }}
                >
                  {project.called_811 ? (
                    <CheckCircle color="primary" size="small" sx={{ mr: 1 }} />
                  ) : (
                    <Flag color="info" size="small" sx={{ mr: 1 }} />
                  )}
                  Blue Stakes
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {showAccordion && onEditPartnerWard && (
          <Accordion
            elevation={1}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              "&:before": {
                display: "none",
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="contact-info-content"
              id="contact-info-header"
              sx={{
                backgroundColor: theme.palette.background.default,
                display: "flex",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "1rem", md: "1rem" },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Phone sx={{ mr: 1 }} />
                Group Construction &amp; Contact Information
              </Typography>

              {!project.partner_ward && (
                <>
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      color: "#cf6179",
                      display: "flex",
                      alignItems: "center",
                      mt: 1,
                      mr: 2,
                    }}
                  >
                    Partner Group not Assigned
                  </Typography>
                </>
              )}
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ position: "relative", mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Partner Group: {project.partner_ward || "Not set"}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPartnerWard(project);
                  }}
                  sx={{ position: "absolute", top: 0, right: 0 }}
                >
                  Edit
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 1 }}>
                    {project.partner_ward_liaison && (
                      <Typography variant="h6" gutterBottom>
                        {project.partner_ward_liaison}
                      </Typography>
                    )}
                    {project.partner_ward_liaison_title && (
                      <Typography variant="body2" color="text.secondary">
                        Title: {project.partner_ward_liaison_title}
                      </Typography>
                    )}
                    {project.partner_ward_liaison_phone1 && (
                      <Typography variant="body2" color="text.secondary">
                        Email: {project.partner_ward_liaison_email1}
                      </Typography>
                    )}
                    {project.partner_ward_liaison_email2 && (
                      <Typography variant="body2" color="text.secondary">
                        Phone: {project.partner_ward_liaison_phone1}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 1 }}>
                    {project.partner_ward_liaison2 && (
                      <Typography variant="h6" gutterBottom>
                        {project.partner_ward_liaison2}
                      </Typography>
                    )}
                    {project.partner_ward_liaison_title2 && (
                      <Typography variant="body2" color="text.secondary">
                        Title: {project.partner_ward_liaison_title2}
                      </Typography>
                    )}
                    {project.partner_ward_liaison_email2 && (
                      <Typography variant="body2" color="text.secondary">
                        Email: {project.partner_ward_liaison_email2}
                      </Typography>
                    )}
                    {project.partner_ward_liaison_phone2 && (
                      <Typography variant="body2" color="text.secondary">
                        Phone: {project.partner_ward_liaison_phone2}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  icon={<CalendarToday />}
                  label={`Created: ${formatDate(project.created_at)}`}
                  size={isMobile ? "small" : "medium"}
                  sx={{ mb: 1 }}
                />
                {project.updated_at &&
                  project.updated_at !== project.created_at && (
                    <Chip
                      icon={<CalendarToday />}
                      label={`Updated: ${formatDate(project.updated_at)}`}
                      size={isMobile ? "small" : "medium"}
                      sx={{ mb: 1 }}
                    />
                  )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

const DumpsterIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 576 512">
      <path d="M49.7 32c-10.5 0-19.8 6.9-22.9 16.9L.9 133c-.6 2-.9 4.1-.9 6.1C0 150.7 9.3 160 20.9 160l94 0L140.5 32 49.7 32zM272 160l0-128-98.9 0L147.5 160 272 160zm32 0l124.5 0L402.9 32 304 32l0 128zm157.1 0l94 0c11.5 0 20.9-9.3 20.9-20.9c0-2.1-.3-4.1-.9-6.1L549.2 48.9C546.1 38.9 536.8 32 526.3 32l-90.8 0 25.6 128zM32 192l4 32-4 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l12 0L64 448c0 17.7 14.3 32 32 32s32-14.3 32-32l320 0c0 17.7 14.3 32 32 32s32-14.3 32-32l20-160 12 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-4 0 4-32L32 192z" />
    </SvgIcon>
  );
};
