"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import useCommunities from "@/hooks/use-communities";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import AddEditCommunityDialog from "@/components/data-tables/AddEditCommunityDialog";
import { DataTable } from "@/components/data-tables/DataTable";
import { createCommunityColumns } from "@/constants/columns";
import {
  Grid,
  CardContent,
  Box,
  Typography,
  Link,
  Divider,
  CardMedia,
  CardActions,
  Button,
} from "@mui/material";
import BackButton from "@/components/BackButton";
import Loading from "@/components/util/Loading";
import { faker } from "@faker-js/faker";
import { useTheme } from "@mui/material/styles";
import { useUser } from "@/hooks/use-user";
import RoleGuard from "@/guards/role-guard";
import { NotResponsiveAlert } from "@/util/NotResponsiveAlert";
import { useRouter } from "next/navigation";

export default function Management() {
  const theme = useTheme();
  const router = useRouter();

  const { user, isLoading } = useUser();

  // Initial state for communityToEdit is null.
  const [communityToEdit, setCommunityToEdit] = useState(null);
  const [communityTableColumns, setCommunityTableColumns] = useState([{}]);

  const {
    communities,
    handleAddCommunity,
    handleEditCommunity,
    handleDeleteCommunity,
    hasLoaded,
  } = useCommunities(user);
  const [showAddCommunityForm, setShowAddCommunityForm] = useState(false);
  const [showConfirmDeleteCommunity, setShowConfirmDeleteCommunity] =
    useState(false);
  const [confirmDeleteCommunityProps, setConfirmDeleteCommunityProps] =
    useState({});

  const fakeCommunityImages = Array.from({ length: 3 }, () =>
    faker.image.urlLoremFlickr({ category: "community" })
  );

  const handleAskDeleteCommunity = (communityId) => {
    const community = communities.find((c) => c._id === communityId);

    setConfirmDeleteCommunityProps({
      title: "Delete Community",
      description: `Are you sure you want to delete ${community.name}?`,
      onConfirm: () => {
        handleDeleteCommunity(community);
        setShowConfirmDeleteCommunity(false);
      },
      onCancel: () => setShowConfirmDeleteCommunity(false),
      onClose: () => setShowConfirmDeleteCommunity(false),
    });
    setShowConfirmDeleteCommunity(true);
  };

  const handleEditCommunitySubmit = (community) => {
    handleEditCommunity(communityToEdit, community);
    setCommunityToEdit(null);
  };

  const handleCloseCommunityForm = () => {
    setShowAddCommunityForm(false);
    setCommunityToEdit(null);
  };

  const toggleVisibility = (communityId) => {
    const community = communities.find((c) => c._id === communityId);

    // Call the function to toggle the visibility of the community.
    const updatedCommunity = {
      ...community,
      visibility: !community.visibility,
    };

    setConfirmDeleteCommunityProps({
      title: "Update Community Visibility",
      description: `Are you sure you want to make ${community.name} ${
        updatedCommunity.visibility ? "public" : "hidden"
      }?`,
      onConfirm: () => {
        handleEditCommunity(community, updatedCommunity);
        setShowConfirmDeleteCommunity(false);
      },
      onCancel: () => setShowConfirmDeleteCommunity(false),
      onClose: () => setShowConfirmDeleteCommunity(false),
    });
    setShowConfirmDeleteCommunity(true);

    // Call the function to update the community.
  };

  useEffect(() => {
    if (communityToEdit) {
      setShowAddCommunityForm(true);
    }
  }, [communityToEdit]);

  useEffect(() => {
    if (user) {
      const columns = createCommunityColumns(
        handleAskDeleteCommunity,
        setCommunityToEdit,
        toggleVisibility,
        user
      );
      setCommunityTableColumns(columns);
    }
  }, [user]);

  if (!hasLoaded) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        sx={{ height: "100vh", padding: "5em" }}
      >
        <Loading size={50} />
      </Box>
    );
  }

  const goToViewCommunity = (community) => {
    // alert(JSON.stringify(community, null, 4));

    const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

    router.push(
      rootUrl +
        `/${community.state
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${community.city
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${community.name
          .toLowerCase()
          .replaceAll(/\s/g, "-")}
        `
    );
  };

  const goToEditCommunity = (community) => {
    // alert(JSON.stringify(community, null, 4));

    const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

    router.push(
      rootUrl +
        `/edit/${community.state
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${community.city
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${community.name
          .toLowerCase()
          .replaceAll(/\s/g, "-")}
        `
    );
  };

  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <BackButton />
      <NotResponsiveAlert sx={{ mt: 8 }} />

      <AskYesNoDialog
        {...confirmDeleteCommunityProps}
        open={showConfirmDeleteCommunity}
      />
      <AddEditCommunityDialog
        open={showAddCommunityForm}
        handleClose={handleCloseCommunityForm}
        onSubmitForm={
          communityToEdit ? handleEditCommunitySubmit : handleAddCommunity
        }
        initialCommunityState={communityToEdit}
      />

      <Card
        sx={{
          width: "100%",
          m: 3,
          p: 3,
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
          overflowX: "auto",
        }}
      >
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
            Admin Community Management
          </Typography>
          <Box
            component={Typography}
            fontWeight={700}
            variant={"h3"}
            align={"center"}
            gutterBottom
          >
            Manage your communities.
          </Box>
        </Box>

        {communities.length === 0 && hasLoaded && (
          <>
            <Divider width="50%" sx={{ mx: "auto", mb: 3 }} />
            <Typography
              variant={"subtitle1"}
              component={"p"}
              color={"textSecondary"}
              align={"center"}
              gutterBottom
            >
              You don&apos;t have any communities assigned to your account.
            </Typography>
            <Typography variant={"subtitle2"} align={"center"}>
              Expected something different?{" "}
              <Link
                component={"a"}
                color={"primary"}
                href={"mailto:admin-representative@myhometown.org"}
                underline={"none"}
              >
                Contact a myHometown Admin.
              </Link>
            </Typography>
          </>
        )}

        {communities.length < 3 &&
          user.role !== "Admin" &&
          communities.length > 0 &&
          hasLoaded && (
            <Box display="flex" justifyContent="center" width="100%">
              {communities.map((community, i) => (
                <Grid item xs={12} sm={6} md={4} key={i} mx={2}>
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
                  >
                    <Box
                      component={Card}
                      width={"100%"}
                      height={"100%"}
                      data-aos={"fade-up"}
                      borderRadius={3}
                      onClick={() => goToEditCommunity(community)}
                    >
                      <CardMedia
                        image={
                          community?.content?.galleryPhotos["1"].src ||
                          fakeCommunityImages[i]
                        }
                        title={community.name}
                        sx={{
                          height: 140,
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
                          {community.name}
                        </Box>
                      </Box>
                      <Box component={CardActions} justifyContent={"flex-end"}>
                        <Button
                          size="small"
                          href=""
                          onClick={goToViewCommunity}
                        >
                          View Community Page
                        </Button>
                        <Button
                          size="small"
                          href=""
                          onClick={goToEditCommunity}
                        >
                          Edit Community Page
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Box>
          )}

        {hasLoaded && (communities.length >= 3 || user.role === "Admin") && (
          <DataTable
            id="community"
            rows={communities}
            columns={communityTableColumns}
            hiddenColumns={["_id", "country", "state"]}
          />
        )}

        <RoleGuard requiredRole="admin" user={user}>
          <Grid sx={{ mt: 3 }}>
            <Box display="flex" justifyContent="center" width="100%">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowAddCommunityForm(true)}
              >
                Add a Community
              </Button>
            </Box>
          </Grid>
        </RoleGuard>
      </Card>
    </Grid>
  );
}
