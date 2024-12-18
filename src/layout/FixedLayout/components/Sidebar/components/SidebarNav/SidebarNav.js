import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
// import RoleGuard from '@/guards/role-guard';
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/util/Loading";
import PermissionGuard from "@/guards/permission-guard";
import { Divider } from "@mui/material";

const SidebarNav = ({ pages, onClose }) => {
  const { user, isLoading } = useUser();
  const theme = useTheme();
  const [activeLink, setActiveLink] = useState("");
  useEffect(() => {
    setActiveLink(window && window.location ? window.location.pathname : "");
  }, []);

  if (isLoading) {
    return (
      <Box justifyContent={"center"} display="flex">
        <Loading />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        justifyContent={"flex-end"}
        onClick={() => onClose()}
        sx={{ display: { md: "none", sm: "flex" } }}
      >
        <CloseIcon fontSize="small" />
      </Box>

      <Box>
        <Box marginBottom={1 / 2}>
          <Button
            component={"a"}
            href="/admin-dashboard"
            fullWidth
            sx={{
              justifyContent: "flex-start",
              color: theme.palette.text.primary,
              backgroundColor: "transparent",
              textTransform: "uppercase",
              fontSize: 12,
              fontWeight: 700,
            }}
            onClick={() => onClose()}
            style={{ paddingLeft: 0 }}
          >
            Admin Dashboard
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {pages().map((item, i) => (
          <PermissionGuard
            key={i}
            requiredPermission={item.requiredPermission}
            user={user}
          >
            <Box marginBottom={3}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 1,
                  display: "block",
                }}
              >
                {item.title}
              </Typography>
              <Box>
                {item.pages.map((p, i) => (
                  <PermissionGuard
                    requiredPermission={p.requiredPermission}
                    key={i}
                    user={user}
                  >
                    <Box marginBottom={1 / 2} key={i}>
                      <Button
                        component={"a"}
                        href={p.href}
                        target={p.target}
                        fullWidth
                        sx={{
                          justifyContent: "flex-start",
                          color:
                            activeLink === p.href
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                          backgroundColor:
                            activeLink === p.href
                              ? alpha(theme.palette.primary.main, 0.1)
                              : "transparent",
                          fontWeight: activeLink === p.href ? 600 : 400,
                        }}
                        onClick={() => onClose()}
                      >
                        {p.title}
                      </Button>
                    </Box>
                  </PermissionGuard>
                ))}
              </Box>
            </Box>
          </PermissionGuard>
        ))}
      </Box>

      <Box>
        <Button variant="outlined" fullWidth component="a" href="/">
          Log Out
        </Button>
      </Box>
    </Box>
  );
};

SidebarNav.propTypes = {
  pages: PropTypes.array.isRequired,
  onClose: PropTypes.func,
};

export default SidebarNav;
