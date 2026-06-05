import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import RoleGuard from '@/guards/role-guard';
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/util/Loading";
import PermissionGuard from "@/guards/permission-guard";
import {
  Avatar,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase";

const SidebarNav = ({ pages, onClose }) => {
  const { user, isLoading } = useUser();
  const theme = useTheme();
  const [activeLink, setActiveLink] = useState("");

  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    setActiveLink(window && window.location ? window.location.pathname : "");
  }, []);

  const rootUrl = process.env.NEXT_PUBLIC_DOMAIN;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogOut = async () => {
    handleMenuClose();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Error logging out");
      console.error("Error logging out:", error.message);
    } else {
      toast.success("Logged out");
      router.push("/");
    }
  };

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "";
  const avatarInitial = (
    user?.first_name?.[0] ||
    user?.email?.[0] ||
    ""
  ).toUpperCase();

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
            href={rootUrl + `/admin-dashboard`}
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

      {user?.id && (
        <Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleMenuOpen}
              aria-haspopup="true"
              aria-expanded={menuOpen ? "true" : undefined}
              endIcon={<ExpandMoreIcon />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                px: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 14,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {avatarInitial}
                </Avatar>
                <Box sx={{ minWidth: 0, textAlign: "left" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName}
                  </Typography>
                  {user?.email && displayName !== user.email && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              transformOrigin={{ vertical: "bottom", horizontal: "center" }}
              slotProps={{
                paper: { sx: { width: anchorEl?.offsetWidth } },
              }}
            >
              <MenuItem onClick={handleLogOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Log Out
              </MenuItem>
            </Menu>
        </Box>
      )}
    </Box>
  );
};

SidebarNav.propTypes = {
  pages: PropTypes.array.isRequired,
  onClose: PropTypes.func,
};

export default SidebarNav;
