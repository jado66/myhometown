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

export const newToOldCommunity = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd", // Orem - Geneva Heights
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "fb34e335-5cc6-4e6c-b5fc-2b64588fe921", // Orem - Sharon Park
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33", // Provo - Pioneer Park
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34", // Provo - Dixon
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35", // Provo - South Freedom
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37", // Ogden - North
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38", // Ogden - South
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39", // Ogden - West
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a", // Salt Lake City - Central
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b", // Salt Lake City - Northwest
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c", // Salt Lake City - Westside
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d", // West Valley City - Central Granger
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6838adb32243dc8160ce207d", // Layton - Layton
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e", // West Valley City - North East Granger
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f", // West Valley City - West Granger
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40", // West Valley City - Central Valley View
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed", // Santaquin - Santaquin
};

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

    // const hasAuth = isAuthenticated(params.id) || isAdmin;
    // if (!hasAuth) {
    //   router.push(process.env.NEXT_PUBLIC_DOMAIN + "/admin-dashboard/classes");
    // }

    const fetchData = async () => {
      try {
        // Fetch both community and classes data

        const oldCommunityId = newToOldCommunity[params.id] || params.id;

        const communityData = await getCommunity(oldCommunityId);
        const classesData = await getClassesByCommunity(oldCommunityId);
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

  // Refetch mergedCommunityData when a class is updated (e.g., after transfer)
  const refetchCommunityData = async () => {
    setLoading(true);
    try {
      const oldCommunityId = newToOldCommunity[params.id] || params.id;
      const communityData = await getCommunity(oldCommunityId);
      const classesData = await getClassesByCommunity(oldCommunityId);
      if (communityData && classesData) {
        const classesMap = new Map(
          classesData.map((classItem) => [classItem.id, classItem])
        );
        const mergedData = JSON.parse(JSON.stringify(communityData));
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
      console.error("Error refetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <Suspense fallback={<div>Loading...</div>}>
        <ClassList
          community={mergedCommunityData}
          searchTerm={searchTerm}
          viewType={viewType}
          onClassDataUpdate={refetchCommunityData}
          refetchCommunityData={refetchCommunityData}
        />
      </Suspense>
    </Container>
  );
}
