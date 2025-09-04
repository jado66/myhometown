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
import BackButton from "@/components/BackButton";

const TextingOverviewPage = () => {
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
                Texting & Communications
              </Typography>
              <Box
                component={Typography}
                fontWeight={700}
                variant={"h3"}
                align={"center"}
                gutterBottom
              >
                Manage all your text communications
              </Box>
              <Typography
                variant={"h6"}
                component={"p"}
                color={"textSecondary"}
                align={"center"}
              >
                Send messages, manage contacts, view logs, and schedule texts
                for your community.
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
                  title: "Contact Directory",
                  subtitle:
                    "Add, edit, or remove contacts and manage your texting directory.",
                  media: "/admin-icons/Directory Management.svg",
                  href: rootUrl + "/admin-dashboard/texting/directory",
                  requiredPermission: "texting",
                },
                {
                  title: "Send Messages",
                  subtitle:
                    "Compose and send text messages to individuals or groups in your community.",
                  media: "/admin-icons/Send Text.svg",
                  href: rootUrl + "/admin-dashboard/texting/send",
                  requiredPermission: "texting",
                },

                {
                  title: "Scheduled Messages",
                  subtitle:
                    "Schedule messages for future delivery and manage upcoming communications.",
                  media: "/admin-icons/Scheduled Messages.svg",
                  href: rootUrl + "/admin-dashboard/texting/scheduled-messages",
                  requiredPermission: "texting",
                },
                {
                  title: "Texting Logs",
                  subtitle:
                    "Review sent messages, delivery status, and communication history.",
                  media: "/admin-icons/Message Logs.svg",
                  href: rootUrl + "/admin-dashboard/texting/logs",
                  requiredPermission: "texting",
                },
              ].map((item, i) => (
                <PermissionGuard
                  requiredPermission={item.requiredPermission}
                  user={user}
                  key={i}
                >
                  <TextingCard item={item} i={i} />
                </PermissionGuard>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default TextingOverviewPage;

const TextingCard = ({ item, i }) => {
  const theme = useTheme();
  const router = useRouter();

  const onClick = () => {
    router.push(item.href);
  };

  return (
    <Grid item xs={12} sm={6} md={6} key={i}>
      <BackButton
        onClick={() => router.back()}
        sx={{
          position: "absolute",
          top: theme.spacing(2),
          left: theme.spacing(2),
          zIndex: 1,
        }}
        text={"Back to Admin Dashboard"}
      />

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
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        <Box
          component={Card}
          width={"100%"}
          height={"100%"}
          data-aos={"fade-up"}
          borderRadius={3}
        >
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
        </Box>
      </Box>
    </Grid>
  );
};
