"use client";

import {
  Box,
  Card,
  Chip,
  Button,
  Typography,
  Tooltip,
  SvgIcon,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Construction,
  CheckCircle,
  Delete as DeleteIcon,
  Description as ReportIcon,
  Edit as EditIcon,
  Flag,
  Group,
  LocationOn,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

export const ProjectCard = ({
  project,
  onProjectClick,
  onGenerateReport,
  onDelete,
  onEditPartnerWard,
  menuAnchorEl,
  onMenuOpen,
  onMenuClose,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const getProjectTitle = (project) => {
    if (!project.project_name) return `Project ${project.id.slice(0, 8)}…`;
    return project.project_name.length > 30
      ? `${project.project_name.substring(0, 30)}…`
      : project.project_name;
  };

  const isCompleted = project.status === "completed";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s ease",
        borderColor: isCompleted ? "success.main" : undefined,
        borderWidth: isCompleted ? 2 : 1,
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderColor: isCompleted ? "success.main" : "primary.light",
        },
      }}
      onClick={() => onProjectClick(project.id)}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 1.5,
          p: 1.5,
        }}
      >
        {/* Colored icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: isCompleted ? "success.main" : "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          {isCompleted ? (
            <CheckCircle fontSize="small" />
          ) : (
            <Construction fontSize="small" />
          )}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getProjectTitle(project)}
            </Typography>
            {isCompleted && (
              <Chip
                label="Ready"
                color="success"
                size="small"
                sx={{ height: 18, fontSize: "0.65rem" }}
              />
            )}
          </Box>

          {/* Address row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 0.25,
            }}
          >
            {project.address_street1 && project.address_city ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <LocationOn sx={{ fontSize: 13, mr: 0.25 }} />
                {`${project.address_street1}, ${project.address_city}`}
              </Typography>
            ) : (
              <Typography variant="caption" color="warning.main">
                No address set
              </Typography>
            )}
          </Box>

          {/* Partner group + contact row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 0.25,
            }}
          >
            {project.partner_ward ? (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Group: {project.partner_ward}
                  {project.partner_ward_liaison &&
                    ` · ${project.partner_ward_liaison}`}
                </Typography>
                {onEditPartnerWard && (
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPartnerWard(project);
                    }}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      fontSize: "0.65rem",
                      textTransform: "none",
                      textDecoration: "underline",
                      verticalAlign: "baseline",
                      "&:hover": {
                        textDecoration: "underline",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    Edit
                  </Button>
                )}
              </>
            ) : (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ display: "flex", alignItems: "center" }}
              >
                No group assigned.{" "}
                {onEditPartnerWard && (
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPartnerWard(project);
                    }}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      ml: 0.5,
                      fontSize: "inherit",
                      textTransform: "none",
                      textDecoration: "underline",
                      verticalAlign: "baseline",
                      "&:hover": {
                        textDecoration: "underline",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    Add group
                  </Button>
                )}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right column: icons top, actions bottom */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexShrink: 0,
            gap: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sub-info icons — top right */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            {project.volunteers_needed > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
              >
                <Group sx={{ fontSize: 13 }} />
                {project.volunteers_needed}
              </Typography>
            )}

            {project.is_dumpster_needed && (
              <Tooltip
                title={
                  project.is_second_dumpster_needed
                    ? "2 Dumpsters"
                    : "Dumpster needed"
                }
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DumpsterIcon color="primary" sx={{ fontSize: 14 }} />
                  {project.is_second_dumpster_needed && (
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ ml: 0.25 }}
                    >
                      ×2
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            )}

            {project.are_blue_stakes_needed && (
              <Tooltip
                title={
                  project.called_811
                    ? "Blue Stakes — 811 called"
                    : "Blue Stakes needed"
                }
              >
                {project.called_811 ? (
                  <CheckCircle color="primary" sx={{ fontSize: 14 }} />
                ) : (
                  <Flag color="info" sx={{ fontSize: 14 }} />
                )}
              </Tooltip>
            )}
          </Box>

          {/* Actions — bottom right */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {!isSmallScreen ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectClick(project.id);
                  }}
                  sx={{ textTransform: "none", fontSize: "0.75rem", px: 1 }}
                >
                  View Project
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ReportIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateReport(project);
                  }}
                  sx={{ textTransform: "none", fontSize: "0.75rem", px: 1 }}
                >
                  Report
                </Button>
                <IconButton
                  size="small"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  size="small"
                  aria-label="more-actions"
                  aria-controls={`action-menu-${project.id}`}
                  aria-haspopup="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuOpen(e, project.id);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                  id={`action-menu-${project.id}`}
                  anchorEl={menuAnchorEl?.[project.id]}
                  open={Boolean(menuAnchorEl?.[project.id])}
                  onClose={() => onMenuClose(project.id)}
                >
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectClick(project.id);
                      onMenuClose(project.id);
                    }}
                  >
                    <ViewIcon sx={{ mr: 1 }} fontSize="small" />
                    View
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateReport(project);
                      onMenuClose(project.id);
                    }}
                  >
                    <Construction sx={{ mr: 1 }} fontSize="small" />
                    Print Report
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project);
                      onMenuClose(project.id);
                    }}
                  >
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

const DumpsterIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 576 512">
    <path d="M49.7 32c-10.5 0-19.8 6.9-22.9 16.9L.9 133c-.6 2-.9 4.1-.9 6.1C0 150.7 9.3 160 20.9 160l94 0L140.5 32 49.7 32zM272 160l0-128-98.9 0L147.5 160 272 160zm32 0l124.5 0L402.9 32 304 32l0 128zm157.1 0l94 0c11.5 0 20.9-9.3 20.9-20.9c0-2.1-.3-4.1-.9-6.1L549.2 48.9C546.1 38.9 536.8 32 526.3 32l-90.8 0 25.6 128zM32 192l4 32-4 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l12 0L64 448c0 17.7 14.3 32 32 32s32-14.3 32-32l320 0c0 17.7 14.3 32 32 32s32-14.3 32-32l20-160 12 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-4 0 4-32L32 192z" />
  </SvgIcon>
);
