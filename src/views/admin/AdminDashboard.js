"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Container, Divider } from "@mui/material";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/util/Loading";
import NextLink from "next/link";
import PermissionGuard from "@/guards/permission-guard";
import { GetApp } from "@/components/GetApp";

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
                  media: "/users.png",
                  href: rootUrl + "/admin-dashboard/manage-users",
                  requiredPermission: "admin",
                },
                {
                  title: "City Management",
                  subtitle:
                    "Manage your cities. Add, remove, or edit city information.",
                  media: "/cities.png",
                  href: rootUrl + "/admin-dashboard/cities",
                  // requiredPermission: "cityManagement",
                },
                {
                  title: "Community Management",
                  subtitle:
                    "Manage your communities. Add, remove, or edit community information.",
                  media: "/community.png",
                  href: rootUrl + "/admin-dashboard/communities",
                  // requiredPermission: "communityManagement",
                },
                {
                  title: "Classes and Rolls",
                  subtitle:
                    "View your classes and rolls. Take attendance and manage your classes.",
                  media: "/school.png",
                  href: rootUrl + "/admin-dashboard/classes",
                },
                {
                  title: "Days of Service",
                  subtitle:
                    "View and manage your days of service. Track your projects and volunteers.",
                  media: "/days-of-service.png",
                  href: rootUrl + "/admin-dashboard/days-of-service",
                },
                // {
                //   title: "Volunteer Signups",
                //   subtitle:
                //     "View volunteer signups. Track who has been contacted.",
                //   media: "/volunteer.png",
                //   href: rootUrl + "/admin-dashboard/volunteer-signups",
                // },
                // {
                //   title: "Email Communications",
                //   subtitle: "Send emails to your city or community members. ",
                //   media: "/message.png",
                //   href: rootUrl + "/maintenance",
                // },
                {
                  title: "Text (SMS) Communications",
                  subtitle:
                    "Send text notifications to your city or community members. ",
                  media: "/text.png",
                  href: rootUrl + "/admin-dashboard/tools/sms",
                  // requiredPermission: "texting",
                },
                // // {
                //   title: 'Give Butter Campaigns',
                //   subtitle:
                //     'Create and manage Give Butter campaigns.',
                //   media: '/give-butter.png',
                //   href: '/maintenance'
                // },
              ].map((item, i) => (
                <PermissionGuard
                  requiredPermission={item.requiredPermission}
                  user={user}
                >
                  <AdminDashboardCard item={item} i={i} />
                </PermissionGuard>
              ))}
              <Divider sx={{ my: 2, width: "100%" }} />
              <GetApp />
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

  return (
    <Grid item xs={12} sm={6} md={4} key={i}>
      <NextLink href={item.href} key={i} style={{ textDecoration: "none" }}>
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
          }}
        >
          <Box
            component={Card}
            width={"100%"}
            height={"100%"}
            data-aos={"fade-up"}
            borderRadius={3}
          >
            {/* <Card
              image={item.media}
              title={item.title}
              sx={{
                height: 140,
              }}
            /> */}
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
              <Typography
                align={"left"}
                variant={"body2"}
                color="textSecondary"
              >
                {item.subtitle}
              </Typography>
            </Box>
            <Box component={CardActions} justifyContent={"flex-end"}>
              <Button size="small" href={item.href}>
                Manage
              </Button>
            </Box>
          </Box>
        </Box>
      </NextLink>
    </Grid>
  );
};
