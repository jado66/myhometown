"use client";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import { Container, Stack } from "@mui/material";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/util/Loading";
import NextLink from "next/link";
import PermissionGuard from "@/guards/permission-guard";
import { useRouter } from "next/navigation";
import DevEnvGuard from "@/guards/dev-env-guard";
import UserGuard from "@/guards/user-guard";

const AdminDashboardPages = () => {
  const theme = useTheme();

  const { user, isLoading } = useUser();

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return (
    <Box>
      <Box
        position={"relative"}
        sx={{
          backgroundColor: theme.palette.alternate.main,
        }}
      >
        <Container>
          {/* {<pre>{JSON.stringify(user, null, 2)}</pre>} */}
          <Box padding={5}>
            <Box marginBottom={4}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  fontWeight: "medium",
                }}
                gutterBottom
                color={"primary"}
                align={"center"}
              >
                Admin dashboard
              </Typography>
              <Box
                component={Typography}
                fontWeight={700}
                variant={"h3"}
                align={"center"}
                gutterBottom
              >
                Manage your groups or use admin tools
              </Box>
              <Typography
                variant={"h6"}
                component={"p"}
                color={"textSecondary"}
                align={"center"}
              >
                Welcome to the admin dashboard.
              </Typography>
            </Box>

            {isLoading && (
              <Grid
                container
                spacing={4}
                justifyContent={"center"}
                alignItems={"center"}
                mt={5}
              >
                <Loading size={50} />
              </Grid>
            )}

            <Grid
              container
              spacing={4}
              sx={{
                visibility: !isLoading ? "visible" : "hidden",
                justifyContent: "center",
              }}
            >
              {[
                {
                  title: "User Management",
                  subtitle:
                    "Add, remove, or edit users and their roles to manage who can access your city or community.",
                  media: "/admin-icons/User Management.svg",
                  href: rootUrl + "/admin-dashboard/manage-users",
                  requiredPermission: "admin",
                },
                {
                  title: "City Management",
                  subtitle:
                    "Manage your cities. Add, remove, or edit city information.",
                  media: "/admin-icons/City Management.svg",
                  href: rootUrl + "/admin-dashboard/cities",
                  // requiredPermission: "cityManagement",
                },
                {
                  title: "Community Management",
                  subtitle:
                    "Manage your communities. Add, remove, or edit community information.",
                  media: "/admin-icons/Community Management.svg",
                  href: rootUrl + "/admin-dashboard/communities",
                  // requiredPermission: "communityManagement",
                },
                {
                  title: "Classes and Rolls",
                  subtitle:
                    "View your classes and rolls. Take attendance and manage your classes.",
                  media: "/admin-icons/Classes and Rolls.svg",
                  href: rootUrl + "/admin-dashboard/classes",
                },
                {
                  title: "Days of Service",
                  subtitle:
                    "View and manage your days of service. Track your projects and volunteers.",
                  media: "/admin-icons/Days of Service.svg",
                  href: rootUrl + "/admin-dashboard/days-of-service",
                },

                {
                  title: "Texting & Communications",
                  subtitle:
                    "Manage all text communications for your city or community members.",
                  media: "/admin-icons/Text SMS Communications.svg",
                  href: rootUrl + "/admin-dashboard/texting",
                  requiredPermission: "texting",
                },

                {
                  title: "Missionary Management",
                  subtitle:
                    "Manage your missionaries. Add, remove, or edit missionary information. Log their service hours and track your progress.",
                  media: "/admin-icons/missionary-management.png",
                  href: rootUrl + "/admin-dashboard/missionaries",
                  requiredPermission: "administrator",
                },
                {
                  title: "Missionary Logs",
                  subtitle:
                    "View and manage missionary logs. Track your service hours and progress.",
                  media: "/admin-icons/missionary-logs.png",
                  href: rootUrl + "/admin-dashboard/missionary-hours",
                  requiredPermission: "administrator",
                },
              ].map((item, i) => (
                <PermissionGuard
                  requiredPermission={item.requiredPermission}
                  user={user}
                  key={i}
                >
                  <AdminDashboardCard item={item} i={i} />
                </PermissionGuard>
              ))}

              <UserGuard
                allowedEmails={["jado66@gmail.com", "kcraven10@gmail.com"]}
                user={user}
              >
                <AdminDashboardCard
                  item={{
                    title: "App Health",
                    subtitle: "Manage your application health and performance.",
                    media: "/admin-icons/health.png",
                    href: rootUrl + "/admin-dashboard/health",
                  }}
                  i={-1}
                />
              </UserGuard>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboardPages;

const AdminDashboardCard = ({ item, i }) => {
  const theme = useTheme();

  const router = useRouter();

  const onClick = () => {
    router.push(item.href);
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={i}>
      <Box
        display={"block"}
        width={"100%"}
        height={"100%"}
        sx={{
          textDecoration: "none",
          transition: "all .2s ease-in-out",
          "&:hover": {
            transform: `translateY(-${theme.spacing(1 / 2)})`,
          },
          cursor: !item.actions ? "pointer" : "",
        }}
        onClick={(e) => {
          if (!item.actions && onClick) {
            onClick(e);
          }
        }}
      >
        <Box
          component={Card}
          width={"100%"}
          height={"100%"}
          data-aos={"fade-up"}
          borderRadius={3}
        >
          <Box
            component={"img"}
            src={item.media}
            sx={{
              width: "100%",
              height: "140px",
              mx: "auto",
            }}
          />
          <Box component={CardContent}>
            <Box
              component={Typography}
              variant={"h6"}
              gutterBottom
              fontWeight={500}
              align={"left"}
            >
              {item.title}
            </Box>
            <Typography align={"left"} variant={"body2"} color="textSecondary">
              {item.subtitle}
            </Typography>
          </Box>
          <Box component={CardActions}>
            {item.actions && (
              <Stack
                direction="row"
                spacing={1}
                justifyContent={"space-between"}
                sx={{ flexGrow: 1, px: 1 }}
              >
                {item.actions.map((action, index) => (
                  <NextLink key={index} href={action.href}>
                    <Button size="small">{action.label}</Button>
                  </NextLink>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};
