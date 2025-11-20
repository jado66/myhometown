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
import { ShowIfAuthenticatedOnce } from "@/guards/withAuthenticatedOnce";
import { useRouter, useSearchParams } from "next/navigation";
import DevEnvGuard from "@/guards/dev-env-guard";
import UserGuard from "@/guards/user-guard";

const AdminDashboardPages = () => {
  const theme = useTheme();
  const searchParams = useSearchParams();

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return (
    <Box>
      <Box position={"relative"}>
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
                myHometown Login
              </Typography>
              <Box
                component={Typography}
                fontWeight={700}
                variant={"h3"}
                align={"center"}
                gutterBottom
              >
                Select the login method you would like to use.
              </Box>
            </Box>

            <Grid
              container
              spacing={4}
              sx={{
                justifyContent: "center",
              }}
            >
              {[
                {
                  title: "Classes and Rolls",
                  subtitle:
                    "View your classes and rolls. Take attendance and manage your classes.",
                  media: "/admin-icons/Classes and Rolls.svg",
                  href: "/admin-dashboard/classes",
                },
                {
                  title: "Days of Service",
                  subtitle:
                    "View and manage your days of service. Track your projects and volunteers.",
                  media: "/admin-icons/Days of Service.svg",
                  href: "/admin-dashboard/days-of-service",
                },

                // {
                //   title: "Missionary Hours",
                //   subtitle:
                //     "View and manage your missionary hours. Track your service hours and progress.",
                //   media: "/admin-icons/missionary-logs.png",
                //   href: "/admin-dashboard/missionary-hours",
                // },
                // {
                //   title: "Volunteer Hours",
                //   subtitle:
                //     "View and manage your volunteer hours. Track your service hours and progress.",
                //   media: "/admin-icons/missionary-logs.png",
                //   href: "/admin-dashboard/volunteer-hours",
                // },
                {
                  title: "Missionaries & Volunteers Management",
                  subtitle:
                    "Manage your missionaries & volunteers. Add, remove, or edit missionary information.",
                  media: "/admin-icons/missionary-management.png",
                  href: "/admin-dashboard/missionaries",
                  requiredPermission: "missionary_volunteer_management",
                },
                {
                  title: "Content Management & Global Admin",
                  subtitle:
                    "Manage city and community pages, classes, texting and communications, or global management.",
                  media: "/admin-icons/User Management.svg",
                  href: "/admin-dashboard",
                },
              ].map((item, i) => (
                <AdminDashboardCard
                  item={item}
                  i={i}
                  returnTo={searchParams.get("returnTo")}
                />
              ))}

              {/* Design Hub - only show if they've authenticated previously */}
              <ShowIfAuthenticatedOnce>
                <AdminDashboardCard
                  item={{
                    title: "Design Hub",
                    subtitle:
                      "Create and order custom flyers, certificates, signs, and banners for your community.",
                    media: "/admin-icons/Design Hub.svg",
                    href: "/admin-dashboard/design-hub",
                  }}
                  i={999}
                  returnTo={searchParams.get("returnTo")}
                />
              </ShowIfAuthenticatedOnce>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboardPages;

const AdminDashboardCard = ({ item, i, returnTo }) => {
  const theme = useTheme();

  const router = useRouter();

  const onClick = () => {
    const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";
    const targetUrl = rootUrl + item.href;

    // If there's a returnTo parameter and it starts with this card's target path,
    // redirect to the specific returnTo URL
    if (returnTo) {
      const decodedReturnTo = decodeURIComponent(returnTo);
      if (decodedReturnTo.includes(item.href)) {
        router.push(decodedReturnTo);
        return;
      }
    }

    router.push(targetUrl);
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
