"use client";

import { Box, Card, CardActionArea, Typography, Button } from "@mui/material";
import {
  Edit as EditIcon,
  Description as ReportIcon,
  Business,
  Construction as ViewIcon,
} from "@mui/icons-material";

export const StakeCard = ({
  stake,
  day,
  onClick,
  onEdit,
  onGenerateReport,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderColor: "primary.light",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: { xs: "flex-start", lg: "center" },
          gap: 2,
          p: 2,
        }}
      >
        {/* Icon + Info wrapper for small screens */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 0,
            width: { xs: "100%", lg: "auto" },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Business fontSize="small" />
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {stake.name}
            </Typography>
            {stake.liaison_name_1 ? (
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
                Contact: {stake.liaison_name_1}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{
                  display: "block",
                }}
              >
                No contact info.{" "}
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(day.id, stake);
                  }}
                  disabled={day.is_locked}
                  sx={{
                    minWidth: 0,
                    p: 0,
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
                  Add contact
                </Button>
              </Typography>
            )}
          </Box>
        </Box>
        {/* end Icon+Info wrapper */}

        {/* Actions */}
        <Box
          className="stake-actions"
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
            width: { xs: "100%", lg: "auto" },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onClick(day, stake);
            }}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              px: 1,
            }}
          >
            View/Add Projects
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(day.id, stake)}
            disabled={day.is_locked}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              px: 1,
            }}
          >
            Edit Organization
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ReportIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onGenerateReport(stake.id, day.end_date, day);
            }}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              px: 1,
            }}
          >
            Print Organization Report
          </Button>
        </Box>
      </Box>
    </Card>
  );
};
