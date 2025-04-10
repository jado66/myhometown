"use client";
import { Suspense, useEffect, useState } from "react";
import ClassList, { ViewToggle } from "./ClassList";
import { Container, Divider, Typography, Grid } from "@mui/material";
import { useCommunities } from "@/hooks/use-communities";
import { useClasses } from "@/hooks/use-classes";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isAuthenticated } from "@/util/auth/simpleAuth";
import { useRouter } from "next/navigation";
import Loading from "@/components/util/Loading";
import { useUser } from "@/hooks/use-user";

export default function ClassPage({ params }) {
  const { getCommunity, loading: communityLoading } = useCommunities();
  const { getClassesByCommunity, loading: classesLoading } = useClasses();
  const [community, setCommunity] = useState(null);
  const [mergedCommunityData, setMergedCommunityData] = useState(null);
  const [searchTerm, setSearchTerm] = useLocalStorage("classSearch", "");
  const [viewType, setViewType] = useLocalStorage("classViewType", "grid");

  const router = useRouter();
  const { isLoading, isAdmin } = useUser();
  const [loading, setLoading] = useState(true);

  const toggleView = () => {
    setViewType(viewType === "grid" ? "list" : "grid");
  };

  useEffect(() => {
    if (isLoading) return;

    const hasAuth = isAuthenticated(params.id) || isAdmin;
    if (!hasAuth) {
      router.push(process.env.NEXT_PUBLIC_DOMAIN + "/admin-dashboard/classes");
    }

    const fetchData = async () => {
      try {
        // Fetch both community and classes data
        const communityData = await getCommunity(params.id);
        const classesData = await getClassesByCommunity(params.id);

        if (communityData && classesData) {
          // Create a map of classes for quick lookup
          const classesMap = new Map(
            classesData.map((classItem) => [classItem.id, classItem])
          );

          // Deep clone the community data to avoid mutations
          const mergedData = JSON.parse(JSON.stringify(communityData));

          // Merge the data while preserving structure
          mergedData.classes = mergedData.classes.map((category) => {
            if (category.type === "header") {
              return category;
            }

            return {
              ...category,
              classes: category.classes.map((communityClass) => {
                const fullClassData = classesMap.get(communityClass.id);
                return {
                  ...communityClass,
                  ...fullClassData,
                  // Preserve any community-specific overrides
                  title: communityClass.title || fullClassData?.title,
                  icon: communityClass.icon || fullClassData?.icon,
                  visibility:
                    communityClass.visibility ?? fullClassData?.visibility,
                };
              }),
            };
          });

          setCommunity(communityData);
          setMergedCommunityData(mergedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, isLoading, isAdmin]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  if (communityLoading || classesLoading || loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xl">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ my: 3, pt: 4 }}
      >
        {community?.name} Community Classes
      </Typography>

      {/* <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12} sm={6}>
          <pre>{JSON.stringify(mergedCommunityData, null, 2)}</pre>
        </Grid>
        <Grid item xs={12} sm={6} textAlign="right"></Grid>
      </Grid> */}

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search classes..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            backgroundColor: searchTerm ? "#d4e7fa" : "white",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <ViewToggle viewType={viewType} onToggle={toggleView} />
      {/* <pre>{JSON.stringify(mergedCommunityData, null, 2)}</pre> */}
      <Suspense fallback={<div>Loading...</div>}>
        <ClassList
          community={mergedCommunityData}
          searchTerm={searchTerm}
          viewType={viewType}
        />
      </Suspense>
    </Container>
  );
}
